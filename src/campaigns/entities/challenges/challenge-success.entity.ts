import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChallengeSuccess {
  @ApiProperty({ description: 'Unique identifier of the challenge success' })
  id: string;

  @ApiProperty({ description: 'Challenge ID this success belongs to' })
  challengeId: string;

  @ApiProperty({ description: 'Campaign ID this success belongs to' })
  campaignId: string;

  @ApiProperty({
    description: 'Address of the participant who completed the challenge',
  })
  address: string;

  @ApiPropertyOptional({
    description: 'Points awarded for completing the challenge',
  })
  points?: number;

  @ApiProperty({ description: 'Timestamp when challenge was completed' })
  completedAt: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  lastUpdatedAt: Date;
}
