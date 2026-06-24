import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CommunityMessageDto {
  @ApiProperty({ example: 'Tenho novidades na loja hoje.' })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  content!: string;
}
