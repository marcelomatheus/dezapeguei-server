import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OfferStatus, OfferCondition } from '@prisma/client';
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
  @Transform(({ value }) => (value === undefined ? value : Number(value)))
  @IsOptional()
  @IsNumber()
  @Min(0)
  promotion?: number;

  @ApiPropertyOptional({
    description: 'Array of image URLs already uploaded',
    type: [String],
    example: [
      'https://storage.supabase.co/offers/image1.jpg',
      'https://storage.supabase.co/offers/image2.jpg',
    ],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrl?: string[];

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

  @ApiProperty({
    enum: OfferCondition,
    default: OfferCondition.NEW,
    description: 'Product condition',
  })
  @IsEnum(OfferCondition)
  condition!: OfferCondition;

  @ApiPropertyOptional({ enum: OfferStatus, default: OfferStatus.ACTIVE })
  @IsOptional()
  @IsEnum(OfferStatus)
  status?: OfferStatus;
}
