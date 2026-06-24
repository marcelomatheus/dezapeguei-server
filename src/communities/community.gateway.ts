import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import type { AuthenticatedSocket } from '../chats/interfaces/authenticated-socket.interface';
import { CommunitiesService } from './communities.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class CommunityGateway {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly communitiesService: CommunitiesService,
  ) {}

  @SubscribeMessage('community:join')
  async join(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { communityId: string },
  ) {
    const userId = await this.resolveUserId(client);
    if (!userId) return;

    try {
      await this.communitiesService.join(payload.communityId, userId);
      await client.join(this.room(payload.communityId));
      client.emit('community:joined', { communityId: payload.communityId });
    } catch (error) {
      this.emitError(client, error);
    }
  }

  @SubscribeMessage('community:leave')
  async leave(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { communityId: string },
  ) {
    const userId = await this.resolveUserId(client);
    if (!userId) return;

    try {
      await this.communitiesService.leave(payload.communityId, userId);
      await client.leave(this.room(payload.communityId));
      client.emit('community:left', { communityId: payload.communityId });
    } catch (error) {
      this.emitError(client, error);
    }
  }

  @SubscribeMessage('community:message:send')
  async sendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { communityId: string; content: string },
  ) {
    const userId = await this.resolveUserId(client);
    if (!userId) return;

    try {
      const message = await this.communitiesService.sendMessage(
        payload.communityId,
        userId,
        { content: payload.content },
      );
      this.server
        .to(this.room(payload.communityId))
        .emit('community:message:new', message);
    } catch (error) {
      this.emitError(client, error);
    }
  }

  @SubscribeMessage('community:offer:send')
  async sendOffer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    payload: { communityId: string; offerId: string; content?: string },
  ) {
    const userId = await this.resolveUserId(client);
    if (!userId) return;

    try {
      const message = await this.communitiesService.sendOffer(
        payload.communityId,
        userId,
        { offerId: payload.offerId, content: payload.content },
      );
      this.server
        .to(this.room(payload.communityId))
        .emit('community:offer:new', message);
    } catch (error) {
      this.emitError(client, error);
    }
  }

  private async resolveUserId(client: AuthenticatedSocket): Promise<string | null> {
    if (client.data.userId) return client.data.userId;
    const token = this.extractToken(client);
    if (!token) {
      this.emitError(client, 'Unauthorized');
      return null;
    }

    try {
      const supabaseUser = await this.authService.validateUser(token);
      const user = await this.usersService.findById(supabaseUser.id);
      client.data.user = user;
      client.data.userId = user.id;
      return user.id;
    } catch (_error) {
      this.emitError(client, 'Unauthorized');
      return null;
    }
  }

  private extractToken(client: Socket): string | undefined {
    const [type, token] =
      client.handshake.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer'
      ? token
      : (client.handshake.auth.token as string | undefined);
  }

  private room(communityId: string) {
    return `community:${communityId}`;
  }

  private emitError(client: Socket, error: unknown) {
    client.emit('community:error', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
