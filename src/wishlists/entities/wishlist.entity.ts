import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class WishlistEntity {
  @ApiProperty({ example: 'ckwl1' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'My favorites' })
  @Expose()
  name!: string;

  @ApiProperty({ example: 'cku1' })
  @Expose()
  userId!: string;

  @ApiProperty({ example: '2025-01-01T10:00:00.000Z' })
  @Expose()
  createdAt!: Date;

  @ApiProperty({ example: '2025-01-01T10:00:00.000Z' })
  @Expose()
  updatedAt!: Date;

  constructor(partial: Partial<WishlistEntity>) {
    Object.assign(this, partial);
  }
}
