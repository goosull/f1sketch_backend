import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Submission } from '../../submission/entities/submission.entity';

@Entity('leaderboard_entry')
export class LeaderboardEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'varchar', length: 255 })
  username: string;

  @ManyToOne(() => Submission, (s) => s.leaderboardEntries, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'submission_id' })
  submission: Submission;
}
