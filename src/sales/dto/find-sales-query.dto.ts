import { ApiPropertyOptional } from '@nestjs/swagger';
import { SaleStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class FindSalesQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by offer id',
    example: 'ckof123',
  })
  @IsOptional()
  @IsString()
  offerId?: string;

  @ApiPropertyOptional({
    description: 'Filter by buyer id',
    example: 'ckuBuyer',
  })
  @IsOptional()
  @IsString()
  buyerId?: string;

  @ApiPropertyOptional({ enum: SaleStatus })
  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  @IsEnum(SaleStatus)
  status?: SaleStatus;
}
