import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import type { Offer } from '@prisma/client';

export class WishlistEntity {
  @ApiProperty({ example: 'ckwl1' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'cku1' })
  @Expose()
  userId!: string;

  @ApiProperty({ example: 'ckoffer1' })
  @Expose()
  offerId!: string;

  @ApiProperty({ example: '2025-01-01T10:00:00.000Z' })
  @Expose()
  createdAt!: Date;

  @ApiProperty({ required: false })
  @Expose()
  offer?: Offer;

  constructor(partial: Partial<WishlistEntity>) {
    Object.assign(this, partial);
  }
}
