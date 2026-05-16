import { ApiPropertyOptional } from '@nestjs/swagger';
import { ChatEntity } from '../entities/chat.entity';

export class ChatResponseDto extends ChatEntity {
  @ApiPropertyOptional({
    description: 'Unread messages count for the querying user.',
    example: 2,
  })
  declare unreadCount?: number;
}
