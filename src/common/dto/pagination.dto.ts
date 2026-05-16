import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min, Max, IsOptional } from 'class-validator';

/**
 * Pagination Base DTO
 * Provides consistent pagination parameters across the API
 * Following Constitution Principle VII: Backend Modular Architecture
 */
export class PaginationDto {
  @ApiProperty({
    description: 'Page number (1-indexed)',
    example: 1,
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  /**
   * Calculate skip value for database queries
   */
  get skip(): number {
    return ((this.page || 1) - 1) * (this.limit || 20);
  }

  /**
   * Calculate take value for database queries
   */
  get take(): number {
    return this.limit || 20;
  }
}

/**
 * Paginated Response DTO
 * Provides consistent pagination metadata in responses
 */
export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Array of items for the current page',
  })
  data: T[];

  @ApiProperty({
    description: 'Pagination metadata',
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.meta = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1,
    };
  }
}
