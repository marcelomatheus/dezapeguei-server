import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ description: 'Chat id', example: 'ckchat123' })
  @IsString()
  chatId!: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Hello!',
    minLength: 1,
    maxLength: 5000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content!: string;

  @ApiProperty({ description: 'Sender user id', example: 'cku1' })
  @IsString()
  senderId!: string;
}
