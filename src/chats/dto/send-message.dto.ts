import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsOptional()
  chatId?: string;

  @IsString()
  @IsOptional()
  recipientId?: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsDateString()
  @IsOptional()
  createdAt?: string;

  @IsString()
  @IsOptional()
  clientRequestId?: string;
}
