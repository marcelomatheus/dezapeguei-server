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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SupabaseAuthGuard } from './guards/user-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @ApiOperation({
    summary: 'Login user',
  })
  @HttpCode(200)
  login(@Body() loginDto: LoginDto, @Res() res: Response, @Req() req: Request) {
    return this.authService.login(loginDto, res, req);
  }

  @Post('/register')
  @ApiOperation({
    summary: 'Register a new user',
  })
  @HttpCode(201)
  register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    return this.authService.register(registerDto, res);
  }

  @Post('/refresh-token')
  @ApiOperation({
    summary: 'Refresh authentication token using refresh token',
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
  async getProfile(@Body('token') token: string) {
    return this.authService.validateUser(token);
  }
}
