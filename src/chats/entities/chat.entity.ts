import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ParticipantEntity } from './participant.entity';

export class ChatEntity {
  @ApiProperty({ example: 'ckchat123' })
  @Expose()
  id!: string;

  @ApiProperty({
    example: ['user-1', 'user-2'],
    description: 'Supabase user ids of every participant',
    isArray: true,
  })
  @Expose()
  participantIds?: string[];

  @ApiProperty({
    example: false,
    description: 'Indicates whether this chat is a group chat',
  })
  @Expose()
  isGroup!: boolean;

  @ApiProperty({
    example: 'Equipe logística',
    nullable: true,
    description: 'Optional chat name for groups',
  })
  @Expose()
  name!: string | null;

  @ApiProperty({ type: ParticipantEntity, isArray: true })
  @Expose()
  @Type(() => ParticipantEntity)
  participants?: ParticipantEntity[];

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
