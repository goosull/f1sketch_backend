import { Module } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { SubmissionController } from './submission.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    SupabaseModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (cs: ConfigService) => ({
        baseURL: cs.get<string>('FASTAPI_URL'),
        timeout: 5_000,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService],
})
export class SubmissionModule {}
