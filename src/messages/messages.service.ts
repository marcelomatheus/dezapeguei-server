import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { handleError } from '../utils/handle.errors.util';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { FindMessagesQueryDto } from './dto/find-messages-query.dto';
import { MessageEntity } from './entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMessageDto): Promise<MessageEntity> {
    try {
      const chat = await this.prisma.chat.findUnique({
        where: { id: dto.chatId },
        include: { participants: true },
      });
      if (!chat)
        throw new NotFoundException(`Chat with id ${dto.chatId} not found`);
      const sender = await this.prisma.user.findUnique({
        where: { id: dto.senderId },
      });
      if (!sender)
        throw new NotFoundException(`Sender with id ${dto.senderId} not found`);
      if (!chat.participants.some((p) => p.userId === dto.senderId)) {
        throw new BadRequestException(
          'Sender must be a participant of the chat',
        );
      }

      const created = await this.prisma.message.create({
        data: {
          chatId: dto.chatId,
          content: dto.content,
          senderId: dto.senderId,
        },
      });
      return new MessageEntity(created as unknown as Partial<MessageEntity>);
    } catch (error) {
      return this.handleServiceError(error, 'MessagesService.create');
    }
  }

  async findAll(query: FindMessagesQueryDto): Promise<MessageEntity[]> {
    try {
      const where: Prisma.MessageWhereInput = {};
      if (query.chatId) {
        where.chatId = query.chatId;
      }
      if (query.senderId) {
        where.senderId = query.senderId;
      }
      const rows = await this.prisma.message.findMany({
        where,
        orderBy: { createdAt: 'asc' },
      });

      return rows.map(
        (r) => new MessageEntity(r as unknown as Partial<MessageEntity>),
      );
    } catch (error) {
      return this.handleServiceError(error, 'MessagesService.findAll');
    }
  }

  async findById(id: string): Promise<MessageEntity> {
    try {
      const row = await this.prisma.message.findUnique({ where: { id } });
      if (!row) throw new NotFoundException(`Message with id ${id} not found`);
      return new MessageEntity(row as unknown as Partial<MessageEntity>);
    } catch (error) {
      return this.handleServiceError(error, 'MessagesService.findById');
    }
  }

  async update(id: string, dto: UpdateMessageDto): Promise<MessageEntity> {
    try {
      const updated = await this.prisma.message.update({
        where: { id },
        data: {
          content: dto.content ?? undefined,
          status: dto.status ?? undefined,
          readAt: dto.readAt ?? undefined,
        },
      });
      return new MessageEntity(updated as unknown as Partial<MessageEntity>);
    } catch (error) {
      return this.handleServiceError(error, 'MessagesService.update');
    }
  }

  async remove(id: string): Promise<MessageEntity> {
    try {
      const deleted = await this.prisma.message.delete({ where: { id } });
      return new MessageEntity(deleted as unknown as Partial<MessageEntity>);
    } catch (error) {
      return this.handleServiceError(error, 'MessagesService.remove');
    }
  }

  async getMessagesSince(
    userId: string,
    since?: Date,
  ): Promise<MessageEntity[]> {
    try {
      const rows = await this.prisma.message.findMany({
        where: {
          createdAt: since ? { gt: since } : undefined,
          chat: {
            participants: {
              some: { userId },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
      return rows.map(
        (r) => new MessageEntity(r as unknown as Partial<MessageEntity>),
      );
    } catch (error) {
      return this.handleServiceError(error, 'MessagesService.getMessagesSince');
    }
  }

  private handleServiceError(error: unknown, context: string): never {
    return handleError(
      error instanceof Error ? error : new Error(String(error)),
      context,
    );
  }
}
