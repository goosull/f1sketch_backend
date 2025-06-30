// src/leaderboard/leaderboard.controller.ts
import { Body, Query, Param, Controller, Get, Post } from '@nestjs/common';
import { CreateLeaderboardEntryDto } from './dto/create-leaderboard.dto';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardRow, TrackLeaderboardRow } from './types';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly lbService: LeaderboardService) {}

  @Post()
  create(@Body() dto: CreateLeaderboardEntryDto): Promise<LeaderboardRow> {
    return this.lbService.create(dto);
  }

  @Get()
  list(): Promise<LeaderboardRow[]> {
    return this.lbService.findAll();
  }

  @Get('track/:trackId')
  findByTrack(
    @Param('trackId') trackId: string,
  ): Promise<TrackLeaderboardRow[]> {
    return this.lbService.findByTrack(trackId);
  }
}
