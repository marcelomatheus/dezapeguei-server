import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EntrepreneurAccessService } from '../entrepreneur/entrepreneur-access.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { StripeSimulatedWebhookDto } from './dto/stripe-simulated-webhook.dto';

const ENTREPRENEUR_AMOUNT = 9900;
const ENTREPRENEUR_CURRENCY = 'BRL';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly entrepreneurAccess: EntrepreneurAccessService,
  ) {}

  async createCheckoutSession(
    userId: string,
    _dto: CreateCheckoutSessionDto,
  ) {
    const profile = await this.prisma.entrepreneurProfile.findUnique({
      where: { userId },
      select: { id: true, status: true },
    });
    if (!profile) {
      throw new BadRequestException('Entrepreneur validation must be submitted first');
    }
    if (profile.status === 'SUSPENDED') {
      throw new BadRequestException('Entrepreneur profile is suspended');
    }
    if (await this.entrepreneurAccess.isActiveEntrepreneur(userId)) {
      throw new BadRequestException('Entrepreneur plan is already active');
    }

    const subscription = await this.prisma.entrepreneurSubscription.upsert({
      where: { id: await this.findReusableSubscriptionId(userId) },
      create: {
        userId,
        status: 'PENDING_PAYMENT',
        amount: ENTREPRENEUR_AMOUNT,
        currency: ENTREPRENEUR_CURRENCY,
      },
      update: {
        status: 'PENDING_PAYMENT',
        amount: ENTREPRENEUR_AMOUNT,
        currency: ENTREPRENEUR_CURRENCY,
      },
    });

    const providerSessionId = `sim_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 10)}`;
    const clientBaseUrl = process.env.CLIENT_BASE_URL ?? 'http://localhost:3000';
    const checkoutUrl = `${clientBaseUrl}/empreendedor/checkout/session/${providerSessionId}`;

    const session = await this.prisma.paymentSession.create({
      data: {
        userId,
        subscriptionId: subscription.id,
        providerSessionId,
        checkoutUrl,
        successUrl: `${clientBaseUrl}/empreendedor/success`,
        cancelUrl: `${clientBaseUrl}/empreendedor/cancel`,
        amount: ENTREPRENEUR_AMOUNT,
        currency: ENTREPRENEUR_CURRENCY,
        metadata: { plan: 'ENTREPRENEUR_MONTHLY' },
      },
    });

    return {
      sessionId: session.providerSessionId,
      checkoutUrl: session.checkoutUrl,
      amount: session.amount,
      currency: session.currency,
      status: session.status,
    };
  }

  async findSession(sessionId: string, userId?: string) {
    const session = await this.prisma.paymentSession.findUnique({
      where: { providerSessionId: sessionId },
      include: { subscription: true },
    });
    if (!session) {
      throw new NotFoundException('Payment session not found');
    }
    if (userId && session.userId !== userId) {
      throw new BadRequestException('Payment session does not belong to user');
    }
    return session;
  }

  async simulateSuccess(sessionId: string, userId?: string) {
    const session = await this.findSession(sessionId, userId);
    return this.processCompletedSession(session.providerSessionId, userId);
  }

  async simulateFailure(sessionId: string, userId: string) {
    const session = await this.findSession(sessionId, userId);
    if (session.status === 'PAID') {
      throw new BadRequestException('Paid sessions cannot be failed');
    }
    return this.prisma.paymentSession.update({
      where: { providerSessionId: sessionId },
      data: { status: 'FAILED' },
    });
  }

  async handleStripeSimulatedWebhook(dto: StripeSimulatedWebhookDto) {
    if (dto.type !== 'checkout.session.completed') {
      return { received: true, ignored: true };
    }
    const sessionId = dto.data.providerSessionId ?? dto.data.sessionId;
    if (!sessionId) {
      throw new BadRequestException('Missing session id');
    }
    return this.processCompletedSession(sessionId, dto.data.userId);
  }

  private async processCompletedSession(sessionId: string, userId?: string) {
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 30);

    return this.prisma.$transaction(async (tx) => {
      const session = await tx.paymentSession.findUnique({
        where: { providerSessionId: sessionId },
        include: { subscription: true },
      });
      if (!session) {
        throw new NotFoundException('Payment session not found');
      }
      if (userId && session.userId !== userId) {
        throw new BadRequestException('Payment session does not belong to user');
      }
      if (session.status === 'PAID') {
        return { success: true, idempotent: true, session };
      }

      const paidSession = await tx.paymentSession.update({
        where: { providerSessionId: sessionId },
        data: { status: 'PAID', processedAt: now },
      });

      const subscription = await tx.entrepreneurSubscription.update({
        where: { id: session.subscriptionId },
        data: {
          status: 'ACTIVE',
          startedAt: now,
          expiresAt,
          lastPaymentAt: now,
          cancelledAt: null,
        },
      });

      await tx.entrepreneurProfile.update({
        where: { userId: session.userId },
        data: {
          status: 'APPROVED',
          verifiedAt: now,
        },
      });

      await tx.user.update({
        where: { id: session.userId },
        data: { entrepreneurVerifiedAt: now },
      });

      return {
        success: true,
        idempotent: false,
        session: paidSession,
        subscription,
      };
    });
  }

  private async findReusableSubscriptionId(userId: string): Promise<string> {
    const subscription = await this.prisma.entrepreneurSubscription.findFirst({
      where: { userId, status: { in: ['PENDING_PAYMENT', 'EXPIRED', 'CANCELLED'] } },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });

    return subscription?.id ?? '__create_new_subscription__';
  }
}
