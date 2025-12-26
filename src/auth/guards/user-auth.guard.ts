import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { User } from '@prisma/client';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or malformed Authorization header',
      );
    }

    const token = authHeader.split(' ')[1];
    let user: User;
    try {
      const supabaseUser = await this.authService.validateUser(token);
      user = await this.usersService.findById(supabaseUser.id);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
    } catch (err: unknown) {
      throw new UnauthorizedException(
        'Session expired or invalid: ' + (err as Error).message,
      );
    }
    request.user = user;

    return true;
  }
}
