import {
  Inject,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateLeaderboardEntryDto } from './dto/create-leaderboard.dto';
import { SUPABASE_CLIENT } from '../supabase/supabase.module';
import { SubmissionRow, LeaderboardRow } from './types';

@Injectable()
export class LeaderboardService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  /** 새 리더보드 엔트리 생성 */
  async create(dto: CreateLeaderboardEntryDto): Promise<LeaderboardRow> {
    // 1) submission 존재 여부 확인
    const { data: sub, error: subErr } = await this.supabase
      .from('submission')
      .select('id')
      .eq('id', dto.submissionId)
      .single();
    if (subErr || !sub) {
      throw new NotFoundException('해당 Submission을 찾을 수 없습니다.');
    }

    // 2) leaderboard_entry 삽입 + 전체 컬럼 선택
    const { data: entryData, error: entryErr } = await this.supabase
      .from('leaderboard_entry')
      .insert({ submission_id: dto.submissionId, username: dto.username })
      .select('*')
      .single();
    if (entryErr) {
      throw new InternalServerErrorException(entryErr.message);
    }

    // 타입 단언으로 LeaderboardRow 로 반환
    return entryData as LeaderboardRow;
  }

  /** 모든 리더보드 항목 조회 (최신순) */
  async findAll(): Promise<LeaderboardRow[]> {
    const { data, error } = await this.supabase
      .from('leaderboard_entry')
      .select('id, submission_id, username, created_at, submission(id)')
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    // 배열로 온 submission을 꺼내서 단일 객체로 재조립
    const flattened = (data ?? []).map((r) => {
      const submissionArray = (r as any).submission as SubmissionRow[];
      const submissionObj =
        submissionArray.length > 0 ? submissionArray[0] : null;
      // 여기서 null 허용하려면 LeaderboardRow의 submission 타입을 SubmissionRow | null 로 바꿔주세요
      return {
        id: r.id,
        submission_id: r.submission_id,
        username: r.username,
        created_at: r.created_at,
        submission: submissionObj,
      };
    });

    return flattened as LeaderboardRow[];
  }

  async findByTrack(trackId: string) {
    const { data, error } = await this.supabase
      .from('leaderboard_entry')
      .select('id,username,created_at,submission(id,track_id,score)')
      .eq('submission.track_id', trackId)
      .order('submission.score', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []).map((r) => {
      const subArr = (r as any).submission as SubmissionRow[];
      return {
        id: r.id,
        username: r.username,
        created_at: r.created_at,
        submission: subArr[0] ?? null,
      };
    });
  }
}
