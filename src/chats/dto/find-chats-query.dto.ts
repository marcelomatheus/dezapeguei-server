import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FindChatsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter chats by participant user id',
    example: 'cku1',
  })
  @IsOptional()
  @IsString()
  userId?: string;
}
