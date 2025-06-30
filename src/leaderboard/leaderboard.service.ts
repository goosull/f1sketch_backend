import {
  Inject,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateLeaderboardEntryDto } from './dto/create-leaderboard.dto';
import { SUPABASE_CLIENT } from '../supabase/supabase.module';
import { Submission, LeaderboardRow } from './types';

@Injectable()
export class LeaderboardService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  /** 새 리더보드 엔트리 생성 */
  async create(dto: CreateLeaderboardEntryDto): Promise<LeaderboardRow> {
    // 1) submission 존재 여부 확인

    console.log(
      `리더보드 엔트리 생성 요청: submissionId=${dto.submissionId}, username=${dto.username}`,
    );
    const { data: sub, error: subErr } = await this.supabase
      .from('submission')
      .select('id')
      .eq('id', dto.submissionId)
      .single();
    if (subErr || !sub) {
      throw new NotFoundException('해당 Submission을 찾을 수 없습니다.');
    }

    const payload = {
      submission_id: dto.submissionId,
      username: dto.username,
    };
    console.log('→ Supabase에 넘기는 payload:', payload);

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
      .select('id, submission_id, username, created_at, submission(id,score)')
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    console.log('리더보드 항목 조회 결과:', data);

    const flattened = (data ?? []).map((r) => {
      const sub = (r as any).submission as Submission[];
      console.log('Flattened submission data:', sub);

      return {
        id: r.id,
        submission_id: r.submission_id,
        username: r.username,
        created_at: r.created_at,
        submission: sub[0] ?? null,
        accuracy: sub[0]?.score ?? 0,
      };
    });

    return flattened as LeaderboardRow[];
  }

  async findByTrack(trackId: string) {
    const { data, error } = await this.supabase
      .from('leaderboard_entry')
      // submission_id 포함, submission 안에 track_id·score만 가져오기
      .select(
        'id, username, created_at, submission_id, submission(track_id,score)',
      )
      // 관계 테이블 필터
      .eq('submission.track_id', trackId)
      // submission.score 내림차순 정렬
      .order('score', { foreignTable: 'submission', ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []).map((r) => {
      // nested submission 객체
      const sub = (r as any).submission as {
        track_id: number;
        score: number;
      } | null;

      return {
        id: r.id,
        username: r.username,
        created_at: r.created_at,
        submission_id: r.submission_id,
        // submission이 null이 아닐 때만 꺼내기
        track_id: sub?.track_id ?? null,
        score: sub?.score ?? 0,
      };
    });
  }
}
