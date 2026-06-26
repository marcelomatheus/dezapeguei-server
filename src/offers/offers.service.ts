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
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { FindOffersQueryDto } from './dto/find-offers-query.dto';
import { OfferResponseDto } from './dto/offer-response.dto';
import { EntrepreneurAccessService } from '../entrepreneur/entrepreneur-access.service';

@Injectable()
export class OffersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly notificationsService: NotificationsService,
    private readonly entrepreneurAccessService: EntrepreneurAccessService,
  ) {}

  async create(dto: CreateOfferDto): Promise<OfferResponseDto> {
    try {
      await this.ensureRelations(dto.categoryId, dto.sellerId);

      const slugBase = this.slugify(dto.title);
      const slug = await this.ensureUniqueSlug(slugBase);

      const created = await this.prisma.offer.create({
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
      return this.toOfferResponse(created, 0);
    } catch (error) {
      return this.handleServiceError(error, 'OffersService.create');
    }
  }

  async findAll(query: FindOffersQueryDto): Promise<OfferResponseDto[]> {
    try {
      if (query.search) {
        const conditions: Prisma.Sql[] = [Prisma.sql`o."deletedAt" IS NULL`];

        if (query.status) {
          conditions.push(
            Prisma.sql`o."status" = ${query.status}::"OfferStatus"`,
          );
        }
        if (query.sellerId) {
          conditions.push(Prisma.sql`o."sellerId" = ${query.sellerId}`);
        }
        if (query.categoryId) {
          conditions.push(Prisma.sql`o."categoryId" = ${query.categoryId}`);
        }

        const vector = Prisma.sql`
          to_tsvector(
            'portuguese',
            coalesce(o."title", '') || ' ' ||
            coalesce(o."description", '') || ' ' ||
            coalesce((
              SELECT string_agg(k."word", ' ')
              FROM "_KeywordToOffer" ko
              JOIN "Keyword" k ON k."id" = ko."A"
              WHERE ko."B" = o."id"
            ), '')
          )
        `;

        const rankedOffers = await this.prisma.$queryRaw<Array<{ id: string }>>(
          Prisma.sql`
            SELECT o."id"
            FROM "Offer" o
            LEFT JOIN "User" u ON u."id" = o."sellerId"
            LEFT JOIN "EntrepreneurProfile" ep ON ep."userId" = u."id"
            WHERE ${Prisma.join(conditions, ' AND ')}
              AND ${vector} @@ plainto_tsquery('portuguese', ${query.search})
            ORDER BY ts_rank(${vector}, plainto_tsquery('portuguese', ${query.search})) DESC,
                     CASE WHEN u."entrepreneurVerifiedAt" IS NOT NULL
                       AND ep."status" = 'APPROVED'
                       AND EXISTS (
                         SELECT 1
                         FROM "EntrepreneurSubscription" es
                         WHERE es."userId" = u."id"
                           AND es."status" = 'ACTIVE'
                           AND es."expiresAt" > now()
                       )
                     THEN 1 ELSE 0 END DESC,
                     o."createdAt" DESC
          `,
        );

        if (rankedOffers.length === 0) {
          return [];
        }

        const rankMap = new Map(
          rankedOffers.map((item, index) => [item.id, index]),
        );

        const offers = await this.prisma.offer.findMany({
          where: { id: { in: rankedOffers.map((item) => item.id) } },
          include: {
            _count: {
              select: {
                wishlist: true,
              },
            },
            keywords: true,
            specifications: true,
            seller: this.sellerInclude(),
          },
        });

        const mapped = await Promise.all(
          offers
            .sort((a, b) => {
            const rankA = rankMap.get(a.id) ?? Number.MAX_SAFE_INTEGER;
            const rankB = rankMap.get(b.id) ?? Number.MAX_SAFE_INTEGER;
            if (rankA !== rankB) return rankA - rankB;
            return +new Date(b.createdAt) - +new Date(a.createdAt);
          })
            .map((offer) =>
              this.toOfferResponse(offer, offer._count?.wishlist ?? 0),
            ),
        );

        return mapped;
      }

      const where: Prisma.OfferWhereInput = {
        status: query.status,
        sellerId: query.sellerId,
        categoryId: query.categoryId,
        deletedAt: null,
      };

      const offers = await this.prisma.offer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              wishlist: true,
            },
          },
          keywords: true,
          specifications: true,
          seller: this.sellerInclude(),
        },
      });
      const mapped = await Promise.all(
        offers.map((offer) =>
          this.toOfferResponse(offer, offer._count?.wishlist ?? 0),
        ),
      );
      return this.prioritizeEntrepreneurOffers(mapped);
    } catch (error) {
      return this.handleServiceError(error, 'OffersService.findAll');
    }
  }

  async findById(id: string): Promise<OfferResponseDto> {
    try {
      const offer = await this.prisma.offer.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              wishlist: true,
            },
          },
          keywords: true,
          specifications: true,
          seller: this.sellerInclude(),
        },
      });

      if (!offer) {
        throw new NotFoundException(`Offer with id ${id} not found`);
      }
      return this.toOfferResponse(offer, offer._count?.wishlist ?? 0);
    } catch (error) {
      return this.handleServiceError(error, 'OffersService.findById');
    }
  }

  async update(id: string, dto: UpdateOfferDto): Promise<OfferResponseDto> {
    try {
      if (dto.categoryId || dto.sellerId) {
        await this.ensureRelations(dto.categoryId, dto.sellerId);
      }

      const currentOffer =
        dto.price !== undefined
          ? await this.prisma.offer.findUnique({
              where: { id },
              select: {
                id: true,
                title: true,
                price: true,
              },
            })
          : null;

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
        include: {
          _count: {
            select: {
              wishlist: true,
            },
          },
          keywords: true,
          specifications: true,
        },
      });

      if (
        currentOffer &&
        dto.price !== undefined &&
        dto.price < currentOffer.price
      ) {
        await this.notifyWishlistersPriceDrop(
          id,
          currentOffer.title,
          currentOffer.price,
          dto.price,
        );
      }

      return this.toOfferResponse(updated, updated._count?.wishlist ?? 0);
    } catch (error) {
      return this.handleServiceError(error, 'OffersService.update');
    }
  }

  async updateStatus(
    id: string,
    status: OfferStatus,
  ): Promise<OfferResponseDto> {
    return this.update(id, { status });
  }

  async remove(id: string): Promise<OfferResponseDto> {
    try {
      await this.prisma.specification.deleteMany({ where: { offerId: id } });
      const deleted = await this.prisma.offer.delete({
        where: { id },
        include: {
          keywords: true,
          specifications: true,
        },
      });
      return this.toOfferResponse(deleted, 0);
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
    const existingSlugs = await this.prisma.offer.findMany({
      where: {
        NOT: ignoreId ? { id: ignoreId } : undefined,
        OR: [{ slug: base }, { slug: { startsWith: `${base}-` } }],
      },
      select: { slug: true },
    });

    if (existingSlugs.length === 0) {
      return base;
    }

    const usedSlugs = new Set(existingSlugs.map((entry) => entry.slug));
    if (!usedSlugs.has(base)) {
      return base;
    }

    const suffixes = [...usedSlugs]
      .map((slug) => {
        const match = new RegExp(`^${base}-(\\d+)$`).exec(slug);
        return match ? Number(match[1]) : null;
      })
      .filter((value): value is number => value !== null);

    const nextSuffix = (suffixes.length > 0 ? Math.max(...suffixes) : 0) + 1;
    return `${base}-${nextSuffix}`;
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
        `Failed to upload images: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private handleServiceError(error: unknown, context: string): never {
    return handleError(
      error instanceof Error ? error : new Error(String(error)),
      context,
    );
  }

  private sellerInclude() {
    return {
      select: {
        id: true,
        name: true,
        avatar: true,
        rating: true,
        city: true,
        state: true,
        entrepreneurVerifiedAt: true,
        entrepreneurProfile: {
          select: {
            businessName: true,
            status: true,
            verifiedAt: true,
          },
        },
        entrepreneurStorefront: {
          select: { slug: true },
        },
        entrepreneurSubscriptions: {
          where: {
            status: 'ACTIVE' as const,
            expiresAt: { gt: new Date() },
          },
          select: { id: true },
          take: 1,
        },
      },
    };
  }

  private async toOfferResponse(
    offer: Record<string, any>,
    wishlistCount: number,
  ): Promise<OfferResponseDto> {
    const seller = offer.seller;
    const entrepreneur =
      seller?.id !== undefined
        ? this.entrepreneurSummaryFromSeller(seller)
        : offer.sellerId
          ? await this.entrepreneurAccessService.getSummary(offer.sellerId)
          : {
              isActive: false,
              verifiedAt: null,
              businessName: null,
              storefrontSlug: null,
            };

    return new OfferResponseDto({
      ...(offer as unknown as Partial<OfferResponseDto>),
      seller: seller
        ? {
            id: seller.id,
            name: seller.name,
            avatar: seller.avatar,
            rating: seller.rating,
            entrepreneur,
          }
        : undefined,
      wishlistCount,
      badges: entrepreneur.isActive ? ['ENTREPRENEUR_VERIFIED'] : [],
    });
  }

  private entrepreneurSummaryFromSeller(seller: Record<string, any>) {
    const profile = seller.entrepreneurProfile;
    const isActive = Boolean(
      seller.entrepreneurVerifiedAt &&
        profile?.status === 'APPROVED' &&
        seller.entrepreneurSubscriptions?.length > 0,
    );

    return {
      isActive,
      verifiedAt: isActive
        ? (profile?.verifiedAt ?? seller.entrepreneurVerifiedAt ?? null)
        : null,
      businessName: profile?.businessName ?? null,
      storefrontSlug: seller.entrepreneurStorefront?.slug ?? null,
    };
  }

  private prioritizeEntrepreneurOffers(offers: OfferResponseDto[]) {
    return [...offers].sort((a, b) => {
      const aBadge = a.badges.includes('ENTREPRENEUR_VERIFIED') ? 1 : 0;
      const bBadge = b.badges.includes('ENTREPRENEUR_VERIFIED') ? 1 : 0;
      if (aBadge !== bBadge) return bBadge - aBadge;
      return 0;
    });
  }

  private async notifyWishlistersPriceDrop(
    offerId: string,
    offerTitle: string,
    oldPrice: number,
    newPrice: number,
  ): Promise<void> {
    const wishlisters = await this.prisma.wishlist.findMany({
      where: { offerId },
      select: {
        userId: true,
      },
    });

    if (wishlisters.length === 0) {
      return;
    }

    await Promise.all(
      wishlisters.map((entry) =>
        this.notificationsService.create({
          userId: entry.userId,
          message: `Preço de "${offerTitle}" caiu de R$ ${oldPrice.toFixed(2)} para R$ ${newPrice.toFixed(2)}.`,
          redirect: `/offers/${offerId}`,
          isRead: false,
        }),
      ),
    );
  }
}
