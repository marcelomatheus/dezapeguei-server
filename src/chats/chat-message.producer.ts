import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ChatJobData } from './interfaces/chat-job.interface';

@Injectable()
export class ChatMessageProducer {
  constructor(
    @InjectQueue('message-queue') private readonly messageQueue: Queue,
  ) {}

  async enqueueMessage(data: ChatJobData) {
    return this.messageQueue.add('message-job', data, {
      removeOnComplete: true,
      removeOnFail: true,
    });
  }
}
