import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class CreateCheckoutSessionDto {
  @ApiProperty({ example: 'ENTREPRENEUR_MONTHLY' })
  @IsIn(['ENTREPRENEUR_MONTHLY'])
  plan!: 'ENTREPRENEUR_MONTHLY';
}
