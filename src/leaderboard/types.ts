import { Submission } from 'src/submission/entities/submission.entity';

export { Submission };

export interface LeaderboardRow {
  id: number;
  submission_id: string;
  username: string;
  created_at: string;
  submission?: Submission;
}

export interface TrackLeaderboardRow {
  id: number;
  username: string | null;
  created_at: string;
  submission_id: string;
  track_id: number | null;
  score: number;
}
