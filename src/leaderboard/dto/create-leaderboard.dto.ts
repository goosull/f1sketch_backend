import { IsUUID, IsString, Length } from 'class-validator';

export class CreateLeaderboardEntryDto {
  @IsUUID()
  submissionId: string;

  @IsString()
  @Length(2, 30)
  username: string;
}
