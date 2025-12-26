import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';
import { SocketStoreService } from './socket-store.service';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis(String(process.env.REDIS_URL));
      },
    },
    SocketStoreService,
  ],
  exports: ['REDIS_CLIENT', SocketStoreService],
})
export class SocketStoreModule {}
