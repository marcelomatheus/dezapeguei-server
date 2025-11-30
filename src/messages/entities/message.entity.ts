import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class MessageEntity {
  @ApiProperty({ example: 'ckmsg123' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'ckchat123' })
  @Expose()
  chatId!: string;

  @ApiProperty({ example: 'Hello!' })
  @Expose()
  content!: string;

  @ApiProperty({ example: 'cku1' })
  @Expose()
  senderId!: string;

  @ApiProperty({ example: '2025-01-01T10:00:00.000Z' })
  @Expose()
  createdAt!: Date;

  @ApiProperty({ example: '2025-01-01T10:00:00.000Z' })
  @Expose()
  updatedAt!: Date;

  constructor(partial: Partial<MessageEntity>) {
    Object.assign(this, partial);
  }
}
