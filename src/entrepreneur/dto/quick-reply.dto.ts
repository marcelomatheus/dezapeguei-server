import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class QuickReplyDto {
  @ApiProperty({ example: 'Disponibilidade' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  title!: string;

  @ApiProperty({ example: 'Olá! Esse item ainda está disponível.' })
  @IsString()
  @MinLength(2)
  @MaxLength(500)
  content!: string;
}
