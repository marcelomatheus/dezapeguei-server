import {
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
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import {
  ApiBadRequestResponse,
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
import { OfferEntity } from './entities/offer.entity';

@ApiTags('Offers')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new offer' })
  @ApiCreatedResponse({ type: OfferEntity })
  @ApiBadRequestResponse({ description: 'Validation error' })
  create(@Body() createOfferDto: CreateOfferDto): Promise<OfferEntity> {
    return this.offersService.create(createOfferDto);
  }

  @Get()
  @ApiOperation({ summary: 'List offers with filters' })
  @ApiOkResponse({ type: OfferEntity, isArray: true })
  findAll(@Query() query: FindOffersQueryDto): Promise<OfferEntity[]> {
    return this.offersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an offer by id' })
  @ApiParam({ name: 'id', example: 'ckof123' })
  @ApiOkResponse({ type: OfferEntity })
  @ApiNotFoundResponse({ description: 'Offer not found' })
  findById(@Param('id') id: string): Promise<OfferEntity> {
    return this.offersService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an offer by id' })
  @ApiParam({ name: 'id', example: 'ckof123' })
  @ApiOkResponse({ type: OfferEntity })
  update(
    @Param('id') id: string,
    @Body() updateOfferDto: UpdateOfferDto,
  ): Promise<OfferEntity> {
    return this.offersService.update(id, updateOfferDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an offer by id' })
  @ApiParam({ name: 'id', example: 'ckof123' })
  @ApiOkResponse({ type: OfferEntity })
  remove(@Param('id') id: string): Promise<OfferEntity> {
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
