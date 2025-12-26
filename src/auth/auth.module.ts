import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { UsersModule } from '../users/users.module';
import { SupabaseAuthGuard } from './guards/user-auth.guard';
import { WsAuthGuard } from './guards/ws-auth.guard';

@Module({
  imports: [SupabaseModule, UsersModule],
  controllers: [AuthController],
  providers: [AuthService, SupabaseAuthGuard, WsAuthGuard],
  exports: [AuthService, SupabaseAuthGuard, WsAuthGuard],
})
export class AuthModule {}
