import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OfferStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateSpecificationDto {
  @ApiProperty({ example: 'Color', description: 'Name of the specification' })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  key!: string;

  @ApiProperty({ example: 'Blue', description: 'Specification value' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  value!: string;
}

export class CreateOfferDto {
  @ApiProperty({ example: 'Vintage Camera', maxLength: 120 })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title!: string;

  @ApiProperty({ example: 'In great condition, used lightly for 2 years.' })
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description!: string;

  @ApiProperty({ example: 499.9, minimum: 0 })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ example: 10, description: 'Optional percentage off' })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @Transform(({ value }) => (value === undefined ? value : Number(value)))
  @IsOptional()
  @IsNumber()
  @Min(0)
  promotion?: number;

  @ApiProperty({ example: 'cku1abc234sellerId', description: 'Seller user id' })
  @IsString()
  @IsNotEmpty()
  sellerId!: string;

  @ApiProperty({ example: 'cku1abc234categoryId', description: 'Category id' })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @ApiPropertyOptional({
    description: 'List of keywords (plain words) to associate',
    example: ['camera', 'vintage', 'analog'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiPropertyOptional({ type: [CreateSpecificationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  specifications?: CreateSpecificationDto[];

  @ApiPropertyOptional({ enum: OfferStatus, default: OfferStatus.ACTIVE })
  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  @IsEnum(OfferStatus)
  status?: OfferStatus;
}
