import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, ArrayUnique, IsArray, IsString } from 'class-validator';

export class FindOrCreateChatDto {
  @ApiProperty({
    description: 'Two participant user ids (direct chat)',
    type: [String],
    example: ['user-123', 'user-456'],
    minItems: 2,
    maxItems: 2,
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayUnique()
  @IsString({ each: true })
  participantIds!: string[];
}
