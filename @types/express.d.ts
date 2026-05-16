import { Account, User } from '@prisma/client';

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }
    }

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
