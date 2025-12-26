import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { handleError } from '../utils/handle.errors.util';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { FindChatsQueryDto } from './dto/find-chats-query.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateChatDto) {
    try {
      const participantIds = this.normalizeParticipants(dto.participantIds);
      this.ensureMinParticipants(participantIds, dto.isGroup ?? false);
      if (dto.isGroup && !dto.name) {
        throw new BadRequestException('Group chats require a name');
      }

      await this.ensureUsers(participantIds);

      if (!dto.isGroup) {
        const existing = await this.findExistingDirectChat(participantIds);
        if (existing) {
          return existing;
        }
      }

      const created = await this.prisma.chat.create({
        data: {
          isGroup: dto.isGroup ?? false,
          name: dto.name ?? null,
          participants: {
            createMany: {
              data: participantIds.map((userId) => ({ userId })),
            },
          },
        },
        include: { participants: { include: { user: true } } },
      });
      return created;
    } catch (error) {
      return handleError(error, 'ChatService.create');
    }
  }

  async findAll(query: FindChatsQueryDto) {
    try {
      const where: Prisma.ChatWhereInput = {
        participants: query.userId
          ? {
              some: { userId: query.userId },
            }
          : undefined,
        isGroup: typeof query.isGroup === 'boolean' ? query.isGroup : undefined,
      };

      if (query.participantIds?.length) {
        const ids = [...new Set(query.participantIds)].filter(Boolean);

        const existingAND = Array.isArray(where.AND)
          ? where.AND
          : where.AND
            ? [where.AND]
            : [];

        where.AND = [
          ...existingAND,
          ...ids.map((userId) => ({ participants: { some: { userId } } })),
          {
            participants: {
              every: { userId: { in: ids } },
            },
          },
        ];
      }
      const rows = await this.prisma.chat.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        include: { participants: { include: { user: true } } },
      });

      return rows;
    } catch (error) {
      return handleError(error, 'ChatService.findAll');
    }
  }

  async findById(id: string) {
    try {
      const row = await this.prisma.chat.findUnique({
        where: { id },
        include: { participants: { include: { user: true } } },
      });
      if (!row) throw new NotFoundException(`Chat with id ${id} not found`);
      return row;
    } catch (error) {
      return handleError(error, 'ChatService.findById');
    }
  }

  async update(id: string, dto: UpdateChatDto) {
    try {
      const existing = await this.prisma.chat.findUnique({
        where: { id },
        include: { participants: { include: { user: true } } },
      });
      if (!existing) {
        throw new NotFoundException(`Chat with id ${id} not found`);
      }

      let participantIds: string[] | undefined;
      if (dto.participantIds && dto.participantIds.length) {
        participantIds = this.normalizeParticipants(dto.participantIds);
        this.ensureMinParticipants(
          participantIds,
          dto.isGroup ?? existing.isGroup,
        );
        await this.ensureUsers(participantIds);
      }

      const targetIsGroup = dto.isGroup ?? existing.isGroup;
      const targetName = dto.name ?? existing.name;
      if (targetIsGroup && !targetName) {
        throw new BadRequestException('Group chats must have a name');
      }

      const updated = await this.prisma.$transaction(async (tx) => {
        if (participantIds) {
          await tx.participant.deleteMany({
            where: {
              chatId: id,
              userId: { notIn: participantIds },
            },
          });

          const current = await tx.participant.findMany({
            where: { chatId: id },
            select: { userId: true },
          });
          const existingIds = current.map((p) => p.userId);
          const toCreate = participantIds.filter(
            (userId) => !existingIds.includes(userId),
          );
          if (toCreate.length) {
            await tx.participant.createMany({
              data: toCreate.map((userId) => ({ chatId: id, userId })),
            });
          }
        }

        return tx.chat.update({
          where: { id },
          data: {
            isGroup: dto.isGroup ?? undefined,
            name: dto.name ?? undefined,
          },
          include: { participants: { include: { user: true } } },
        });
      });
      return updated;
    } catch (error) {
      return handleError(error, 'ChatService.update');
    }
  }

  async remove(id: string) {
    try {
      const deleted = await this.prisma.chat.delete({
        where: { id },
        include: { participants: true },
      });
      return deleted;
    } catch (error) {
      return handleError(error, 'ChatService.remove');
    }
  }

  async findOrCreateDirectChat(userA: string, userB: string) {
    try {
      const participantIds = this.normalizeParticipants([userA, userB]);
      this.ensureMinParticipants(participantIds, false);
      await this.ensureUsers(participantIds);
      const existing = await this.findExistingDirectChat(participantIds);
      if (existing) {
        return existing;
      }

      const created = await this.prisma.chat.create({
        data: {
          isGroup: false,
          participants: {
            createMany: {
              data: participantIds.map((userId) => ({ userId })),
            },
          },
        },
        include: { participants: { include: { user: true } } },
      });
      return created;
    } catch (error) {
      return handleError(error as Error, 'ChatService.findOrCreateDirectChat');
    }
  }

  private ensureMinParticipants(participantIds: string[], isGroup?: boolean) {
    if (!participantIds.length) {
      throw new BadRequestException('Participants list cannot be empty');
    }
    if (!isGroup && participantIds.length < 2) {
      throw new BadRequestException(
        'Chats must contain at least two unique participants',
      );
    }
    if (isGroup && participantIds.length < 3) {
      throw new BadRequestException(
        'Group chats must contain at least three participants',
      );
    }
  }

  private normalizeParticipants(participantIds: string[]): string[] {
    return [...new Set(participantIds.filter(Boolean))].sort();
  }

  private async ensureUsers(participantIds: string[]) {
    const rows = await this.prisma.user.findMany({
      where: { id: { in: participantIds } },
      select: { id: true },
    });
    if (rows.length !== participantIds.length) {
      const missing = participantIds.filter(
        (participant) => !rows.some((row) => row.id === participant),
      );
      throw new NotFoundException(`User(s) not found: ${missing.join(', ')}`);
    }
  }

  private async findExistingDirectChat(participantIds: string[]) {
    const [userA, userB] = participantIds;
    if (!userA || !userB) return null;

    return this.prisma.chat.findFirst({
      where: {
        isGroup: false,
        AND: [
          { participants: { some: { userId: userA } } },
          { participants: { some: { userId: userB } } },
        ],
        participants: {
          every: {
            userId: { in: participantIds },
          },
        },
      },
      include: { participants: { include: { user: true } } },
    });
  }
}
