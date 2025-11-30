import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { handleError } from '../utils/handle-error';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { FindWishlistsQueryDto } from './dto/find-wishlists-query.dto';
import { WishlistEntity } from './entities/wishlist.entity';

@Injectable()
export class WishlistsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWishlistDto): Promise<WishlistEntity> {
    try {
      await this.ensureUser(dto.userId);
      const exists = await this.prisma.wishlist.findUnique({
        where: { userId: dto.userId },
      });
      if (exists)
        throw new Error(`Wishlist for user ${dto.userId} already exists`);

      const created = await this.prisma.wishlist.create({
        data: { name: dto.name, userId: dto.userId },
      });
      return new WishlistEntity(created as unknown as Partial<WishlistEntity>);
    } catch (error) {
      return this.handleServiceError(error, 'WishlistsService.create');
    }
  }

  async findAll(query: FindWishlistsQueryDto): Promise<WishlistEntity[]> {
    try {
      const where: Prisma.WishlistWhereInput = { userId: query.userId };
      const rows = await this.prisma.wishlist.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return rows.map(
        (r) => new WishlistEntity(r as unknown as Partial<WishlistEntity>),
      );
    } catch (error) {
      return this.handleServiceError(error, 'WishlistsService.findAll');
    }
  }

  async findById(id: string): Promise<WishlistEntity> {
    try {
      const row = await this.prisma.wishlist.findUnique({ where: { id } });
      if (!row) throw new NotFoundException(`Wishlist with id ${id} not found`);
      return new WishlistEntity(row as unknown as Partial<WishlistEntity>);
    } catch (error) {
      return this.handleServiceError(error, 'WishlistsService.findById');
    }
  }

  async update(id: string, dto: UpdateWishlistDto): Promise<WishlistEntity> {
    try {
      if (dto.userId) await this.ensureUser(dto.userId);
      const updated = await this.prisma.wishlist.update({
        where: { id },
        data: {
          name: dto.name ?? undefined,
          userId: dto.userId ?? undefined,
        },
      });
      return new WishlistEntity(updated as unknown as Partial<WishlistEntity>);
    } catch (error) {
      return this.handleServiceError(error, 'WishlistsService.update');
    }
  }

  async remove(id: string): Promise<WishlistEntity> {
    try {
      const deleted = await this.prisma.wishlist.delete({ where: { id } });
      return new WishlistEntity(deleted as unknown as Partial<WishlistEntity>);
    } catch (error) {
      return this.handleServiceError(error, 'WishlistsService.remove');
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
