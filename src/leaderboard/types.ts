export interface SubmissionRow {
  id: string;
}

export interface LeaderboardRow {
  id: number;
  submission_id: string;
  username: string;
  created_at: string;
  submission?: SubmissionRow;
}
