import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { OffersModule } from './offers/offers.module';
import { CategoriesModule } from './categories/categories.module';
import { ChatModule } from './chats/chat.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SalesModule } from './sales/sales.module';
import { WishlistsModule } from './wishlists/wishlists.module';
import { AuthModule } from './auth/auth.module';
import { SupabaseModule } from './supabase/supabase.module';
import { StorageModule } from './storage/storage.module';
import { OpenaiModule } from './openai/openai.module';
import { SocketStoreModule } from './socket-store/socket-store.module';
import { EntrepreneurModule } from './entrepreneur/entrepreneur.module';
import { PaymentsModule } from './payments/payments.module';
import { CommunitiesModule } from './communities/communities.module';
import { BullModule } from '@nestjs/bullmq';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60_000,
          limit: 120,
        },
      ],
    }),
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL,
      },
    }),
    PrismaModule,
    UsersModule,
    OffersModule,
    CategoriesModule,
    ChatModule,
    MessagesModule,
    NotificationsModule,
    SalesModule,
    WishlistsModule,
    AuthModule,
    SupabaseModule,
    StorageModule,
    OpenaiModule,
    SocketStoreModule,
    EntrepreneurModule,
    PaymentsModule,
    CommunitiesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
