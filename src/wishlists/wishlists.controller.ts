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
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { FindWishlistsQueryDto } from './dto/find-wishlists-query.dto';
import { WishlistEntity } from './entities/wishlist.entity';

@ApiTags('Wishlists')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a wishlist for a user' })
  @ApiCreatedResponse({ type: WishlistEntity })
  @ApiBadRequestResponse({ description: 'Validation error' })
  create(@Body() dto: CreateWishlistDto): Promise<WishlistEntity> {
    return this.wishlistsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List wishlists (optionally by user)' })
  @ApiOkResponse({ type: WishlistEntity, isArray: true })
  findAll(@Query() query: FindWishlistsQueryDto): Promise<WishlistEntity[]> {
    return this.wishlistsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a wishlist by id' })
  @ApiParam({ name: 'id', example: 'ckwl1' })
  @ApiOkResponse({ type: WishlistEntity })
  @ApiNotFoundResponse({ description: 'Wishlist not found' })
  findById(@Param('id') id: string): Promise<WishlistEntity> {
    return this.wishlistsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a wishlist by id' })
  @ApiParam({ name: 'id', example: 'ckwl1' })
  @ApiOkResponse({ type: WishlistEntity })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWishlistDto,
  ): Promise<WishlistEntity> {
    return this.wishlistsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a wishlist by id' })
  @ApiParam({ name: 'id', example: 'ckwl1' })
  @ApiOkResponse({ type: WishlistEntity })
  remove(@Param('id') id: string): Promise<WishlistEntity> {
    return this.wishlistsService.remove(id);
  }
}
