import { Module } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { LeaderboardController } from './leaderboard.controller';

@Module({
  imports: [SupabaseModule],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
})
export class LeaderboardModule {}
