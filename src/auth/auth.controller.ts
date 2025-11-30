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
import { LoginDto } from './dto/create-auth.dto';
import { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SupabaseOwnerAuthGuard } from './supabase-owner-auth.guard';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @ApiOperation({
    summary: 'Create a new authentication entry',
  })
  @HttpCode(200)
  login(@Body() loginDto: LoginDto, @Res() res: Response, @Req() req: Request) {
    return this.authService.login(loginDto, res, req);
  }

  @Post('/forgot-password')
  @ApiOperation({
    summary: 'Send an email to redefine the forgotten password',
  })
  resetPasswordForEmail(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPasswordForEmail(resetPasswordDto);
  }

  @Post('/reset-password')
  @ApiOperation({
    summary: 'Page to redefine the forgotten password',
  })
  resetPassword(@Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.resetPassword(updateAuthDto);
  }

  @Post('/refresh-token')
  @ApiOperation({
    summary: 'Refresh authentication token using refresh token',
  })
  @HttpCode(200)
  refreshToken(@Req() request: Request, @Res() res: Response) {
    const cookies = request.cookies as { refresh_token?: string };
    if (
      !cookies.refresh_token ||
      cookies?.refresh_token === 'undefined' ||
      cookies?.refresh_token === undefined
    ) {
      console.error('No refresh token found in cookies');
      throw new UnauthorizedException('No refresh token found in cookies');
    } else {
      return this.authService.refreshToken(cookies.refresh_token, res);
    }
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
  @UseGuards(SupabaseOwnerAuthGuard)
  @ApiOperation({
    summary: 'Get user profile information',
  })
  async getProfile(@Body('token') token: string) {
    return this.authService.validateUser(token);
  }
}
