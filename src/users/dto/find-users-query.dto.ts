import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Plan } from '@prisma/client';

export class FindUsersQueryDto {
  @ApiPropertyOptional({
    description: 'Filter users by subscription plan.',
    enum: Plan,
    example: Plan.PREMIUM,
  })
  @IsOptional()
  @IsEnum(Plan)
  plan?: Plan;

  @ApiPropertyOptional({
    description: 'Case-insensitive search across name and email.',
    example: 'Alice',
    minLength: 2,
    maxLength: 120,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : undefined,
  )
  search?: string;
}
