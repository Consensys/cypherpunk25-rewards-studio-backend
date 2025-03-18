import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChallengeTypeData } from '../entities/challenges/challenge-type-data.entity';
import { PublicRewardDto } from './public-reward.dto';
import { ChallengeType } from '../entities/challenges/challenge.entity';

export class PublicChallengeDto {
  @ApiProperty({ description: 'Unique identifier of the challenge' })
  id: string;

  @ApiPropertyOptional({
    description: 'Campaign ID this challenge is associated with',
  })
  campaignId?: string;

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

  @ApiPropertyOptional({ description: 'Associated reward' })
  reward?: PublicRewardDto;
}
