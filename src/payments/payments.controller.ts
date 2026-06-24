import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SupabaseAuthGuard } from '../auth/guards/user-auth.guard';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { StripeSimulatedWebhookDto } from './dto/stripe-simulated-webhook.dto';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout-session')
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  createCheckoutSession(
    @CurrentUser() user: User,
    @Body() dto: CreateCheckoutSessionDto,
  ) {
    return this.paymentsService.createCheckoutSession(user.id, dto);
  }

  @Get('session/:sessionId')
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  findSession(@CurrentUser() user: User, @Param('sessionId') sessionId: string) {
    return this.paymentsService.findSession(sessionId, user.id);
  }

  @Post('session/:sessionId/simulate-success')
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  simulateSuccess(@CurrentUser() user: User, @Param('sessionId') sessionId: string) {
    return this.paymentsService.simulateSuccess(sessionId, user.id);
  }

  @Post('session/:sessionId/simulate-failure')
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  simulateFailure(@CurrentUser() user: User, @Param('sessionId') sessionId: string) {
    return this.paymentsService.simulateFailure(sessionId, user.id);
  }

  @Post('webhook/stripe-simulated')
  handleStripeSimulatedWebhook(@Body() dto: StripeSimulatedWebhookDto) {
    return this.paymentsService.handleStripeSimulatedWebhook(dto);
  }
}
