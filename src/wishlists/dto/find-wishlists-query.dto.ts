import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FindWishlistsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by owner user id',
    example: 'cku1',
  })
  @IsOptional()
  @IsString()
  userId?: string;
}
