import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ChatJobData } from './interfaces/chat-job.interface';
import { MessagesService } from '../messages/messages.service';
import { SocketStoreService } from '../socket-store/socket-store.service';
import { ChatGateway } from './chat.gateway';
import { Injectable } from '@nestjs/common';

@Injectable()
@Processor('message-queue')
export class ChatMessageProcessor extends WorkerHost {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly socketStoreService: SocketStoreService,
    private readonly chatGateway: ChatGateway,
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

    const message = await this.messagesService.create({
      chatId,
      senderId,
      content,
    });

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
  }
}
