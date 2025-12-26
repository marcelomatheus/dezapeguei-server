import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { OfferStatus } from '@prisma/client';

export class SimpleKeywordEntity {
  @ApiProperty({ example: 'ckw123', description: 'Keyword id' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'vintage' })
  @Expose()
  word!: string;

  constructor(partial: Partial<SimpleKeywordEntity>) {
    Object.assign(this, partial);
  }
}

export class SimpleSpecificationEntity {
  @ApiProperty({ example: 'cks123', description: 'Specification id' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'Color' })
  @Expose()
  key!: string;

  @ApiProperty({ example: 'Blue' })
  @Expose()
  value!: string;

  constructor(partial: Partial<SimpleSpecificationEntity>) {
    Object.assign(this, partial);
  }
}

export class OfferEntity {
  @ApiProperty({ example: 'ckof123' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'vintage-camera' })
  @Expose()
  slug!: string;

  @ApiProperty({ example: 'Vintage Camera' })
  @Expose()
  title!: string;

  @ApiProperty({ example: 'In great condition, used lightly for 2 years.' })
  @Expose()
  description!: string;

  @ApiProperty({ example: 499.9 })
  @Expose()
  price!: number;

  @ApiProperty({ example: 10, nullable: true })
  @Expose()
  promotion!: number | null;

  @ApiProperty({
    type: [String],
    example: [
      'https://storage.supabase.co/offers/image1.jpg',
      'https://storage.supabase.co/offers/image2.jpg',
    ],
  })
  @Expose()
  imageUrl!: string[];

  @ApiProperty({ enum: OfferStatus, example: OfferStatus.ACTIVE })
  @Expose()
  status!: OfferStatus;

  @ApiProperty({ example: 'ckcat123' })
  @Expose()
  categoryId!: string;

  @ApiProperty({ example: 'cku123' })
  @Expose()
  sellerId!: string;

  @ApiProperty({ type: [SimpleKeywordEntity] })
  @Type(() => SimpleKeywordEntity)
  @Expose()
  keywords?: SimpleKeywordEntity[];

  @ApiProperty({ type: [SimpleSpecificationEntity] })
  @Type(() => SimpleSpecificationEntity)
  @Expose()
  specifications?: SimpleSpecificationEntity[];

  @ApiProperty({ example: '2025-01-01T10:00:00.000Z' })
  @Expose()
  createdAt!: Date;

  @ApiProperty({ example: '2025-01-01T10:00:00.000Z' })
  @Expose()
  updatedAt!: Date;

  constructor(partial: Partial<OfferEntity>) {
    Object.assign(this, partial);
  }
}
