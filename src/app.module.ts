import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { OffersModule } from './offers/offers.module';
import { CategoriesModule } from './categories/categories.module';
import { ChatsModule } from './chats/chats.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SalesModule } from './sales/sales.module';
import { WishlistsModule } from './wishlists/wishlists.module';
import { AuthModule } from './auth/auth.module';
import { SupabaseModule } from './supabase/supabase.module';
import { StorageModule } from './storage/storage.module';
import { OpenaiModule } from './openai/openai.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    OffersModule,
    CategoriesModule,
    ChatsModule,
    MessagesModule,
    NotificationsModule,
    SalesModule,
    WishlistsModule,
    AuthModule,
    SupabaseModule,
    StorageModule,
    OpenaiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
