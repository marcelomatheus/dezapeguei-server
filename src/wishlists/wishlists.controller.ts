import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { WishlistsService } from './wishlists.service';
import { FindWishlistsQueryDto } from './dto/find-wishlists-query.dto';
import { WishlistEntity } from './entities/wishlist.entity';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { RemoveWishlistItemDto } from './dto/remove-wishlist-item.dto';

@ApiTags('Wishlists')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Get()
  @ApiOperation({ summary: 'List wishlist entries (filter by user optional)' })
  @ApiOkResponse({ type: WishlistEntity, isArray: true })
  findAll(@Query() query: FindWishlistsQueryDto): Promise<WishlistEntity[]> {
    return this.wishlistsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a wishlist entry by id' })
  @ApiParam({ name: 'id', example: 'ckwl1' })
  @ApiOkResponse({ type: WishlistEntity })
  @ApiNotFoundResponse({ description: 'Wishlist not found' })
  findById(@Param('id') id: string): Promise<WishlistEntity> {
    return this.wishlistsService.findById(id);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add an offer to the user wishlist (Favoritos)' })
  @ApiOkResponse({ type: WishlistEntity })
  addItem(@Body() dto: AddWishlistItemDto): Promise<WishlistEntity> {
    return this.wishlistsService.addItem(dto);
  }

  @Delete('items')
  @ApiOperation({
    summary: 'Remove an offer from the user wishlist (Favoritos)',
  })
  @ApiOkResponse({ description: 'Removed' })
  removeItem(@Body() dto: RemoveWishlistItemDto): Promise<void> {
    return this.wishlistsService.removeItem(dto);
  }
}
