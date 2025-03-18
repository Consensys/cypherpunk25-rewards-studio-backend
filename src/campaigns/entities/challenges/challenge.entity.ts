import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Reward } from '../rewards/reward.entity';
import { ChallengeTypeData } from './challenge-type-data.entity';

export enum ChallengeType {
  METAMASK_BRIDGE = 'METAMASK_BRIDGE',
  METAMASK_SWAP = 'METAMASK_SWAP',
  NFT_OWNERSHIP_BY_QUANTITY = 'NFT_OWNERSHIP_BY_QUANTITY',
  NFT_OWNERSHIP_BY_TOKEN = 'NFT_OWNERSHIP_BY_TOKEN',
}

export class Challenge {
  @ApiProperty({ description: 'Unique identifier of the challenge' })
  id: string;

  @ApiProperty({ description: 'Campaign ID this challenge belongs to' })
  campaignId: string;

  @ApiProperty({ description: 'Name of the challenge' })
  name: string;

  @ApiPropertyOptional({ description: 'URI of the challenge image' })
  imageUri?: string;

  @ApiProperty({ description: 'Operator for the challenge' })
  operator: string;

  @ApiProperty({ description: 'Type of the challenge', enum: ChallengeType })
  type: ChallengeType;

  @ApiPropertyOptional({ description: 'Points awarded for the challenge' })
  points?: number;

  @ApiProperty({
    description: 'Additional data specific to the challenge type',
  })
  typeData: ChallengeTypeData;

  @ApiPropertyOptional({ description: 'Start date of the challenge' })
  startsAt?: Date;

  @ApiPropertyOptional({ description: 'End date of the challenge' })
  endsAt?: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  lastUpdatedAt: Date;

  @ApiPropertyOptional({ description: 'Associated reward' })
  reward?: Reward;

  isActive(): boolean {
    const now = new Date();
    return (
      (!this.startsAt || this.startsAt <= now) &&
      (!this.endsAt || this.endsAt >= now)
    );
  }
}
