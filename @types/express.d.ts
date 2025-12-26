import { Account, User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      account?: Account;
      user?: User;
      cookies: { refresh_token?: string };
    }
    interface Query {
      organizationId?: string;
      phone?: string;
    }
    interface Headers {
      'x-api-key'?: string;
    }
  }
}

export {};
