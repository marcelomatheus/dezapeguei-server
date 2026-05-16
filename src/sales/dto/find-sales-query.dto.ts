import { ApiPropertyOptional } from '@nestjs/swagger';
import { SaleStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum SaleHistoryRole {
  BUYER = 'buyer',
  SELLER = 'seller',
}

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

  @ApiPropertyOptional({
    description: 'Filter by seller id',
    example: 'ckuSeller',
  })
  @IsOptional()
  @IsString()
  sellerId?: string;

  @ApiPropertyOptional({
    enum: SaleHistoryRole,
    description: 'Filter sales history by user role',
  })
  @IsOptional()
  @IsEnum(SaleHistoryRole)
  role?: SaleHistoryRole;

  @ApiPropertyOptional({
    description: 'User id used together with role filter',
    example: 'ckuBuyer',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ enum: SaleStatus })
  @IsOptional()
  @IsEnum(SaleStatus)
  status?: SaleStatus;
}
