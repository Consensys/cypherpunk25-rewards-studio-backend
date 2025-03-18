import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RewardConditionTypeData } from './reward-condition-type-data.entity';
import { RewardTypeData } from './reward-type-data.entity';

export enum RewardType {
  PHOSPHOR_AUDIENCE_LIST_ADD = 'PHOSPHOR_AUDIENCE_LIST_ADD',
  PHOSPHOR_DROP_ALLOW_LIST_ADD = 'PHOSPHOR_DROP_ALLOW_LIST_ADD',
  PHOSPHOR_GIVEAWAY_ENTRY = 'PHOSPHOR_GIVEAWAY_ENTRY',
  PHOSPHOR_AIRDROP_NFT = 'PHOSPHOR_AIRDROP_NFT',
}

export enum RewardConditionType {
  CHALLENGE_POINTS = 'CHALLENGE_POINTS', // Reward attainable around points
  CHALLENGE_SUCCESS_OR = 'CHALLENGE_SUCCESS_OR', // Reward attainable if any of the associated challenges are met
  CHALLENGE_SUCCESS_AND = 'CHALLENGE_SUCCESS_AND', // Reward attainable if all of the associated challenges are met
}

export class Reward {
  @ApiProperty({ description: 'Unique identifier of the reward' })
  id: string;

  @ApiProperty({ description: 'Campaign ID this reward belongs to' })
  campaignId: string;

  @ApiPropertyOptional({
    description: 'Challenge ID this reward is associated with',
  })
  challengeId?: string;

  @ApiProperty({ description: 'Name of the reward' })
  name: string;

  @ApiPropertyOptional({ description: 'Description of the reward' })
  description?: string;

  @ApiPropertyOptional({ description: 'URI of the reward image' })
  imageUri?: string;

  @ApiProperty({ description: 'Type of the reward', enum: RewardType })
  type: RewardType;

  @ApiProperty({ description: 'Additional data specific to the reward type' })
  typeData: RewardTypeData;

  @ApiProperty({
    description: 'Type of condition for the reward',
    enum: RewardConditionType,
  })
  conditionType: RewardConditionType;

  @ApiProperty({
    description: 'Additional data specific to the condition type',
  })
  conditionTypeData: RewardConditionTypeData;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  lastUpdatedAt: Date;
}
