import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { handleError } from '../utils/handle-error';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { FindNotificationsQueryDto } from './dto/find-notifications-query.dto';
import { NotificationEntity } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateNotificationDto): Promise<NotificationEntity> {
    try {
      await this.ensureUser(dto.userId);
      const created = await this.prisma.notification.create({
        data: {
          userId: dto.userId,
          message: dto.message,
          isRead: dto.isRead ?? false,
          redirect: dto.redirect ?? null,
        },
      });
      return new NotificationEntity(
        created as unknown as Partial<NotificationEntity>,
      );
    } catch (error) {
      return this.handleServiceError(error, 'NotificationsService.create');
    }
  }

  async findAll(
    query: FindNotificationsQueryDto,
  ): Promise<NotificationEntity[]> {
    try {
      const where: Prisma.NotificationWhereInput = {
        userId: query.userId,
        isRead: query.isRead,
      };
      const rows = await this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return rows.map(
        (r) =>
          new NotificationEntity(r as unknown as Partial<NotificationEntity>),
      );
    } catch (error) {
      return this.handleServiceError(error, 'NotificationsService.findAll');
    }
  }

  async findById(id: string): Promise<NotificationEntity> {
    try {
      const row = await this.prisma.notification.findUnique({ where: { id } });
      if (!row)
        throw new NotFoundException(`Notification with id ${id} not found`);
      return new NotificationEntity(
        row as unknown as Partial<NotificationEntity>,
      );
    } catch (error) {
      return this.handleServiceError(error, 'NotificationsService.findById');
    }
  }

  async update(
    id: string,
    dto: UpdateNotificationDto,
  ): Promise<NotificationEntity> {
    try {
      if (dto.userId) await this.ensureUser(dto.userId);
      const updated = await this.prisma.notification.update({
        where: { id },
        data: {
          userId: dto.userId ?? undefined,
          message: dto.message ?? undefined,
          isRead: dto.isRead ?? undefined,
          redirect: dto.redirect ?? undefined,
        },
      });
      return new NotificationEntity(
        updated as unknown as Partial<NotificationEntity>,
      );
    } catch (error) {
      return this.handleServiceError(error, 'NotificationsService.update');
    }
  }

  async markAsRead(id: string): Promise<NotificationEntity> {
    try {
      const updated = await this.prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });
      return new NotificationEntity(
        updated as unknown as Partial<NotificationEntity>,
      );
    } catch (error) {
      return this.handleServiceError(error, 'NotificationsService.markAsRead');
    }
  }

  async remove(id: string): Promise<NotificationEntity> {
    try {
      const deleted = await this.prisma.notification.delete({ where: { id } });
      return new NotificationEntity(
        deleted as unknown as Partial<NotificationEntity>,
      );
    } catch (error) {
      return this.handleServiceError(error, 'NotificationsService.remove');
    }
  }

  private async ensureUser(userId: string) {
    const exists = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!exists) throw new NotFoundException(`User ${userId} not found`);
  }

  private handleServiceError(error: unknown, context: string): never {
    return handleError(
      error instanceof Error ? error : new Error(String(error)),
      context,
    );
  }
}
