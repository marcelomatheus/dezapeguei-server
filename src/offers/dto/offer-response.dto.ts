import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { OfferEntity } from '../entities/offer.entity';

export class OfferResponseDto extends OfferEntity {
  @ApiProperty({
    example: 0,
    description: 'Number of users that favorited this offer',
  })
  @Expose()
  wishlistCount!: number;

  constructor(partial: Partial<OfferResponseDto>) {
    super(partial);
    this.wishlistCount = partial.wishlistCount ?? 0;
  }
}
