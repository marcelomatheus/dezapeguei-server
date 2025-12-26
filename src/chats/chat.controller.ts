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
import { ApiQuery } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { FindChatsQueryDto } from './dto/find-chats-query.dto';
import { FindOrCreateChatDto } from './dto/find-or-create-chat.dto';
import { ChatEntity } from './entities/chat.entity';

@ApiTags('Chats')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiOperation({ summary: 'Create or reuse a chat between two users' })
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
  @ApiOkResponse({ type: ChatEntity, isArray: true })
  findAll(@Query() query: FindChatsQueryDto): Promise<ChatEntity[]> {
    return this.chatService.findAll(query);
  }

  @Post('find-or-create')
  @ApiOperation({
    summary: 'Find or create a direct chat between exactly two users',
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
  @ApiOkResponse({ type: ChatEntity })
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
