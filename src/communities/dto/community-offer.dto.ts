import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CommunityOfferDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  offerId!: string;

  @ApiProperty({ example: 'Oferta especial para a comunidade.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  content?: string;
}
