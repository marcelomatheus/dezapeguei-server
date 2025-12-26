import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Wishlist, Offer } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { handleError } from '../utils/handle.errors.util';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { RemoveWishlistItemDto } from './dto/remove-wishlist-item.dto';
import { FindWishlistsQueryDto } from './dto/find-wishlists-query.dto';
import { WishlistEntity } from './entities/wishlist.entity';

@Injectable()
export class WishlistsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: FindWishlistsQueryDto): Promise<WishlistEntity[]> {
    try {
      const where: Prisma.WishlistWhereInput = {
        userId: query.userId,
      };
      const rows = await this.prisma.wishlist.findMany({
        where,
        include: { offer: true },
        orderBy: { createdAt: 'desc' },
      });
      return rows.map((r) => this.mapWishlist(r));
    } catch (error) {
      return handleError(error, 'WishlistsService.findAll');
    }
  }

  async findById(id: string): Promise<WishlistEntity> {
    try {
      const row = await this.prisma.wishlist.findUnique({
        where: { id },
        include: { offer: true },
      });
      if (!row) throw new NotFoundException(`Wishlist entry ${id} not found`);
      return this.mapWishlist(row);
    } catch (error) {
      return handleError(error, 'WishlistsService.findById');
    }
  }

  async addItem(dto: AddWishlistItemDto): Promise<WishlistEntity> {
    try {
      await this.ensureUser(dto.userId);
      await this.ensureOffer(dto.offerId);

      const entry = await this.prisma.wishlist.upsert({
        where: { userId_offerId: { userId: dto.userId, offerId: dto.offerId } },
        update: {},
        create: { userId: dto.userId, offerId: dto.offerId },
        include: { offer: true },
      });

      return this.mapWishlist(entry);
    } catch (error) {
      return handleError(error, 'WishlistsService.addItem');
    }
  }

  async removeItem(dto: RemoveWishlistItemDto): Promise<void> {
    try {
      await this.prisma.wishlist.delete({
        where: { userId_offerId: { userId: dto.userId, offerId: dto.offerId } },
      });
    } catch (error) {
      return handleError(error, 'WishlistsService.removeItem');
    }
  }

  private async ensureUser(userId: string) {
    const exists = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!exists) throw new NotFoundException(`User ${userId} not found`);
  }

  private async ensureOffer(offerId: string) {
    const exists = await this.prisma.offer.findUnique({
      where: { id: offerId },
    });
    if (!exists) throw new NotFoundException(`Offer ${offerId} not found`);
  }

  private mapWishlist(
    wishlist: Wishlist & { offer?: Offer | null },
  ): WishlistEntity {
    return new WishlistEntity({
      id: wishlist.id,
      userId: wishlist.userId,
      offerId: wishlist.offerId ?? undefined,
      createdAt: wishlist.createdAt,
      offer: wishlist.offer ?? undefined,
    });
  }
}
