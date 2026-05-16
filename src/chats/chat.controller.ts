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
  ApiBody,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ApiQuery } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { FindChatsQueryDto } from './dto/find-chats-query.dto';
import { FindOrCreateChatDto } from './dto/find-or-create-chat.dto';
import { ChatEntity } from './entities/chat.entity';
import { ChatResponseDto } from './dto/chat-response.dto';

@ApiTags('Chats')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiOperation({ summary: 'Create or reuse a chat between two users' })
  @ApiBody({
    type: CreateChatDto,
    examples: {
      default: {
        summary: 'Create direct chat',
        value: {
          participantIds: ['user_1', 'user_2'],
          offerId: 'offer_123',
          isGroup: false,
        },
      },
    },
  })
  @ApiCreatedResponse({ type: ChatEntity })
  @ApiBadRequestResponse({ description: 'Validation error' })
  create(@Body() dto: CreateChatDto): Promise<ChatEntity> {
    return this.chatService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List chats; optionally filter by participant' })
  @ApiQuery({
    name: 'participantIds',
    required: false,
    description: 'Array (or comma-separated) of participant ids to match',
    type: [String],
  })
  @ApiOkResponse({ type: ChatResponseDto, isArray: true })
  findAll(@Query() query: FindChatsQueryDto): Promise<ChatEntity[]> {
    return this.chatService.findAll(query);
  }

  @Post('find-or-create')
  @ApiOperation({
    summary: 'Find or create a direct chat between exactly two users',
  })
  @ApiBody({
    type: FindOrCreateChatDto,
    examples: {
      default: {
        summary: 'Find direct chat by participant pair',
        value: {
          participantIds: ['user_1', 'user_2'],
        },
      },
    },
  })
  @ApiCreatedResponse({ type: ChatEntity })
  @ApiBadRequestResponse({ description: 'Validation error' })
  findOrCreateDirect(@Body() dto: FindOrCreateChatDto): Promise<ChatEntity> {
    const [userA, userB] = dto.participantIds;
    return this.chatService.findOrCreateDirectChat(userA, userB);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a chat by id' })
  @ApiParam({ name: 'id', example: 'ckchat123' })
  @ApiOkResponse({ type: ChatResponseDto })
  @ApiNotFoundResponse({ description: 'Chat not found' })
  findById(@Param('id') id: string): Promise<ChatEntity> {
    return this.chatService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update chat participants' })
  @ApiParam({ name: 'id', example: 'ckchat123' })
  @ApiOkResponse({ type: ChatEntity })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateChatDto,
  ): Promise<ChatEntity> {
    return this.chatService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a chat by id' })
  @ApiParam({ name: 'id', example: 'ckchat123' })
  @ApiOkResponse({ type: ChatEntity })
  remove(@Param('id') id: string): Promise<ChatEntity> {
    return this.chatService.remove(id);
  }
}
