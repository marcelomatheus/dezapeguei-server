import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateAuthDto, LoginDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { SupabaseService } from '../supabase/supabase.service';
import { Signup } from './entities/signup.entity';
import { handleError } from '../../utils/handle.errors.util';
import { User } from '@supabase/supabase-js';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Response, Request } from 'express';

@Injectable()
export class AuthService {
  constructor(private readonly supabase: SupabaseService) {}
  async login(loginDto: LoginDto, res: Response, req: Request) {
    const supabaseClient = this.supabase.createClientForAuthentication();
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: loginDto.email,
      password: loginDto.password,
    });
    if (error) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!data?.session) {
      throw new UnauthorizedException('No session returned from login');
    }

    const { session, user } = data;
    // Safely resolve user-agent header: string | string[] | undefined -> string
    const uaHeader = req.headers['user-agent'] as string | string[] | undefined;
    const ua: string = (Array.isArray(uaHeader) ? uaHeader[0] : uaHeader) ?? '';

    // const isSafari = /safari/i.test(ua) && !/chrome|crios|android/i.test(ua);

    // res.cookie('refresh_token', session.refresh_token, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: isSafari ? 'lax' : 'none',
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });
    return res.json({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: new Date(session.expires_at * 1000),
      token_type: session.token_type,
      user,
    });
  }
  async refreshToken(refresh_token: string, res: Response) {
    if (!refresh_token)
      throw new UnauthorizedException('No refresh token found');

    const supabaseClient = this.supabase.createClientForAuthentication();

    const { data, error } = await supabaseClient.auth.refreshSession({
      refresh_token,
    });

    if (error || !data?.session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const { session, user } = data;
    // res.cookie('refresh_token', session.refresh_token, {
    //   httpOnly: true,
    //   secure: process.env.ENVIRONMENT === 'production',
    //   sameSite: process.env.ENVIRONMENT === 'production' ? 'none' : 'lax',
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    //   path: '/',
    // });
    return res.json({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: new Date(session.expires_at * 1000),
      token_type: session.token_type,
      user,
    });
  }

  logout(res: Response) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.ENVIRONMENT === 'production',
      sameSite: process.env.ENVIRONMENT === 'production' ? 'none' : 'lax',
      path: '/',
    });
    return res.json({
      message: 'Logout successful',
    });
  }

  async validateUser(token: string): Promise<User> {
    const supabaseClient = this.supabase.getClient();
    const {
      data: { user },
      error,
    } = await supabaseClient.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }

  async signUpNewUser(signupPayload: Signup) {
    const supabaseClient = this.supabase.getClient();

    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email: signupPayload.email,
        password: signupPayload.password,
        options: {
          emailRedirectTo: 'https://pillot.com.br',
        },
      });

      if (error) {
        throw new UnprocessableEntityException(error.message);
      }

      if (!data?.user) {
        throw new Error('Erro na criação da conta: usuário não retornado.');
      }

      return data.user;
    } catch (err) {
      handleError(err as Error);
    }
  }

  async resetPasswordForEmail(resetPasswordDto: ResetPasswordDto) {
    const supabaseClient = this.supabase.getClient();
    try {
      const { data, error } = await supabaseClient.auth.resetPasswordForEmail(
        resetPasswordDto.email,
        {
          redirectTo: `${process.env.CLIENT_BASE_URL}/reset-password`,
        },
      );

      if (error) {
        console.error('Erro ao enviar o email:', error);
        throw error;
      }
      return data;
    } catch (err) {
      handleError(err as Error);
    }
  }

  async resetPassword(updateAuthDto: UpdateAuthDto) {
    const supabaseClient = this.supabase.getClient();

    try {
      if (updateAuthDto.refresh_token) {
        const { data: session, error: errSession } =
          await supabaseClient.auth.setSession({
            access_token: updateAuthDto.access_token,
            refresh_token: updateAuthDto.refresh_token,
          });

        if (errSession || session?.session.token_type !== 'bearer') {
          throw new BadRequestException('Token de recuperação inválido');
        }
      } else {
        const { error: errSession } = await supabaseClient.auth.setSession({
          access_token: updateAuthDto.access_token,
          refresh_token: null,
        });

        if (errSession) {
          console.error('Erro ao validar token de recovery:', errSession);
          throw new BadRequestException('Token de recovery inválido');
        }
      }

      const { data, error } = await supabaseClient.auth.updateUser({
        password: updateAuthDto.password,
      });

      if (error) {
        console.error('Erro ao redefinir a senha:', error);
        throw new BadRequestException('Falha ao redefinir a senha');
      }

      return data;
    } catch (err) {
      handleError(err as Error);
    }
  }

  create(createAuthDto: CreateAuthDto, res: Response, req: Request) {
    return this.login(createAuthDto, res, req);
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = updateAuthDto;
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
