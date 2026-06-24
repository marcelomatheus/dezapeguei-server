import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';

export class StripeSimulatedWebhookDto {
  @ApiProperty({ example: 'checkout.session.completed' })
  @IsString()
  type!: string;

  @ApiProperty({
    example: {
      sessionId: 'sim_ck123',
      userId: 'user_123',
    },
  })
  @IsObject()
  data!: {
    sessionId?: string;
    providerSessionId?: string;
    userId?: string;
  };
}
