import { Module } from '@nestjs/common';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { StorageModule } from '../storage/storage.module';
import { OwnerGuard } from './guards/owner.guard';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { EntrepreneurModule } from '../entrepreneur/entrepreneur.module';

@Module({
  imports: [
    StorageModule,
    AuthModule,
    NotificationsModule,
    UsersModule,
    EntrepreneurModule,
  ],
  controllers: [OffersController],
  providers: [OffersService, OwnerGuard],
})
export class OffersModule {}
