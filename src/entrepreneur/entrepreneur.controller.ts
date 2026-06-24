import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SupabaseAuthGuard } from '../auth/guards/user-auth.guard';
import { EntrepreneurService } from './entrepreneur.service';
import { EntrepreneurValidationDto } from './dto/entrepreneur-validation.dto';
import { UpdateStorefrontDto } from './dto/update-storefront.dto';
import { FeaturedOfferDto } from './dto/featured-offer.dto';
import { QuickReplyDto } from './dto/quick-reply.dto';

@ApiTags('Entrepreneur')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('entrepreneur')
export class EntrepreneurController {
  constructor(private readonly entrepreneurService: EntrepreneurService) {}

  @Post('validation')
  submitValidation(
    @CurrentUser() user: User,
    @Body() dto: EntrepreneurValidationDto,
  ) {
    return this.entrepreneurService.submitValidation(user.id, dto);
  }

  @Get('me')
  getMe(@CurrentUser() user: User) {
    return this.entrepreneurService.getMe(user.id);
  }

  @Patch('profile')
  updateProfile(
    @CurrentUser() user: User,
    @Body() dto: EntrepreneurValidationDto,
  ) {
    return this.entrepreneurService.submitValidation(user.id, {
      ...dto,
      acceptedTerms: true,
    });
  }

  @Get('dashboard')
  getDashboard(@CurrentUser() user: User) {
    return this.entrepreneurService.getDashboard(user.id);
  }

  @Patch('storefront')
  updateStorefront(
    @CurrentUser() user: User,
    @Body() dto: UpdateStorefrontDto,
  ) {
    return this.entrepreneurService.updateStorefront(user.id, dto);
  }

  @Post('featured-offers')
  addFeaturedOffer(@CurrentUser() user: User, @Body() dto: FeaturedOfferDto) {
    return this.entrepreneurService.addFeaturedOffer(user.id, dto);
  }

  @Delete('featured-offers/:offerId')
  removeFeaturedOffer(@CurrentUser() user: User, @Param('offerId') offerId: string) {
    return this.entrepreneurService.removeFeaturedOffer(user.id, offerId);
  }

  @Post('quick-replies')
  createQuickReply(@CurrentUser() user: User, @Body() dto: QuickReplyDto) {
    return this.entrepreneurService.createQuickReply(user.id, dto);
  }

  @Patch('quick-replies/:id')
  updateQuickReply(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: QuickReplyDto,
  ) {
    return this.entrepreneurService.updateQuickReply(user.id, id, dto);
  }

  @Delete('quick-replies/:id')
  removeQuickReply(@CurrentUser() user: User, @Param('id') id: string) {
    return this.entrepreneurService.removeQuickReply(user.id, id);
  }
}
