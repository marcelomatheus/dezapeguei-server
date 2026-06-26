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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import {
  ApiBody,
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
import { SanitizePipe } from '../common/pipes/sanitize.pipe';
import { SupabaseAuthGuard } from '../auth/guards/user-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Messages')
@UseGuards(SupabaseAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Send a message' })
  @ApiBody({
    type: CreateMessageDto,
    examples: {
      default: {
        summary: 'Send text message',
        value: {
          chatId: 'chat_123',
          senderId: 'user_1',
          content: 'Oi, ainda está disponível?',
        },
      },
    },
  })
  @ApiCreatedResponse({ type: MessageEntity })
  @ApiBadRequestResponse({ description: 'Validation error' })
  create(
    @Body(new SanitizePipe()) dto: CreateMessageDto,
    @CurrentUser() user: User,
  ): Promise<MessageEntity> {
    return this.messagesService.create({ ...dto, senderId: user.id });
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
  @ApiBody({
    type: UpdateMessageDto,
    examples: {
      markRead: {
        summary: 'Mark message as read',
        value: {
          status: 'READ',
          readAt: '2026-01-10T12:00:00.000Z',
        },
      },
    },
  })
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
