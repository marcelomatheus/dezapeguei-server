import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateChatDto {
  @ApiProperty({ description: 'First participant user id', example: 'cku1' })
  @IsString()
  userId!: string;

  @ApiProperty({ description: 'Second participant user id', example: 'cku2' })
  @IsString()
  user2Id!: string;
}
