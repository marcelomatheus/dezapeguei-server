import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedSocket } from '../../chats/interfaces/authenticated-socket.interface';
import { User } from '@prisma/client';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<AuthenticatedSocket>();
    const token = this.extractToken(client);
    if (!token) {
      throw new WsException('Unauthorized');
    }

    let user: User;
    try {
      const supabaseUser = await this.authService.validateUser(token);
      user = await this.usersService.findById(supabaseUser.id);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      client.data.user = user;
      client.data.userId = user.id;

      const chatId =
        (client.handshake.query.chatId as string) ||
        (client.handshake.auth.chatId as string);

      if (chatId && user) {
        const hasChat = await this.prisma.chat.findFirst({
          where: {
            id: chatId,
            participants: {
              some: { userId: user.id },
            },
          },
        });

        if (!hasChat) {
          throw new WsException('User does not belong to this chat');
        }
      }
      return true;
    } catch (_) {
      throw new WsException('Unauthorized');
    }
  }

  private extractToken(client: Socket): string | undefined {
    const [type, token] =
      client.handshake.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : (client.handshake.auth.token as string);
  }
}
