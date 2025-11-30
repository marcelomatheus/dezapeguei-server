import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ChatEntity {
  @ApiProperty({ example: 'ckchat123' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'cku1' })
  @Expose()
  userId!: string;

  @ApiProperty({ example: 'cku2' })
  @Expose()
  user2Id!: string;

  @ApiProperty({ example: '2025-01-01T10:00:00.000Z' })
  @Expose()
  createdAt!: Date;

  @ApiProperty({ example: '2025-01-01T10:00:00.000Z' })
  @Expose()
  updatedAt!: Date;

  constructor(partial: Partial<ChatEntity>) {
    Object.assign(this, partial);
  }
}
