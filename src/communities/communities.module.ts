import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EntrepreneurModule } from '../entrepreneur/entrepreneur.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { CommunitiesController } from './communities.controller';
import { CommunitiesService } from './communities.service';
import { CommunityGateway } from './community.gateway';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, EntrepreneurModule],
  controllers: [CommunitiesController],
  providers: [CommunitiesService, CommunityGateway],
  exports: [CommunitiesService],
})
export class CommunitiesModule {}
