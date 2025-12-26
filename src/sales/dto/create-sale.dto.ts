import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SaleStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateSaleDto {
  @ApiProperty({ description: 'Offer id being sold', example: 'ckof123' })
  @IsString()
  @IsNotEmpty()
  offerId!: string;

  @ApiProperty({ description: 'Buyer user id', example: 'ckuBuyer' })
  @IsString()
  @IsNotEmpty()
  buyerId!: string;

  @ApiProperty({ description: 'Sale amount', example: 399.9, minimum: 0 })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional({ enum: SaleStatus, default: SaleStatus.PENDING })
  @IsOptional()
  @IsEnum(SaleStatus)
  status?: SaleStatus;
}
