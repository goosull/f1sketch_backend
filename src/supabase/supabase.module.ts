// src/supabase/supabase.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_CLIENT = 'SUPABASE_CLIENT';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: SUPABASE_CLIENT,
      useFactory: (cs: ConfigService): SupabaseClient => {
        const url = cs.get<string>('SUPABASE_URL');
        const key = cs.get<string>('SUPABASE_SERVICE_ROLE_KEY');
        if (!url) throw new Error('환경변수 DATABASE_URL을 설정해주세요.');
        if (!key)
          throw new Error('환경변수 SUPABASE_SERVICE_ROLE_KEY를 설정해주세요.');

        console.log('Supabase URL:', url);
        console.log('Supabase Service Role Key:', key);

        return createClient(url, key, {
          auth: { persistSession: false },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [SUPABASE_CLIENT],
})
export class SupabaseModule {}
