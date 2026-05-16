import {
  UseGuards,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { OfferStatus } from '@prisma/client';
import type { User } from '@prisma/client';
import { FilesInterceptor } from '@nestjs/platform-express';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FindOffersQueryDto } from './dto/find-offers-query.dto';
import { OfferResponseDto } from './dto/offer-response.dto';
import { SanitizePipe } from '../common/pipes/sanitize.pipe';
import { SupabaseAuthGuard } from '../auth/guards/user-auth.guard';
import { OwnerGuard } from './guards/owner.guard';
import { UpdateOfferStatusDto } from './dto/update-offer-status.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FindMyOffersQueryDto } from './dto/find-my-offers-query.dto';

@ApiTags('Offers')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new offer' })
  @ApiCreatedResponse({ type: OfferResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error' })
  create(
    @Body(new SanitizePipe()) createOfferDto: CreateOfferDto,
  ): Promise<OfferResponseDto> {
    return this.offersService.create(createOfferDto);
  }

  @Get()
  @ApiOperation({ summary: 'List offers with filters' })
  @ApiOkResponse({ type: OfferResponseDto, isArray: true })
  findAll(@Query() query: FindOffersQueryDto): Promise<OfferResponseDto[]> {
    console.log('Received query parameters:', query);
    return this.offersService.findAll({
      ...query,
      status: query.status ?? OfferStatus.ACTIVE,
    });
  }

  @Get('my')
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: "List authenticated user's offers" })
  @ApiOkResponse({ type: OfferResponseDto, isArray: true })
  findMyOffers(
    @CurrentUser() user: User,
    @Query() query: FindMyOffersQueryDto,
  ): Promise<OfferResponseDto[]> {
    return this.offersService.findAll({
      sellerId: user.id,
      status: query.status,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an offer by id' })
  @ApiParam({ name: 'id', example: 'ckof123' })
  @ApiOkResponse({ type: OfferResponseDto })
  @ApiNotFoundResponse({ description: 'Offer not found' })
  findById(@Param('id') id: string): Promise<OfferResponseDto> {
    return this.offersService.findById(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, OwnerGuard)
  @ApiOperation({ summary: 'Update an offer by id' })
  @ApiParam({ name: 'id', example: 'ckof123' })
  @ApiOkResponse({ type: OfferResponseDto })
  @UsePipes(new SanitizePipe())
  update(
    @Param('id') id: string,
    @Body() updateOfferDto: UpdateOfferDto,
  ): Promise<OfferResponseDto> {
    return this.offersService.update(id, updateOfferDto);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, OwnerGuard)
  @ApiOperation({ summary: 'Update an offer status by id' })
  @ApiParam({ name: 'id', example: 'ckof123' })
  @ApiOkResponse({ type: OfferResponseDto })
  updateStatus(
    @Param('id') id: string,
    @Body() updateOfferStatusDto: UpdateOfferStatusDto,
  ): Promise<OfferResponseDto> {
    return this.offersService.updateStatus(id, updateOfferStatusDto.status);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, OwnerGuard)
  @ApiOperation({ summary: 'Delete an offer by id' })
  @ApiParam({ name: 'id', example: 'ckof123' })
  @ApiOkResponse({ type: OfferResponseDto })
  remove(@Param('id') id: string): Promise<OfferResponseDto> {
    return this.offersService.remove(id);
  }

  @Post('upload-images')
  @ApiOperation({ summary: 'Upload multiple images and return public URLs' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Array of image files (max 5)',
        },
      },
    },
  })
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        imageUrls: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'https://storage.supabase.co/offers/image1.jpg',
            'https://storage.supabase.co/offers/image2.jpg',
          ],
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid files or too many files' })
  @UseInterceptors(FilesInterceptor('images', 5))
  async uploadImages(
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<{ imageUrls: string[] }> {
    console.log(
      'Received files for upload:',
      files.map((f) => f.originalname),
    );
    return this.offersService.uploadImages(files);
  }
}
