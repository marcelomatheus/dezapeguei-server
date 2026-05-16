import { ApiPropertyOptional } from '@nestjs/swagger';
import { OfferStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class FindMyOffersQueryDto {
  @ApiPropertyOptional({ enum: OfferStatus })
  @IsOptional()
  @IsEnum(OfferStatus)
  status?: OfferStatus;
}
