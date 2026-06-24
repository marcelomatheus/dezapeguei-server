import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SupabaseAuthGuard } from '../auth/guards/user-auth.guard';
import { CommunitiesService } from './communities.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { CommunityMessageDto } from './dto/community-message.dto';
import { CommunityOfferDto } from './dto/community-offer.dto';

@ApiTags('Communities')
@Controller('communities')
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  create(@CurrentUser() user: User, @Body() dto: CreateCommunityDto) {
    if (user.plan !== 'ENTERPRISE') {
      throw new ForbiddenException('Only enterprise users can create communities');
    }
    return this.communitiesService.create(dto);
  }

  @Get()
  findAll() {
    return this.communitiesService.findAll();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.communitiesService.findBySlug(slug);
  }

  @Post(':id/join')
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  join(@Param('id') id: string, @CurrentUser() user: User) {
    return this.communitiesService.join(id, user.id);
  }

  @Post(':id/leave')
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  leave(@Param('id') id: string, @CurrentUser() user: User) {
    return this.communitiesService.leave(id, user.id);
  }

  @Get(':id/messages')
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  getMessages(@Param('id') id: string) {
    return this.communitiesService.getMessages(id);
  }

  @Post(':id/messages')
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  sendMessage(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: CommunityMessageDto,
  ) {
    return this.communitiesService.sendMessage(id, user.id, dto);
  }

  @Post(':id/offers')
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  sendOffer(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: CommunityOfferDto,
  ) {
    return this.communitiesService.sendOffer(id, user.id, dto);
  }
}
