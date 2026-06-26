import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class EntrepreneurValidationDto {
  @ApiProperty({ example: 'Marcelo Store' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  businessName!: string;

  @ApiProperty({ example: '12.345.678/0001-90' })
  @IsString()
  @MinLength(5)
  @MaxLength(32)
  document!: string;

  @ApiProperty({ example: 'Eletrônicos' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  businessType!: string;

  @ApiProperty({ example: 'Loja especializada em produtos seminovos.' })
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  instagram?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(255)
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  state?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  acceptedTerms!: boolean;
}
