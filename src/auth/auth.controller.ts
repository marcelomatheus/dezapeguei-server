import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login-auth.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import type { Response, Request } from 'express';
import type { User } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiBody, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { SupabaseAuthGuard } from './guards/user-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @ApiOperation({
    summary: 'Login user',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      default: {
        summary: 'Valid credentials',
        value: {
          email: 'joao@example.com',
          password: 'SecurePass123!',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Authenticated user session',
    schema: {
      example: {
        accessToken: '<jwt-access-token>',
        refreshToken: '<jwt-refresh-token>',
        user: {
          id: 'user_123',
          name: 'Joao Silva',
          email: 'joao@example.com',
          phone: '+55 11 98888-7777',
          cpf: '123.456.789-00',
          avatar: null,
          bio: null,
          rating: 0,
          salesCount: 0,
          purchasesCount: 0,
          city: null,
          state: null,
          createdAt: '2026-01-10T12:00:00.000Z',
          updatedAt: '2026-01-10T12:00:00.000Z',
        },
      },
    },
  })
  @HttpCode(200)
  login(@Body() loginDto: LoginDto, @Res() res: Response) {
    return this.authService.login(loginDto, res);
  }

  @Post('/register')
  @ApiOperation({
    summary: 'Register a new user',
  })
  @ApiBody({
    type: RegisterDto,
    examples: {
      default: {
        summary: 'Valid register payload',
        value: {
          name: 'Joao Silva',
          email: 'joao@example.com',
          password: 'SecurePass123!',
          phone: '+55 11 98888-7777',
          cpf: '123.456.789-00',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Registered user profile',
    schema: {
      example: {
        user: {
          id: 'user_123',
          name: 'Joao Silva',
          email: 'joao@example.com',
          phone: '+55 11 98888-7777',
          cpf: '123.456.789-00',
          avatar: null,
          bio: null,
          rating: 0,
          salesCount: 0,
          purchasesCount: 0,
          city: null,
          state: null,
          createdAt: '2026-01-10T12:00:00.000Z',
          updatedAt: '2026-01-10T12:00:00.000Z',
        },
      },
    },
  })
  @HttpCode(201)
  register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    return this.authService.register(registerDto, res);
  }

  @Post('/refresh-token')
  @ApiOperation({
    summary: 'Refresh authentication token using refresh token',
  })
  @ApiBody({
    type: RefreshTokenDto,
    examples: {
      default: {
        summary: 'Refresh token payload',
        value: {
          refreshToken: '<jwt-refresh-token>',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Refreshed user session',
    schema: {
      example: {
        accessToken: '<new-jwt-access-token>',
        refreshToken: '<new-jwt-refresh-token>',
        user: {
          id: 'user_123',
          name: 'Joao Silva',
          email: 'joao@example.com',
        },
      },
    },
  })
  @HttpCode(200)
  refreshToken(
    @Body() body: RefreshTokenDto,
    @Req() request: Request,
    @Res() res: Response,
  ) {
    const token =
      body.refreshToken ||
      (request.cookies as { refresh_token?: string })?.refresh_token;

    if (!token || token === 'undefined') {
      console.error('No refresh token found');
      throw new UnauthorizedException('No refresh token provided');
    }

    return this.authService.refreshToken(token, res);
  }

  @Post('/logout')
  @ApiOperation({
    summary: 'Logout user and clear refresh token cookie',
  })
  @ApiOkResponse({
    description: 'Logout confirmation',
    schema: {
      example: {
        message: 'Logout successful',
      },
    },
  })
  @HttpCode(200)
  logout(@Res() res: Response) {
    return this.authService.logout(res);
  }

  @Get('/profile')
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({
    summary: 'Get user profile information',
  })
  @ApiOkResponse({
    description: 'Supabase user profile',
    schema: {
      example: {
        id: 'user_123',
        email: 'joao@example.com',
      },
    },
  })
  getProfile(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
    };
  }
}
