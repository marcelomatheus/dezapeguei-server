import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RemoveWishlistItemDto {
  @ApiProperty({ description: 'Offer id to remove', example: 'ckoffer1' })
  @IsString()
  offerId!: string;

  @ApiProperty({
    description: 'User id owner of the wishlist',
    example: 'cku1',
  })
  @IsString()
  userId!: string;
}
