import { Injectable, NotFoundException } from '@nestjs/common';
import { OfferStatus, Prisma, SaleStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { handleError } from '../utils/handle-error';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { FindSalesQueryDto } from './dto/find-sales-query.dto';
import { SaleEntity } from './entities/sale.entity';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSaleDto): Promise<SaleEntity> {
    try {
      const offer = await this.prisma.offer.findUnique({
        where: { id: dto.offerId },
        select: { id: true, status: true },
      });
      if (!offer) throw new NotFoundException(`Offer ${dto.offerId} not found`);

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
}
