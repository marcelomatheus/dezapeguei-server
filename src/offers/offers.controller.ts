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
  UseInterceptors,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import {
  ApiBadRequestResponse,
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
}
