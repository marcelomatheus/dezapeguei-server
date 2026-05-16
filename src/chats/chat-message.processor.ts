import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ChatJobData } from './interfaces/chat-job.interface';
import { MessagesService } from '../messages/messages.service';
import { SocketStoreService } from '../socket-store/socket-store.service';
import { ChatGateway } from './chat.gateway';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessageEntity } from '../messages/entities/message.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
@Processor('message-queue')
export class ChatMessageProcessor extends WorkerHost {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly socketStoreService: SocketStoreService,
    private readonly chatGateway: ChatGateway,
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {
    super();
  }

  async process(job: Job<ChatJobData>) {
    if (job.name !== 'message-job') {
      return;
    }
    const { chatId, senderId, content, participantIds, clientRequestId } =
      job.data;

    if (!participantIds?.length) {
      throw new Error('Message job missing participant list');
    }

    const referenceMessage = await this.createOfferReferenceMessage(
      chatId,
      senderId,
    );

    const message = await this.messagesService.create({
      chatId,
      senderId,
      content,
    });

    if (referenceMessage) {
      for (const participantId of participantIds) {
        const socketId = await this.socketStoreService.getSocket(participantId);
        if (!socketId) {
          continue;
        }

        this.chatGateway.server.to(socketId).emit('message', referenceMessage);
      }
    }

    for (const participantId of participantIds) {
      const socketId = await this.socketStoreService.getSocket(participantId);
      if (!socketId) {
        continue;
      }

      if (participantId === senderId) {
        this.chatGateway.server.to(socketId).emit('messageSent', {
          success: true,
          chatId,
          clientRequestId: clientRequestId ?? null,
          message,
        });
      } else {
        this.chatGateway.server.to(socketId).emit('message', message);
      }
    }

    await this.notifyOfflineParticipants(
      participantIds,
      senderId,
      chatId,
      content,
    );
  }

  private async notifyOfflineParticipants(
    participantIds: string[],
    senderId: string,
    chatId: string,
    content: string,
  ): Promise<void> {
    const recipients = participantIds.filter(
      (participantId) => participantId !== senderId,
    );

    await Promise.all(
      recipients.map(async (recipientId) => {
        const socketId = await this.socketStoreService.getSocket(recipientId);
        if (socketId) {
          return;
        }

        await this.notificationsService.create({
          userId: recipientId,
          message: `Nova mensagem recebida: ${content.slice(0, 80)}`,
          redirect: `/chats/${chatId}`,
          isRead: false,
        });
      }),
    );
  }

  private async createOfferReferenceMessage(
    chatId: string,
    senderId: string,
  ): Promise<MessageEntity | null> {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        offer: {
          select: {
            id: true,
            title: true,
            price: true,
            imageUrl: true,
          },
        },
      },
    });

    if (!chat?.offerId || !chat.offer) {
      return null;
    }

    const messageCount = await this.prisma.message.count({
      where: {
        chatId,
        deletedAt: null,
      },
    });

    if (messageCount > 0) {
      return null;
    }

    const referencePayload = JSON.stringify({
      type: 'offer-reference',
      offer: {
        id: chat.offer.id,
        title: chat.offer.title,
        price: chat.offer.price,
        imageUrl: chat.offer.imageUrl,
      },
    });

    const created = await this.prisma.message.create({
      data: {
        chatId,
        senderId,
        content: referencePayload,
        type: 'OFFER',
        status: 'SENT',
      },
    });

    return new MessageEntity(created);
  }
}
