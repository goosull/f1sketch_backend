import { LeaderboardEntry } from 'src/leaderboard/entities/leaderboard.entity';

export class Submission {
  id: string;
  score?: number;
  hausdorff?: number;
  normalized_user_path_json?: JSON;
  user_path_json?: JSON;
  track_id?: number;
  created_at: Date;

  leaderboardEntries: LeaderboardEntry[];
}
