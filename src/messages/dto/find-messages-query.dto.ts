import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FindMessagesQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by chat id',
    example: 'ckchat123',
  })
  @IsOptional()
  @IsString()
  chatId?: string;

  @ApiPropertyOptional({
    description: 'Filter by sender user id',
    example: 'cku1',
  })
  @IsOptional()
  @IsString()
  senderId?: string;
}
