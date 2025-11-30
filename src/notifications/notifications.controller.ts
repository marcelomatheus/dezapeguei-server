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
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { FindNotificationsQueryDto } from './dto/find-notifications-query.dto';
import { NotificationEntity } from './entities/notification.entity';

@ApiTags('Notifications')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a notification' })
  @ApiCreatedResponse({ type: NotificationEntity })
  @ApiBadRequestResponse({ description: 'Validation error' })
  create(@Body() dto: CreateNotificationDto): Promise<NotificationEntity> {
    return this.notificationsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List notifications with optional filters' })
  @ApiOkResponse({ type: NotificationEntity, isArray: true })
  findAll(
    @Query() query: FindNotificationsQueryDto,
  ): Promise<NotificationEntity[]> {
    return this.notificationsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a notification by id' })
  @ApiParam({ name: 'id', example: 'ckn1' })
  @ApiOkResponse({ type: NotificationEntity })
  @ApiNotFoundResponse({ description: 'Notification not found' })
  findById(@Param('id') id: string): Promise<NotificationEntity> {
    return this.notificationsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a notification by id' })
  @ApiParam({ name: 'id', example: 'ckn1' })
  @ApiOkResponse({ type: NotificationEntity })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateNotificationDto,
  ): Promise<NotificationEntity> {
    return this.notificationsService.update(id, dto);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', example: 'ckn1' })
  @ApiOkResponse({ type: NotificationEntity })
  markAsRead(@Param('id') id: string): Promise<NotificationEntity> {
    return this.notificationsService.markAsRead(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification by id' })
  @ApiParam({ name: 'id', example: 'ckn1' })
  @ApiOkResponse({ type: NotificationEntity })
  remove(@Param('id') id: string): Promise<NotificationEntity> {
    return this.notificationsService.remove(id);
  }
}
