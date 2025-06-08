// src/track/track.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { SUPABASE_CLIENT } from '../supabase/supabase.module';

@Injectable()
export class TrackService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  async create(createTrackDto: CreateTrackDto) {
    const { data, error } = await this.supabase
      .from('track')
      .insert(createTrackDto)
      .select();
    if (error) throw error;
    return data[0];
  }

  async findAll() {
    const { data, error } = await this.supabase.from('track').select('*');
    if (error) throw error;
    return data;
  }

  async findOne(id: number) {
    const { data, error } = await this.supabase
      .from('track')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async findNames() {
    const { data, error } = await this.supabase
      .from('track')
      .select('id, name');
    if (error) throw error;
    return data;
  }

  async update(id: number, updateTrackDto: UpdateTrackDto) {
    const { data, error } = await this.supabase
      .from('track')
      .update(updateTrackDto)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async remove(id: number) {
    const { data, error } = await this.supabase
      .from('track')
      .delete()
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
