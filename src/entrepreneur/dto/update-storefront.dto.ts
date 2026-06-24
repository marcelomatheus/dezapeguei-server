import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class UpdateStorefrontDto {
  @ApiPropertyOptional({ example: 'marcelo-store' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_protocol: true })
  bannerUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_protocol: true })
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  whatsapp?: string;
}
