import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new InternalServerErrorException(
        'Missing Supabase environment variables.',
      );
    }

    this.supabase = createClient(url, key);
    console.info('Supabase client initialized');
  }

  getClient() {
    return this.supabase;
  }

  createClientForAuthentication(): SupabaseClient {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      throw new InternalServerErrorException(
        'Missing Supabase environment variables.',
      );
    }

    return createClient(url, anonKey, {
      auth: { persistSession: false },
    });
  }
}
