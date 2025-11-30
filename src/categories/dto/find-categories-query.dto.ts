import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class FindCategoriesQueryDto {
  @ApiPropertyOptional({
    description: 'Case-insensitive search by category name',
    example: 'Elec',
    minLength: 2,
    maxLength: 60,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : undefined,
  )
  search?: string;
}
