import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackModule } from './track/track.module';
import { SupabaseModule } from './supabase/supabase.module';
import { SubmissionModule } from './submission/submission.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';

// 필요한 엔티티만 명시적으로 import
import { Track } from './track/entities/track.entity';
import { Submission } from './submission/entities/submission.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.local' }),
    TrackModule,
    SupabaseModule,

    // TypeORM 설정: 엔티티를 명시적으로 지정하여 LeaderboardEntry 엔티티는 제외
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (cs: ConfigService) => ({
        type: 'postgres',
        url: cs.get('DATABASE_URL'),
        ssl: { rejectUnauthorized: false },
        entities: [Track, Submission],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),

    SubmissionModule,
    LeaderboardModule,
  ],
})
export class AppModule {}
