// src/submission/submission.service.ts
import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

import { CreateSubmissionDto } from './dto/create-submission.dto';
import { Submission } from './entities/submission.entity';
import { SUPABASE_CLIENT } from '../supabase/supabase.module';

@Injectable()
export class SubmissionService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  /** 1) FastAPI로 유사도 계산, 2) Supabase에 결과 저장 */
  async create(dto: CreateSubmissionDto) {
    const { user_path_json, track_id } = dto;

    if (!Array.isArray(user_path_json) || user_path_json.length === 0) {
      throw new BadRequestException('user_path가 올바르지 않습니다.');
    }

    // 1) 트랙 정답 경로 조회
    const { data: track, error: trackError } = await this.supabase
      .from('track')
      .select('path_json')
      .eq('id', track_id)
      .single();

    if (trackError || !track) {
      throw new BadRequestException(
        `track_id=${track_id}인 트랙을 찾을 수 없습니다.`,
      );
    }

    const ground_truth = track.path_json as unknown as number[][];

    // 2) FastAPI 호출
    const apiUrl = this.config.get<string>('FASTAPI_URL');
    const resp$ = this.http.post(`${apiUrl}/compare`, {
      user_path: user_path_json,
      ground_truth,
    });
    const { score, distance, metric, normalized_user_path } =
      await lastValueFrom(resp$).then((r) => r.data);

    // 3) Supabase에 저장
    const payload = {
      id: crypto.randomUUID(),
      track_id,
      user_path_json: JSON.stringify(user_path_json),
      score,
      hausdorff: distance,
      created_at: new Date().toISOString(),
      normalized_user_path_json: JSON.stringify(normalized_user_path),
    };

    const { data: inserted, error: insertError } = await this.supabase
      .from('submission')
      .insert(payload)
      .select()
      .single();

    if (insertError) throw insertError;
    return { ...inserted };
  }

  async findAll() {
    return this.supabase.from('submission').select('*');
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase
      .from('submission')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new NotFoundException(`id=${id}인 제출을 찾을 수 없습니다.`);
    }

    return {
      id: data.id,
      track_id: data.track_id,
      username: data.username,
      created_at: data.created_at,
      score: data.score,
      hausdorff: data.hausdorff,
      user_path: JSON.parse(data.user_path_json) as number[][],
      normalized_user_path: JSON.parse(
        data.normalized_user_path_json,
      ) as number[][],
    };
  }
}
