import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RewardConditionTypeData } from '../entities/rewards/reward-condition-type-data.entity';
import { RewardTypeData } from '../entities/rewards/reward-type-data.entity';
import { RewardConditionType } from '../entities/rewards/reward.entity';
import { RewardType } from '../entities/rewards/reward.entity';

export class PublicRewardDto {
  @ApiProperty({ description: 'Unique identifier of the reward' })
  id: string;

  @ApiPropertyOptional({
    description: 'Campaign ID this reward is associated with',
  })
  campaignId?: string;

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
}
