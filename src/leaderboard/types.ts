import { Submission } from 'src/submission/entities/submission.entity';

export { Submission };

export interface LeaderboardRow {
  id: number;
  submission_id: string;
  username: string;
  created_at: string;
  submission?: Submission;
}
