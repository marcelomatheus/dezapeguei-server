import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { EntrepreneurAccessService } from './entrepreneur-access.service';
import { EntrepreneurController } from './entrepreneur.controller';
import { EntrepreneurService } from './entrepreneur.service';
import { EntrepreneursPublicController } from './entrepreneurs-public.controller';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule],
  controllers: [EntrepreneurController, EntrepreneursPublicController],
  providers: [EntrepreneurService, EntrepreneurAccessService],
  exports: [EntrepreneurService, EntrepreneurAccessService],
})
export class EntrepreneurModule {}
