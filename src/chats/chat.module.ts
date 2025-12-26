import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ChatGateway } from './chat.gateway';
import { ChatMessageProducer } from './chat-message.producer';
import { ChatMessageProcessor } from './chat-message.processor';
import { MessagesModule } from '../messages/messages.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { SocketStoreModule } from '../socket-store/socket-store.module';

@Module({
  imports: [
    PrismaModule,
    MessagesModule,
    AuthModule,
    UsersModule,
    SocketStoreModule,
    BullModule.registerQueue({
      name: 'message-queue',
    }),
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatGateway,
    ChatMessageProducer,
    ChatMessageProcessor,
  ],
  exports: [ChatService],
})
export class ChatModule {}
