import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserEntity } from '../../users/entities/user.entity';

export class ParticipantEntity {
  @ApiProperty({ example: 'ckchat123' })
  @Expose()
  chatId!: string;

  @ApiProperty({ example: 'user-123' })
  @Expose()
  userId!: string;

  @ApiProperty({ example: 'ckpart123' })
  @Expose()
  id!: string;

  @ApiProperty({ type: () => UserEntity, nullable: true })
  @Expose()
  @Type(() => UserEntity)
  user?: UserEntity;

  constructor(partial: Partial<ParticipantEntity>) {
    Object.assign(this, partial);
  }
}
