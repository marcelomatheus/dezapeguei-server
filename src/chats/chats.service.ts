import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { handleError } from '../utils/handle-error';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { FindChatsQueryDto } from './dto/find-chats-query.dto';
import { ChatEntity } from './entities/chat.entity';

@Injectable()
export class ChatsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateChatDto): Promise<ChatEntity> {
    try {
      if (dto.userId === dto.user2Id) {
        throw new BadRequestException('Participants must be different users');
      }
      await this.ensureUsers(dto.userId, dto.user2Id);

      const existing = await this.prisma.chat.findFirst({
        where: {
          OR: [
            { userId: dto.userId, user2Id: dto.user2Id },
            { userId: dto.user2Id, user2Id: dto.userId },
          ],
        },
      });
      if (existing)
        return new ChatEntity(existing as unknown as Partial<ChatEntity>);

      const created = await this.prisma.chat.create({
        data: { userId: dto.userId, user2Id: dto.user2Id },
      });
      return new ChatEntity(created as unknown as Partial<ChatEntity>);
    } catch (error) {
      return this.handleServiceError(error, 'ChatsService.create');
    }
  }

  async findAll(query: FindChatsQueryDto): Promise<ChatEntity[]> {
    try {
      const where: Prisma.ChatWhereInput = query.userId
        ? { OR: [{ userId: query.userId }, { user2Id: query.userId }] }
        : {};
      const rows = await this.prisma.chat.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return rows.map(
        (r) => new ChatEntity(r as unknown as Partial<ChatEntity>),
      );
    } catch (error) {
      return this.handleServiceError(error, 'ChatsService.findAll');
    }
  }

  async findById(id: string): Promise<ChatEntity> {
    try {
      const row = await this.prisma.chat.findUnique({ where: { id } });
      if (!row) throw new NotFoundException(`Chat with id ${id} not found`);
      return new ChatEntity(row as unknown as Partial<ChatEntity>);
    } catch (error) {
      return this.handleServiceError(error, 'ChatsService.findById');
    }
  }

  async update(id: string, dto: UpdateChatDto): Promise<ChatEntity> {
    try {
      if (dto.userId && dto.user2Id && dto.userId === dto.user2Id) {
        throw new BadRequestException('Participants must be different users');
      }
      if (dto.userId || dto.user2Id) {
        await this.ensureUsers(dto.userId, dto.user2Id);
      }
      const updated = await this.prisma.chat.update({
        where: { id },
        data: {
          userId: dto.userId ?? undefined,
          user2Id: dto.user2Id ?? undefined,
        },
      });
      return new ChatEntity(updated as unknown as Partial<ChatEntity>);
    } catch (error) {
      return this.handleServiceError(error, 'ChatsService.update');
    }
  }

  async remove(id: string): Promise<ChatEntity> {
    try {
      const deleted = await this.prisma.chat.delete({ where: { id } });
      return new ChatEntity(deleted as unknown as Partial<ChatEntity>);
    } catch (error) {
      return this.handleServiceError(error, 'ChatsService.remove');
    }
  }

  private async ensureUsers(userId?: string, user2Id?: string) {
    const checks: Array<{ id?: string; label: string }> = [
      { id: userId, label: 'userId' },
      { id: user2Id, label: 'user2Id' },
    ];
    for (const c of checks) {
      if (!c.id) continue;
      const exists = await this.prisma.user.findUnique({ where: { id: c.id } });
      if (!exists)
        throw new NotFoundException(`User (${c.label}) ${c.id} not found`);
    }
  }

  private handleServiceError(error: unknown, context: string): never {
    return handleError(
      error instanceof Error ? error : new Error(String(error)),
      context,
    );
  }
}
