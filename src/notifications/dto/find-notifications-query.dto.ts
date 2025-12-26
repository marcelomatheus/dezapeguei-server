import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class FindNotificationsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by target user id',
    example: 'cku1',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter by read status', example: false })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
