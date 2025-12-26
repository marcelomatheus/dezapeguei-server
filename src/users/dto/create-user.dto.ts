import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Plan } from '../entities/user.entity';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Unique identifier for the user e-mail address.',
    example: 'alice@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Full name displayed to other users.',
    example: 'Alice Souza',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({
    description:
      'International formatted phone number. Provide country code when possible.',
    example: '+55 11 99888-7766',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9\s-]{10,20}$/i, {
    message: 'phone must be a valid international phone number',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'CPF document (Brazilian ID)',
    example: '123.456.789-00',
  })
  @IsOptional()
  @IsString()
  cpf?: string;

  @ApiPropertyOptional({
    description: 'Instagram handle of the user without the @ prefix.',
    example: 'alice.shop',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-z0-9_.]+$/i, {
    message: 'instagram must contain only letters, numbers, underscore or dot',
  })
  instagram?: string;

  @ApiPropertyOptional({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({
    description: 'User bio/description',
    example: 'Passionate seller of vintage items',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({
    description: 'User rating. Defaults to 0.',
    example: 4.5,
  })
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiPropertyOptional({
    description: 'Number of completed sales',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  salesCount?: number;

  @ApiPropertyOptional({
    description: 'Number of purchases',
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  purchasesCount?: number;

  @ApiPropertyOptional({
    description: 'City',
    example: 'São Paulo',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'State',
    example: 'SP',
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    description: 'Subscription plan for the platform.',
    enum: Plan,
    example: Plan.FREE,
  })
  @IsOptional()
  @IsEnum(Plan)
  plan?: Plan;
}
