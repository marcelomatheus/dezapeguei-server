import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class SendMessageDto {
  @ApiPropertyOptional({
    description: 'Existing chat id. Required when recipientId is omitted.',
    example: 'chat-123',
  })
  @IsString()
  @IsOptional()
  chatId?: string;

  @ApiPropertyOptional({
    description:
      'Recipient user id. Required when chatId is omitted to create/reuse direct chat.',
    example: 'user-456',
  })
  @IsString()
  @IsOptional()
  recipientId?: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Is this item still available?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: 'Client-side timestamp in ISO-8601 format.',
    example: '2025-01-01T10:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  createdAt?: string;

  @ApiPropertyOptional({
    description: 'Client request id used for idempotency/ack correlation.',
    example: 'req-abc123',
  })
  @IsString()
  @IsOptional()
  clientRequestId?: string;
}
