import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Injectable } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SocketStoreService } from '../socket-store/socket-store.service';
import { WsAuthGuard } from '../auth/guards/ws-auth.guard';
import { SendMessageDto } from './dto/send-message.dto';
import type { AuthenticatedSocket } from './interfaces/authenticated-socket.interface';
import { MessagesService } from '../messages/messages.service';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { MessageEntity } from '../messages/entities/message.entity';
import { ChatMessageProducer } from './chat-message.producer';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly messagesService: MessagesService,
    private readonly socketStoreService: SocketStoreService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly chatMessageProducer: ChatMessageProducer,
  ) {}

  afterInit() {
    console.info('WebSocket server initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        this.emitError(client, 'Missing authentication token');
        client.disconnect();
        return;
      }

      const supabaseUser = await this.authService.validateUser(token);
      const user = await this.usersService.findById(supabaseUser.id);

      await this.socketStoreService.saveSocket(user.id, client.id);

      const since = this.parseDate(
        client.handshake.query.lastMessageCreatedAt as string,
      );
      const messages = await this.messagesService.getMessagesSince(
        user.id,
        since,
      );
      await this.emitMissedMessages(client, messages);

      const authClient = client as AuthenticatedSocket;
      authClient.data.user = user;
      authClient.data.userId = user.id;
    } catch (_error) {
      console.error('WebSocket connection error:', _error);
      this.emitError(client, 'Authentication failed');
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const authClient = client as AuthenticatedSocket;
    if (authClient.data.userId) {
      await this.socketStoreService.removeSocket(authClient.data.userId);
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: SendMessageDto,
  ) {
    try {
      const senderId = client.data.userId;
      if (!senderId) {
        this.emitError(client, 'Unable to resolve authenticated user');
        return;
      }

      const recipientId = payload.recipientId;
      let chatId = payload.chatId;
      const clientRequestId = payload.clientRequestId ?? null;

      if (!chatId && !recipientId) {
        this.emitError(
          client,
          'recipientId is required when chatId is not provided',
          {
            clientRequestId,
            chatId: null,
          },
        );
        return;
      }

      let chat = chatId ? await this.chatService.findById(chatId) : null;
      if (!chat && recipientId) {
        chat = await this.chatService.findOrCreateDirectChat(
          senderId,
          recipientId,
        );
        chatId = chat.id;
      }

      if (!chat || !chat.participants.some((p) => p.userId === senderId)) {
        this.emitError(client, 'Chat not found or unauthorized', {
          clientRequestId,
          chatId: chatId ?? null,
        });
        return;
      }

      const participantIds = chat.participants.map((p) => p.userId);
      await this.chatMessageProducer.enqueueMessage({
        chatId: chat.id,
        senderId,
        content: payload.content,
        participantIds,
        clientRequestId: clientRequestId ?? undefined,
      });
    } catch (_error) {
      console.error('Failed to send message:', _error);
      this.emitError(client, 'Failed to send message', {
        clientRequestId: payload?.clientRequestId ?? null,
        chatId: payload?.chatId ?? null,
      });
    }
  }

  private extractToken(client: Socket): string | undefined {
    const [type, token] =
      client.handshake.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer'
      ? token
      : (client.handshake.auth.token as string | undefined);
  }

  private emitError(
    client: Socket,
    message: string,
    context?: { clientRequestId?: string | null; chatId?: string | null },
  ) {
    client.emit('error', {
      error: message,
      clientRequestId: context?.clientRequestId ?? null,
      chatId: context?.chatId ?? null,
    });
  }

  private parseDate(value?: string): Date | undefined {
    if (!value) return undefined;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('syncMessages')
  async handleSyncMessages(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { since?: string },
  ) {
    const userId = client.data.userId;
    if (!userId) {
      this.emitError(client, 'Unable to resolve authenticated user');
      return;
    }

    const since = this.parseDate(payload?.since);
    const messages = await this.messagesService.getMessagesSince(userId, since);
    await this.emitMissedMessages(client, messages);
  }

  private async emitMissedMessages(client: Socket, messages: MessageEntity[]) {
    const BATCH_SIZE = 20;
    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
      const batch = messages.slice(i, i + BATCH_SIZE);
      client.emit('missedMessages', batch);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    client.emit('syncComplete', { total: messages.length });
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { messageId: string },
  ) {
    try {
      const userId = client.data.userId;
      if (!userId) {
        this.emitError(client, 'Unable to resolve authenticated user');
        return;
      }

      const message = await this.messagesService.update(payload.messageId, {
        status: 'READ' as any,
        readAt: new Date(),
      });

      if (!message) {
        this.emitError(client, 'Message not found');
        return;
      }

      const senderSocketId = await this.socketStoreService.getSocket(
        message.senderId,
      );
      if (senderSocketId && message.senderId !== userId) {
        this.server.to(senderSocketId).emit('messageRead', {
          messageId: payload.messageId,
          readAt: message.readAt,
          readBy: userId,
        });
      }

      client.emit('messageMarkedAsRead', {
        success: true,
        messageId: payload.messageId,
      });
    } catch (_error) {
      console.error('Failed to mark message as read:', _error);
      this.emitError(client, 'Failed to mark message as read');
    }
  }
}
