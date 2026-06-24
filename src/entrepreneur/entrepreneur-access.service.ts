import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type EntrepreneurSummary = {
  isActive: boolean;
  verifiedAt: Date | null;
  businessName: string | null;
  storefrontSlug: string | null;
};

@Injectable()
export class EntrepreneurAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async isActiveEntrepreneur(userId: string): Promise<boolean> {
    const summary = await this.getSummary(userId);
    return summary.isActive;
  }

  async getSummary(userId: string): Promise<EntrepreneurSummary> {
    const now = new Date();
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        entrepreneurVerifiedAt: true,
        entrepreneurProfile: {
          select: {
            businessName: true,
            status: true,
            verifiedAt: true,
          },
        },
        entrepreneurSubscriptions: {
          where: {
            status: 'ACTIVE',
            expiresAt: { gt: now },
          },
          select: { id: true },
          take: 1,
        },
        entrepreneurStorefront: {
          select: { slug: true },
        },
      },
    });

    const profile = user?.entrepreneurProfile;
    const hasActiveSubscription =
      (user?.entrepreneurSubscriptions.length ?? 0) > 0;
    const isActive = Boolean(
      user?.entrepreneurVerifiedAt &&
        profile?.status === 'APPROVED' &&
        hasActiveSubscription,
    );

    return {
      isActive,
      verifiedAt: isActive
        ? (profile?.verifiedAt ?? user?.entrepreneurVerifiedAt ?? null)
        : null,
      businessName: profile?.businessName ?? null,
      storefrontSlug: user?.entrepreneurStorefront?.slug ?? null,
    };
  }
}
