import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class WishlistItemEntity {
  @ApiProperty({ example: 'ckwli1' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'ckwl1' })
  @Expose()
  wishlistId!: string;

  @ApiProperty({ example: 'ckoffer1' })
  @Expose()
  offerId!: string;

  @ApiProperty({ example: '2025-01-01T10:00:00.000Z' })
  @Expose()
  createdAt!: Date;

  constructor(partial: Partial<WishlistItemEntity>) {
    Object.assign(this, partial);
  }
}
