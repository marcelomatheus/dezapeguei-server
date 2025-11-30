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
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { FindMessagesQueryDto } from './dto/find-messages-query.dto';
import { MessageEntity } from './entities/message.entity';

@ApiTags('Messages')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Send a message' })
  @ApiCreatedResponse({ type: MessageEntity })
  @ApiBadRequestResponse({ description: 'Validation error' })
  create(@Body() dto: CreateMessageDto): Promise<MessageEntity> {
    return this.messagesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List messages with optional filters' })
  @ApiOkResponse({ type: MessageEntity, isArray: true })
  findAll(@Query() query: FindMessagesQueryDto): Promise<MessageEntity[]> {
    return this.messagesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a message by id' })
  @ApiParam({ name: 'id', example: 'ckmsg123' })
  @ApiOkResponse({ type: MessageEntity })
  @ApiNotFoundResponse({ description: 'Message not found' })
  findById(@Param('id') id: string): Promise<MessageEntity> {
    return this.messagesService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a message by id' })
  @ApiParam({ name: 'id', example: 'ckmsg123' })
  @ApiOkResponse({ type: MessageEntity })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMessageDto,
  ): Promise<MessageEntity> {
    return this.messagesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a message by id' })
  @ApiParam({ name: 'id', example: 'ckmsg123' })
  @ApiOkResponse({ type: MessageEntity })
  remove(@Param('id') id: string): Promise<MessageEntity> {
    return this.messagesService.remove(id);
  }
}
