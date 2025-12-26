import { User } from '@prisma/client';
import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  data: {
    user: User;
    userId?: string;
  };
}
