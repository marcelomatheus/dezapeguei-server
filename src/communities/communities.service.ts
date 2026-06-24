import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OfferStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EntrepreneurAccessService } from '../entrepreneur/entrepreneur-access.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { CommunityMessageDto } from './dto/community-message.dto';
import { CommunityOfferDto } from './dto/community-offer.dto';

@Injectable()
export class CommunitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly entrepreneurAccess: EntrepreneurAccessService,
  ) {}

  async create(dto: CreateCommunityDto) {
    const slug = await this.ensureUniqueSlug(this.slugify(dto.name));
    return this.prisma.community.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description ?? null,
        imageUrl: dto.imageUrl ?? null,
      },
    });
  }

  findAll() {
    return this.prisma.community.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: { _count: { select: { members: true, messages: true } } },
    });
  }

  async findBySlug(slug: string) {
    const community = await this.prisma.community.findUnique({
      where: { slug },
      include: { _count: { select: { members: true, messages: true } } },
    });
    if (!community || !community.isActive) {
      throw new NotFoundException('Community not found');
    }
    return community;
  }

  async join(communityId: string, userId: string) {
    await this.ensureCommunity(communityId);
    return this.prisma.communityMember.upsert({
      where: { communityId_userId: { communityId, userId } },
      create: { communityId, userId },
      update: {},
    });
  }

  async leave(communityId: string, userId: string) {
    await this.prisma.communityMember.deleteMany({
      where: { communityId, userId },
    });
    return { success: true };
  }

  async getMessages(communityId: string) {
    await this.ensureCommunity(communityId);
    return this.prisma.communityMessage.findMany({
      where: { communityId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            entrepreneurVerifiedAt: true,
            entrepreneurProfile: {
              select: { businessName: true, verifiedAt: true, status: true },
            },
            entrepreneurStorefront: { select: { slug: true } },
            entrepreneurSubscriptions: {
              where: { status: 'ACTIVE', expiresAt: { gt: new Date() } },
              select: { id: true },
              take: 1,
            },
          },
        },
        offer: true,
      },
    });
  }

  async sendMessage(communityId: string, userId: string, dto: CommunityMessageDto) {
    await this.requireCommunityMember(communityId, userId);
    await this.requireActiveEntrepreneur(userId);

    return this.prisma.communityMessage.create({
      data: {
        communityId,
        userId,
        content: dto.content,
        type: 'TEXT',
      },
      include: this.messageInclude(),
    });
  }

  async sendOffer(communityId: string, userId: string, dto: CommunityOfferDto) {
    await this.requireCommunityMember(communityId, userId);
    await this.requireActiveEntrepreneur(userId);

    const offer = await this.prisma.offer.findUnique({
      where: { id: dto.offerId },
      select: { id: true, sellerId: true, status: true, title: true },
    });

    if (!offer || offer.sellerId !== userId) {
      throw new NotFoundException('Offer not found');
    }
    if (offer.status !== OfferStatus.ACTIVE) {
      throw new BadRequestException('Only active offers can be shared');
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const count = await this.prisma.communityMessage.count({
      where: {
        communityId,
        userId,
        type: 'OFFER',
        createdAt: { gte: since },
      },
    });
    if (count >= 5) {
      throw new BadRequestException('Offer sharing limit reached for this community');
    }

    return this.prisma.communityMessage.create({
      data: {
        communityId,
        userId,
        offerId: offer.id,
        content: dto.content ?? offer.title,
        type: 'OFFER',
      },
      include: this.messageInclude(),
    });
  }

  async requireCommunityMember(communityId: string, userId: string) {
    await this.ensureCommunity(communityId);
    const member = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId, userId } },
      select: { id: true },
    });
    if (!member) {
      throw new ForbiddenException('Join the community before interacting');
    }
  }

  private async requireActiveEntrepreneur(userId: string) {
    if (!(await this.entrepreneurAccess.isActiveEntrepreneur(userId))) {
      throw new ForbiddenException('Active entrepreneur plan required');
    }
  }

  private messageInclude() {
    return {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          entrepreneurVerifiedAt: true,
          entrepreneurProfile: {
            select: { businessName: true, verifiedAt: true, status: true },
          },
          entrepreneurStorefront: { select: { slug: true } },
          entrepreneurSubscriptions: {
            where: { status: 'ACTIVE' as const, expiresAt: { gt: new Date() } },
            select: { id: true },
            take: 1,
          },
        },
      },
      offer: true,
    };
  }

  private async ensureCommunity(communityId: string) {
    const community = await this.prisma.community.findFirst({
      where: { id: communityId, isActive: true },
      select: { id: true },
    });
    if (!community) throw new NotFoundException('Community not found');
  }

  private async ensureUniqueSlug(base: string) {
    let candidate = base || 'comunidade';
    let suffix = 1;
    while (
      await this.prisma.community.findUnique({
        where: { slug: candidate },
        select: { id: true },
      })
    ) {
      candidate = `${base}-${suffix++}`;
    }
    return candidate;
  }

  private slugify(text: string) {
    return text
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
}
