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
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { FindSalesQueryDto } from './dto/find-sales-query.dto';
import { SaleEntity } from './entities/sale.entity';

@ApiTags('Sales')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a sale for an offer' })
  @ApiCreatedResponse({ type: SaleEntity })
  @ApiBadRequestResponse({ description: 'Validation error' })
  create(@Body() dto: CreateSaleDto): Promise<SaleEntity> {
    return this.salesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List sales with optional filters' })
  @ApiOkResponse({ type: SaleEntity, isArray: true })
  findAll(@Query() query: FindSalesQueryDto): Promise<SaleEntity[]> {
    return this.salesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a sale by id' })
  @ApiParam({ name: 'id', example: 'cksale1' })
  @ApiOkResponse({ type: SaleEntity })
  @ApiNotFoundResponse({ description: 'Sale not found' })
  findById(@Param('id') id: string): Promise<SaleEntity> {
    return this.salesService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a sale by id' })
  @ApiParam({ name: 'id', example: 'cksale1' })
  @ApiOkResponse({ type: SaleEntity })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSaleDto,
  ): Promise<SaleEntity> {
    return this.salesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a sale by id' })
  @ApiParam({ name: 'id', example: 'cksale1' })
  @ApiOkResponse({ type: SaleEntity })
  remove(@Param('id') id: string): Promise<SaleEntity> {
    return this.salesService.remove(id);
  }
}
