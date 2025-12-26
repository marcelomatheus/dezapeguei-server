import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, OfferStatus } from '@prisma/client';
import { handleError } from '../utils/handle.errors.util';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { StorageBucketType } from '../storage/entity/bucket.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { FindOffersQueryDto } from './dto/find-offers-query.dto';
import { OfferEntity } from './entities/offer.entity';

@Injectable()
export class OffersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async create(dto: CreateOfferDto): Promise<OfferEntity> {
    try {
      await this.ensureRelations(dto.categoryId, dto.sellerId);

      const slugBase = this.slugify(dto.title);
      const slug = await this.ensureUniqueSlug(slugBase);

      return await this.prisma.offer.create({
        data: {
          title: dto.title,
          description: dto.description,
          price: dto.price,
          promotion: dto.promotion ?? null,
          categoryId: dto.categoryId,
          sellerId: dto.sellerId,
          status: dto.status ?? OfferStatus.ACTIVE,
          slug,
          imageUrl: dto.imageUrl ?? [],
          specifications: dto.specifications
            ? {
                create: dto.specifications.map((s) => ({
                  key: s.key,
                  value: s.value,
                })),
              }
            : undefined,
          keywords: dto.keywords
            ? {
                connectOrCreate: dto.keywords.map((word) => ({
                  where: { word },
                  create: { word },
                })),
              }
            : undefined,
        },
        include: { keywords: true, specifications: true },
      });
    } catch (error) {
      return this.handleServiceError(error, 'OffersService.create');
    }
  }

  async findAll(query: FindOffersQueryDto): Promise<OfferEntity[]> {
    try {
      const where: Prisma.OfferWhereInput = {
        status: query.status,
        sellerId: query.sellerId,
        categoryId: query.categoryId,
        OR: query.search
          ? [
              { title: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ]
          : undefined,
      };

      return await this.prisma.offer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          keywords: true,
          specifications: true,
          seller: {
            select: {
              id: true,
              name: true,
              avatar: true,
              rating: true,
            },
          },
        },
      });
    } catch (error) {
      return this.handleServiceError(error, 'OffersService.findAll');
    }
  }

  async findById(id: string): Promise<OfferEntity> {
    try {
      const offer = await this.prisma.offer.findUnique({
        where: { id },
        include: {
          keywords: true,
          specifications: true,
          seller: {
            select: {
              id: true,
              name: true,
              avatar: true,
              rating: true,
              city: true,
              state: true,
            },
          },
        },
      });

      if (!offer) {
        throw new NotFoundException(`Offer with id ${id} not found`);
      }
      return offer;
    } catch (error) {
      return this.handleServiceError(error, 'OffersService.findById');
    }
  }

  async update(id: string, dto: UpdateOfferDto): Promise<OfferEntity> {
    try {
      if (dto.categoryId || dto.sellerId) {
        await this.ensureRelations(dto.categoryId, dto.sellerId);
      }

      const data: Prisma.OfferUpdateInput = {
        title: dto.title,
        description: dto.description,
        price: dto.price,
        promotion: dto.promotion ?? undefined,
        imageUrl: dto.imageUrl ?? undefined,
        category: dto.categoryId
          ? { connect: { id: dto.categoryId } }
          : undefined,
        seller: dto.sellerId ? { connect: { id: dto.sellerId } } : undefined,
        status: dto.status,
      };

      if (dto.title) {
        const slugBase = this.slugify(dto.title);
        data.slug = await this.ensureUniqueSlug(slugBase, id);
      }

      if (dto.specifications) {
        await this.prisma.specification.deleteMany({ where: { offerId: id } });
        (data as Prisma.OfferUncheckedUpdateInput).specifications = {
          create: dto.specifications.map((s) => ({
            key: s.key,
            value: s.value,
          })),
        };
      }

      if (dto.keywords) {
        const current = await this.prisma.offer.findUnique({
          where: { id },
          select: { keywords: { select: { id: true } } },
        });
        const disconnect = current?.keywords.map((k) => ({ id: k.id })) ?? [];
        (data as Prisma.OfferUncheckedUpdateInput).keywords = {
          set: [],
          disconnect,
          connectOrCreate: dto.keywords.map((word) => ({
            where: { word },
            create: { word },
          })),
        };
      }

      const updated = await this.prisma.offer.update({
        where: { id },
        data,
        include: { keywords: true, specifications: true },
      });
      return new OfferEntity(updated as unknown as Partial<OfferEntity>);
    } catch (error) {
      return this.handleServiceError(error, 'OffersService.update');
    }
  }

  async remove(id: string): Promise<OfferEntity> {
    try {
      await this.prisma.specification.deleteMany({ where: { offerId: id } });
      const deleted = await this.prisma.offer.delete({
        where: { id },
        include: { keywords: true, specifications: true },
      });
      return new OfferEntity(deleted as unknown as Partial<OfferEntity>);
    } catch (error) {
      return this.handleServiceError(error, 'OffersService.remove');
    }
  }

  private async ensureRelations(categoryId?: string, sellerId?: string) {
    if (categoryId) {
      const exists = await this.prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!exists)
        throw new NotFoundException(`Category with id ${categoryId} not found`);
    }
    if (sellerId) {
      const exists = await this.prisma.user.findUnique({
        where: { id: sellerId },
      });
      if (!exists)
        throw new NotFoundException(
          `User (seller) with id ${sellerId} not found`,
        );
    }
  }

  private slugify(text: string): string {
    return text
      .toString()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  private async ensureUniqueSlug(
    base: string,
    ignoreId?: string,
  ): Promise<string> {
    let slug = base;
    let suffix = 0;
    while (true) {
      const existing = await this.prisma.offer.findFirst({
        where: { slug, NOT: ignoreId ? { id: ignoreId } : undefined },
        select: { id: true },
      });
      if (!existing) return slug;
      suffix += 1;
      slug = `${base}-${suffix}`;
    }
  }

  async uploadImages(
    files: Array<Express.Multer.File>,
  ): Promise<{ imageUrls: string[] }> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No images provided');
    }

    if (files.length > 5) {
      throw new BadRequestException('Maximum 5 images allowed');
    }

    try {
      const uploadPromises = files.map(async (file) => {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const fileName = `${timestamp}-${randomString}`;
        const path = `offers/${fileName}`;

        const result = await this.storageService.uploadFile(
          file,
          path,
          StorageBucketType.IMAGES,
        );

        return result.publicUrl;
      });

      const imageUrls = await Promise.all(uploadPromises);
      return { imageUrls };
    } catch (error) {
      throw new BadRequestException(
        `Failed to upload images: ${error.message}`,
      );
    }
  }

  private handleServiceError(error: unknown, context: string): never {
    return handleError(
      error instanceof Error ? error : new Error(String(error)),
      context,
    );
  }
}
