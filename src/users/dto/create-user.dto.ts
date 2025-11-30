import { ApiProperty } from '@nestjs/swagger';
import { Plan } from '../entities/user.entity';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
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
    description:
      'International formatted phone number. Provide country code when possible.',
    example: '+55 11 99888-7766',
  })
  @IsString()
  @Matches(/^\+?[0-9\s-]{10,20}$/i, {
    message: 'phone must be a valid international phone number',
  })
  phone!: string;

  @ApiProperty({
    description: 'Instagram handle of the user without the @ prefix.',
    example: 'alice.shop',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-z0-9_.]+$/i, {
    message: 'instagram must contain only letters, numbers, underscore or dot',
  })
  instagram?: string;

  @ApiProperty({
    description: 'Customer reputation score. Defaults to 0 when not provided.',
    example: 5,
    required: false,
  })
  @IsOptional()
  score?: number;

  @ApiProperty({
    description: 'Full name displayed to other users.',
    example: 'Alice Souza',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @ApiProperty({
    description: 'Subscription plan for the platform.',
    enum: Plan,
    example: Plan.FREE,
  })
  @IsEnum(Plan)
  @IsNotEmpty()
  plan!: Plan;
}
