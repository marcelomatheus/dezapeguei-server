import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OfferStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EntrepreneurValidationDto } from './dto/entrepreneur-validation.dto';
import { UpdateStorefrontDto } from './dto/update-storefront.dto';
import { FeaturedOfferDto } from './dto/featured-offer.dto';
import { QuickReplyDto } from './dto/quick-reply.dto';
import { EntrepreneurAccessService } from './entrepreneur-access.service';

@Injectable()
export class EntrepreneurService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: EntrepreneurAccessService,
  ) {}

  async submitValidation(userId: string, dto: EntrepreneurValidationDto) {
    if (!dto.acceptedTerms) {
      throw new BadRequestException('Terms must be accepted');
    }

    const current = await this.prisma.entrepreneurProfile.findUnique({
      where: { userId },
    });
    const active = await this.access.isActiveEntrepreneur(userId);

    if (current?.status === 'APPROVED' && active) {
      return {
        profile: current,
        alreadyEntrepreneur: true,
        canStartCheckout: false,
      };
    }

    if (current?.status === 'SUSPENDED') {
      throw new ForbiddenException('Entrepreneur profile is suspended');
    }

    const profile = await this.prisma.entrepreneurProfile.upsert({
      where: { userId },
      create: {
        userId,
        businessName: dto.businessName,
        document: dto.document,
        businessType: dto.businessType,
        description: dto.description,
        phone: dto.phone ?? null,
        instagram: dto.instagram ?? null,
        website: dto.website ?? null,
        city: dto.city ?? null,
        state: dto.state ?? null,
        status: 'PENDING',
      },
      update: {
        businessName: dto.businessName,
        document: dto.document,
        businessType: dto.businessType,
        description: dto.description,
        phone: dto.phone ?? null,
        instagram: dto.instagram ?? null,
        website: dto.website ?? null,
        city: dto.city ?? null,
        state: dto.state ?? null,
        status: current?.status === 'APPROVED' ? 'APPROVED' : 'PENDING',
      },
    });

    await this.ensureDefaultStorefront(userId, dto.businessName);

    return {
      profile,
      alreadyEntrepreneur: false,
      canStartCheckout: true,
    };
  }

  async getMe(userId: string) {
    const [profile, subscriptions, sessions, storefront, quickReplies] =
      await Promise.all([
        this.prisma.entrepreneurProfile.findUnique({ where: { userId } }),
        this.prisma.entrepreneurSubscription.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.paymentSession.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
        this.prisma.entrepreneurStorefront.findUnique({ where: { userId } }),
        this.prisma.entrepreneurQuickReply.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

    return {
      profile,
      subscription: subscriptions[0] ?? null,
      paymentSessions: sessions,
      storefront,
      quickReplies,
      entrepreneur: await this.access.getSummary(userId),
    };
  }

  async getDashboard(userId: string) {
    const [
      me,
      offerCount,
      featuredOffers,
      favoritesCount,
      messagesReceived,
      communityMemberships,
    ] = await Promise.all([
      this.getMe(userId),
      this.prisma.offer.count({ where: { sellerId: userId } }),
      this.prisma.entrepreneurFeaturedOffer.findMany({
        where: { userId },
        include: { offer: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.wishlist.count({
        where: { offer: { sellerId: userId } },
      }),
      this.prisma.message.count({
        where: {
          chat: { participants: { some: { userId } } },
          senderId: { not: userId },
        },
      }),
      this.prisma.communityMember.findMany({
        where: { userId },
        include: { community: true },
      }),
    ]);

    return {
      ...me,
      metrics: {
        offerViews: 0,
        contactClicks: messagesReceived,
        favoritesCount,
        messagesReceived,
        offerCount,
      },
      featuredOffers,
      communities: communityMemberships.map((entry) => entry.community),
    };
  }

  async getPublicProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatar: true,
        rating: true,
        createdAt: true,
        entrepreneurProfile: true,
        entrepreneurStorefront: true,
        offers: {
          where: { status: OfferStatus.ACTIVE, deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Entrepreneur not found');
    }

    return {
      ...user,
      entrepreneur: await this.access.getSummary(id),
    };
  }

  async updateStorefront(userId: string, dto: UpdateStorefrontDto) {
    await this.requireActiveEntrepreneur(userId);
    const slug = dto.slug ? this.slugify(dto.slug) : undefined;

    return this.prisma.entrepreneurStorefront.upsert({
      where: { userId },
      create: {
        userId,
        slug: slug ?? (await this.defaultStorefrontSlug(userId)),
        bannerUrl: dto.bannerUrl ?? null,
        logoUrl: dto.logoUrl ?? null,
        description: dto.description ?? null,
        whatsapp: dto.whatsapp ?? null,
      },
      update: {
        slug,
        bannerUrl: dto.bannerUrl,
        logoUrl: dto.logoUrl,
        description: dto.description,
        whatsapp: dto.whatsapp,
      },
    });
  }

  async addFeaturedOffer(userId: string, dto: FeaturedOfferDto) {
    await this.requireActiveEntrepreneur(userId);
    const offer = await this.prisma.offer.findUnique({
      where: { id: dto.offerId },
      select: { id: true, sellerId: true, status: true },
    });

    if (!offer || offer.sellerId !== userId) {
      throw new NotFoundException('Offer not found');
    }
    if (offer.status !== OfferStatus.ACTIVE) {
      throw new BadRequestException('Only active offers can be featured');
    }

    const count = await this.prisma.entrepreneurFeaturedOffer.count({
      where: { userId },
    });
    if (count >= 3) {
      throw new BadRequestException('Maximum of 3 featured offers reached');
    }

    return this.prisma.entrepreneurFeaturedOffer.upsert({
      where: { userId_offerId: { userId, offerId: dto.offerId } },
      create: { userId, offerId: dto.offerId },
      update: {},
    });
  }

  async removeFeaturedOffer(userId: string, offerId: string) {
    await this.prisma.entrepreneurFeaturedOffer.deleteMany({
      where: { userId, offerId },
    });
    return { success: true };
  }

  async createQuickReply(userId: string, dto: QuickReplyDto) {
    await this.requireActiveEntrepreneur(userId);
    return this.prisma.entrepreneurQuickReply.create({
      data: { userId, title: dto.title, content: dto.content },
    });
  }

  async updateQuickReply(userId: string, id: string, dto: QuickReplyDto) {
    await this.requireActiveEntrepreneur(userId);
    const updated = await this.prisma.entrepreneurQuickReply.updateMany({
      where: { id, userId },
      data: { title: dto.title, content: dto.content },
    });
    if (!updated.count) throw new NotFoundException('Quick reply not found');
    return this.prisma.entrepreneurQuickReply.findUnique({ where: { id } });
  }

  async removeQuickReply(userId: string, id: string) {
    await this.prisma.entrepreneurQuickReply.deleteMany({
      where: { id, userId },
    });
    return { success: true };
  }

  async requireActiveEntrepreneur(userId: string) {
    const active = await this.access.isActiveEntrepreneur(userId);
    if (!active) {
      throw new ForbiddenException('Active entrepreneur plan required');
    }
  }

  private async ensureDefaultStorefront(userId: string, businessName: string) {
    const existing = await this.prisma.entrepreneurStorefront.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (existing) return;

    await this.prisma.entrepreneurStorefront.create({
      data: {
        userId,
        slug: await this.ensureUniqueStorefrontSlug(this.slugify(businessName)),
      },
    });
  }

  private async defaultStorefrontSlug(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    return this.ensureUniqueStorefrontSlug(
      this.slugify(user?.name ?? user?.email ?? userId),
    );
  }

  private async ensureUniqueStorefrontSlug(base: string) {
    const safeBase = base || 'empreendedor';
    let candidate = safeBase;
    let suffix = 1;
    while (
      await this.prisma.entrepreneurStorefront.findUnique({
        where: { slug: candidate },
        select: { id: true },
      })
    ) {
      candidate = `${safeBase}-${suffix++}`;
    }
    return candidate;
  }

  private slugify(text: string): string {
    return text
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
}
