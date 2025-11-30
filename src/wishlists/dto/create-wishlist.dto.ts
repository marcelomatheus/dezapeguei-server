import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateWishlistDto {
  @ApiProperty({
    description: 'Wishlist name',
    example: 'My favorites',
    minLength: 2,
    maxLength: 120,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiProperty({ description: 'Owner user id', example: 'cku1' })
  @IsString()
  userId!: string;
}
