import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { SaleStatus } from '@prisma/client';

export class SaleEntity {
  @ApiProperty({ example: 'cksale1' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'ckof123' })
  @Expose()
  offerId!: string;

  @ApiProperty({ example: 'ckuBuyer' })
  @Expose()
  buyerId!: string;

  @ApiProperty({ example: '2025-01-01T10:00:00.000Z' })
  @Expose()
  saleDate!: Date;

  @ApiProperty({ example: 399.9 })
  @Expose()
  amount!: number;

  @ApiProperty({ enum: SaleStatus, example: SaleStatus.PENDING })
  @Expose()
  status!: SaleStatus;

  @ApiProperty({ example: '2025-01-01T10:00:00.000Z' })
  @Expose()
  createdAt!: Date;

  @ApiProperty({ example: '2025-01-01T10:00:00.000Z' })
  @Expose()
  updatedAt!: Date;

  constructor(partial: Partial<SaleEntity>) {
    Object.assign(this, partial);
  }
}
