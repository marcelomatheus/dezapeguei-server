import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class SocketStoreService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async saveSocket(userId: string, socketId: string) {
    await this.redis.set(`socket:${userId}`, socketId, 'EX', 3600);
  }

  async getSocket(userId: string) {
    return this.redis.get(`socket:${userId}`);
  }

  async removeSocket(userId: string) {
    await this.redis.del(`socket:${userId}`);
  }
}
