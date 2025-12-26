import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateChatDto {
  @ApiProperty({
    description: 'Identifiers of every participant (Supabase user ids).',
    example: ['user-1', 'user-2'],
    minItems: 2,
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayUnique()
  @IsString({ each: true })
  participantIds!: string[];

  @ApiPropertyOptional({
    description: 'Flag that indicates whether this chat is a group chat.',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isGroup?: boolean;

  @ApiPropertyOptional({
    description: 'Optional chat name (required for group chats).',
    example: 'Equipe logística',
  })
  @IsOptional()
  @IsString()
  name?: string;
}
