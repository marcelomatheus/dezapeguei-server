import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBody,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { UserEntity } from './entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile } from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/guards/user-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Users')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiCreatedResponse({ type: UserEntity, description: 'User created' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  create(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'List users with optional filters' })
  @ApiOkResponse({ type: UserEntity, isArray: true })
  findAll(@Query() query: FindUsersQueryDto): Promise<UserEntity[]> {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiParam({ name: 'id', example: 'ckv8wk1p40001s6z7l4123efg' })
  @ApiOkResponse({ type: UserEntity })
  @ApiNotFoundResponse({ description: 'User not found' })
  findById(@Param('id') id: string): Promise<UserEntity> {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Update a user by id' })
  @ApiParam({ name: 'id', example: 'ckv8wk1p40001s6z7l4123efg' })
  @ApiOkResponse({ type: UserEntity })
  @ApiNotFoundResponse({ description: 'User not found' })
  update(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    if (currentUser.id !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }

    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by id' })
  @ApiParam({ name: 'id', example: 'ckv8wk1p40001s6z7l4123efg' })
  @ApiOkResponse({ type: UserEntity })
  remove(@Param('id') id: string): Promise<UserEntity> {
    return this.usersService.remove(id);
  }

  @Post(':id/avatar')
  @ApiOperation({ summary: 'Upload user avatar image' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', example: 'ckv8wk1p40001s6z7l4123efg' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['avatar'],
    },
  })
  @ApiOkResponse({ type: UserEntity })
  @UseInterceptors(FileInterceptor('avatar'))
  uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UserEntity> {
    return this.usersService.uploadAvatar(id, file);
  }
}
