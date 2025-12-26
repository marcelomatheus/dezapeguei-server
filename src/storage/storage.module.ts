import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { FileHelperService } from './file-helper.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  providers: [StorageService, FileHelperService],
  exports: [StorageService, FileHelperService],
  imports: [SupabaseModule, PrismaModule],
})
export class StorageModule {}
