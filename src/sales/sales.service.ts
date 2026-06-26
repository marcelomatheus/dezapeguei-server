import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OfferStatus, Prisma, SaleStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { handleError } from '../utils/handle.errors.util';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { FindSalesQueryDto, SaleHistoryRole } from './dto/find-sales-query.dto';
import { SaleEntity } from './entities/sale.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateSaleDto): Promise<SaleEntity> {
    try {
      const offer = await this.prisma.offer.findUnique({
        where: { id: dto.offerId },
        select: { id: true, status: true, sellerId: true, title: true },
      });
      if (!offer) throw new NotFoundException(`Offer ${dto.offerId} not found`);

      if (offer.status !== OfferStatus.ACTIVE) {
        throw new BadRequestException(
          `Offer ${dto.offerId} must be ACTIVE to create a sale`,
        );
      }

      if (offer.sellerId === dto.buyerId) {
        throw new BadRequestException('Seller cannot buy their own offer');
      }

      const buyer = await this.prisma.user.findUnique({
        where: { id: dto.buyerId },
      });
      if (!buyer) throw new NotFoundException(`Buyer ${dto.buyerId} not found`);

      const already = await this.prisma.sale.findUnique({
        where: { offerId: dto.offerId },
      });
      if (already)
        throw new Error(`Sale for offer ${dto.offerId} already exists`);

      const result = await this.prisma.$transaction(async (tx) => {
        const createdSale = await tx.sale.create({
          data: {
            offerId: dto.offerId,
            buyerId: dto.buyerId,
            amount: dto.amount,
            status: dto.status ?? SaleStatus.PENDING,
          },
        });

        if ((dto.status ?? SaleStatus.PENDING) === SaleStatus.COMPLETED) {
          await tx.offer.update({
            where: { id: dto.offerId },
            data: { status: OfferStatus.SOLD },
          });
        }

        return createdSale;
      });

      if ((dto.status ?? SaleStatus.PENDING) === SaleStatus.COMPLETED) {
        await this.notifySaleCompletion(result.id, dto.buyerId, offer.title);
      }

      return new SaleEntity(result as unknown as Partial<SaleEntity>);
    } catch (error) {
      return this.handleServiceError(error, 'SalesService.create');
    }
  }

  async findAll(query: FindSalesQueryDto): Promise<SaleEntity[]> {
    try {
      const where: Prisma.SaleWhereInput = {
        offerId: query.offerId,
        buyerId: query.buyerId,
        status: query.status,
      };

      if (query.sellerId) {
        where.offer = {
          is: {
            sellerId: query.sellerId,
          },
        };
      }

      if (query.role && query.userId) {
        if (query.role === SaleHistoryRole.BUYER) {
          where.buyerId = query.userId;
        }

        if (query.role === SaleHistoryRole.SELLER) {
          where.offer = {
            is: {
              sellerId: query.userId,
            },
          };
        }
      }

      const rows = await this.prisma.sale.findMany({
        where,
        orderBy: { saleDate: 'desc' },
      });

      return rows.map(
        (r) => new SaleEntity(r as unknown as Partial<SaleEntity>),
      );
    } catch (error) {
      return this.handleServiceError(error, 'SalesService.findAll');
    }
  }

  async findById(id: string): Promise<SaleEntity> {
    try {
      const row = await this.prisma.sale.findUnique({ where: { id } });
      if (!row) throw new NotFoundException(`Sale with id ${id} not found`);
      return new SaleEntity(row as unknown as Partial<SaleEntity>);
    } catch (error) {
      return this.handleServiceError(error, 'SalesService.findById');
    }
  }

  async update(id: string, dto: UpdateSaleDto): Promise<SaleEntity> {
    try {
      const current = await this.prisma.sale.findUnique({
        where: { id },
        include: {
          offer: {
            select: {
              title: true,
            },
          },
        },
      });

      if (!current) {
        throw new NotFoundException(`Sale with id ${id} not found`);
      }

      const result = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.sale.update({
          where: { id },
          data: {
            amount: dto.amount ?? undefined,
            status: dto.status ?? undefined,
          },
        });

        if (dto.status === SaleStatus.COMPLETED) {
          await tx.offer.update({
            where: { id: updated.offerId },
            data: { status: OfferStatus.SOLD },
          });
        }

        return updated;
      });

      if (
        dto.status === SaleStatus.COMPLETED &&
        current.status !== SaleStatus.COMPLETED
      ) {
        await this.notifySaleCompletion(
          result.id,
          result.buyerId,
          current.offer.title,
        );
      }

      return new SaleEntity(result as unknown as Partial<SaleEntity>);
    } catch (error) {
      return this.handleServiceError(error, 'SalesService.update');
    }
  }

  async remove(id: string): Promise<SaleEntity> {
    try {
      const deleted = await this.prisma.sale.delete({ where: { id } });
      return new SaleEntity(deleted as unknown as Partial<SaleEntity>);
    } catch (error) {
      return this.handleServiceError(error, 'SalesService.remove');
    }
  }

  private handleServiceError(error: unknown, context: string): never {
    return handleError(
      error instanceof Error ? error : new Error(String(error)),
      context,
    );
  }

  private async notifySaleCompletion(
    saleId: string,
    buyerId: string,
    offerTitle?: string | null,
  ): Promise<void> {
    await this.notificationsService.create({
      userId: buyerId,
      message: offerTitle
        ? `A venda de "${offerTitle}" foi concluída.`
        : 'Sua compra foi concluída.',
      redirect: `/sales/${saleId}`,
      isRead: false,
    });
  }
}
