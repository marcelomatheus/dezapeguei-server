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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { UserEntity } from './entities/user.entity';

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
  @ApiOperation({ summary: 'Update a user by id' })
  @ApiParam({ name: 'id', example: 'ckv8wk1p40001s6z7l4123efg' })
  @ApiOkResponse({ type: UserEntity })
  @ApiNotFoundResponse({ description: 'User not found' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by id' })
  @ApiParam({ name: 'id', example: 'ckv8wk1p40001s6z7l4123efg' })
  @ApiOkResponse({ type: UserEntity })
  remove(@Param('id') id: string): Promise<UserEntity> {
    return this.usersService.remove(id);
  }
}
