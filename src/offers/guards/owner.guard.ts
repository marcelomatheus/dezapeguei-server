import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Express.Request>();
    const userId = request.user?.id;
    const offerId = (request as { params?: { id?: string } }).params?.id;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (!offerId) {
      throw new NotFoundException('Offer id is required in route parameters');
    }

    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      select: { sellerId: true },
    });

    if (!offer) {
      throw new NotFoundException(`Offer with id ${offerId} not found`);
    }

    if (offer.sellerId !== userId) {
      throw new ForbiddenException(
        'Only the offer owner can perform this action',
      );
    }

    return true;
  }
}
