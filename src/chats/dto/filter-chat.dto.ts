import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FilterChatDto {
  @ApiPropertyOptional({ description: 'Text search on name', example: 'grupo' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by group flag', example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'IsGroup must be a boolean value' })
  isGroup?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by a participant id',
    example: '64f1c2a1e9b1a2b3c4d5e6f7',
  })
  @IsOptional()
  @IsString()
  participantId?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Order by field',
    enum: ['createdAt', 'updatedAt', 'name'],
  })
  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'name'], {
    message: 'OrderBy must be one of: createdAt, updatedAt, name',
  })
  orderBy?: 'createdAt' | 'updatedAt' | 'name' = 'createdAt';

  @ApiPropertyOptional({
    description: 'Order direction',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'], {
    message: 'OrderDirection must be either asc or desc',
  })
  orderDirection?: 'asc' | 'desc' = 'desc';
}
