import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login-auth.dto';
import { RegisterDto } from './dto/register.dto';
import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';
import { handleError } from '../utils/handle.errors.util';
import { User } from '@supabase/supabase-js';
import { Response, Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly prisma: PrismaService,
  ) {}
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

    const { session, user: supabaseUser } = data;
    const prismaUser = await this.prisma.user.findUnique({
      where: { id: supabaseUser.id },
    });

    if (!prismaUser) {
      throw new UnauthorizedException('User not found in database');
    }

    return res.json({
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      user: {
        id: prismaUser.id,
        name: prismaUser.name,
        email: prismaUser.email,
        phone: prismaUser.phone,
        cpf: prismaUser.cpf,
        avatar: prismaUser.avatar,
        bio: prismaUser.bio,
        rating: prismaUser.rating,
        salesCount: prismaUser.salesCount,
        purchasesCount: prismaUser.purchasesCount,
        city: prismaUser.city,
        state: prismaUser.state,
        createdAt: prismaUser.createdAt.toISOString(),
        updatedAt: prismaUser.updatedAt.toISOString(),
      },
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

    const { session, user: supabaseUser } = data;

    if (!supabaseUser) {
      throw new UnauthorizedException('User not found in session');
    }

    const prismaUser = await this.prisma.user.findUnique({
      where: { id: supabaseUser.id },
    });

    if (!prismaUser) {
      throw new UnauthorizedException('User not found in database');
    }

    return res.json({
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      user: {
        id: prismaUser.id,
        name: prismaUser.name,
        email: prismaUser.email,
        phone: prismaUser.phone,
        cpf: prismaUser.cpf,
        avatar: prismaUser.avatar,
        bio: prismaUser.bio,
        rating: prismaUser.rating,
        salesCount: prismaUser.salesCount,
        purchasesCount: prismaUser.purchasesCount,
        city: prismaUser.city,
        state: prismaUser.state,
        createdAt: prismaUser.createdAt.toISOString(),
        updatedAt: prismaUser.updatedAt.toISOString(),
      },
    });
  }
  async register(registerDto: RegisterDto, res: Response) {
    const supabaseClient = this.supabase.createClientForAuthentication();

    const { data, error } = await supabaseClient.auth.signUp({
      email: registerDto.email,
      password: registerDto.password,
    });

    if (error) {
      console.error('Error during Supabase signUp:', error);
      throw new UnprocessableEntityException(error.message);
    }

    if (!data?.user) {
      console.error(
        'No user or session returned from Supabase signUp, data:',
        data,
      );
      throw new UnprocessableEntityException('Failed to create user');
    }

    const { user: supabaseUser } = data;

    const prismaUser = await this.prisma.user
      .create({
        data: {
          id: supabaseUser.id,
          email: registerDto.email,
          name: registerDto.name,
          phone: registerDto.phone,
          cpf: registerDto?.cpf,
          plan: 'FREE',
        },
      })
      .catch((error: Error) => {
        handleError(error, 'AuthService.register');
      });

    return res.status(201).json({
      user: {
        id: prismaUser.id,
        name: prismaUser.name,
        email: prismaUser.email,
        phone: prismaUser.phone,
        cpf: prismaUser.cpf,
        avatar: prismaUser.avatar,
        bio: prismaUser.bio,
        rating: prismaUser.rating,
        salesCount: prismaUser.salesCount,
        purchasesCount: prismaUser.purchasesCount,
        city: prismaUser.city,
        state: prismaUser.state,
        createdAt: prismaUser.createdAt.toISOString(),
        updatedAt: prismaUser.updatedAt.toISOString(),
      },
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

  async signUpNewUser(signupPayload: CreateAuthDto) {
    const supabaseClient = this.supabase.getClient();

    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email: signupPayload.email,
        password: signupPayload.password,
        options: {
          emailRedirectTo: 'https://google.com',
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

  // async resetPasswordForEmail(resetPasswordDto: ResetPasswordDto) {
  //   const supabaseClient = this.supabase.getClient();
  //   try {
  //     const { data, error } = await supabaseClient.auth.resetPasswordForEmail(
  //       resetPasswordDto.email,
  //       {
  //         redirectTo: `${process.env.CLIENT_BASE_URL}/reset-password`,
  //       },
  //     );

  //     if (error) {
  //       console.error('Erro ao enviar o email:', error);
  //       throw error;
  //     }
  //     return data;
  //   } catch (err) {
  //     handleError(err as Error);
  //   }
  // }

  // async resetPassword(updateAuthDto: UpdateAuthDto) {
  //   const supabaseClient = this.supabase.getClient();

  //   try {
  //     if (updateAuthDto.refresh_token) {
  //       const { data: session, error: errSession } =
  //         await supabaseClient.auth.setSession({
  //           access_token: updateAuthDto.access_token,
  //           refresh_token: updateAuthDto.refresh_token,
  //         });

  //       if (errSession || session?.session.token_type !== 'bearer') {
  //         throw new BadRequestException('Token de recuperação inválido');
  //       }
  //     } else {
  //       const { error: errSession } = await supabaseClient.auth.setSession({
  //         access_token: updateAuthDto.access_token,
  //         refresh_token: null,
  //       });

  //       if (errSession) {
  //         console.error('Erro ao validar token de recovery:', errSession);
  //         throw new BadRequestException('Token de recovery inválido');
  //       }
  //     }

  //     const { data, error } = await supabaseClient.auth.updateUser({
  //       password: updateAuthDto.password,
  //     });

  //     if (error) {
  //       console.error('Erro ao redefinir a senha:', error);
  //       throw new BadRequestException('Falha ao redefinir a senha');
  //     }

  //     return data;
  //   } catch (err) {
  //     handleError(err as Error);
  //   }
  // }
}
