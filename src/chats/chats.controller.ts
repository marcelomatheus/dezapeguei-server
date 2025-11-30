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
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { FindChatsQueryDto } from './dto/find-chats-query.dto';
import { ChatEntity } from './entities/chat.entity';

@ApiTags('Chats')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  @ApiOperation({ summary: 'Create or reuse a chat between two users' })
  @ApiCreatedResponse({ type: ChatEntity })
  @ApiBadRequestResponse({ description: 'Validation error' })
  create(@Body() dto: CreateChatDto): Promise<ChatEntity> {
    return this.chatsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List chats; optionally filter by participant' })
  @ApiOkResponse({ type: ChatEntity, isArray: true })
  findAll(@Query() query: FindChatsQueryDto): Promise<ChatEntity[]> {
    return this.chatsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a chat by id' })
  @ApiParam({ name: 'id', example: 'ckchat123' })
  @ApiOkResponse({ type: ChatEntity })
  @ApiNotFoundResponse({ description: 'Chat not found' })
  findById(@Param('id') id: string): Promise<ChatEntity> {
    return this.chatsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update chat participants' })
  @ApiParam({ name: 'id', example: 'ckchat123' })
  @ApiOkResponse({ type: ChatEntity })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateChatDto,
  ): Promise<ChatEntity> {
    return this.chatsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a chat by id' })
  @ApiParam({ name: 'id', example: 'ckchat123' })
  @ApiOkResponse({ type: ChatEntity })
  remove(@Param('id') id: string): Promise<ChatEntity> {
    return this.chatsService.remove(id);
  }
}
