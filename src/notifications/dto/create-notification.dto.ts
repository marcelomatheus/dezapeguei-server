import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ description: 'Target user id', example: 'cku1' })
  @IsString()
  userId!: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'Your order has shipped',
    minLength: 1,
    maxLength: 500,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  message!: string;

  @ApiPropertyOptional({
    description: 'Optional redirect URL or slug',
    example: '/orders/123',
  })
  @IsOptional()
  @IsString()
  redirect?: string;

  @ApiPropertyOptional({
    description: 'Mark as read when created',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
