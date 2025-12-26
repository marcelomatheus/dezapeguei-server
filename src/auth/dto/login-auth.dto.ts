import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'User email',
    example: 'manager.crm@nocorp.io',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'manager.crm@nocorp.io',
  })
  @IsString()
  password: string;
}

export class CreateAuthDto extends LoginDto {}
