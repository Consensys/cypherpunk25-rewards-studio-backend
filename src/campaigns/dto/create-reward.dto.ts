import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsUUID,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { RewardTypeData } from '../entities/rewards/reward-type-data.entity';
import { Type } from 'class-transformer';
import { RewardConditionTypeData } from '../entities/rewards/reward-condition-type-data.entity';
import {
  RewardType,
  RewardConditionType,
} from '../entities/rewards/reward.entity';
export class CreateRewardDto {
  @ApiPropertyOptional({
    description: 'Challenge ID this reward is associated with',
  })
  @IsUUID()
  @IsOptional()
  challengeId?: string;

  @ApiProperty({ description: 'Name of the reward' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the reward' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'URI of the reward image' })
  @IsUrl()
  @IsOptional()
  imageUri?: string;

  @ApiProperty({ description: 'Type of the reward' })
  @IsString()
  @IsNotEmpty()
  @IsEnum(RewardType)
  type: RewardType;

  @ApiProperty({ description: 'Additional data specific to the reward type' })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => RewardTypeData)
  typeData: RewardTypeData;

  @ApiProperty({ description: 'Type of condition for the reward' })
  @IsString()
  @IsNotEmpty()
  @IsEnum(RewardConditionType)
  conditionType: RewardConditionType;

  @ApiProperty({
    description: 'Additional data specific to the condition type',
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => RewardConditionTypeData)
  conditionTypeData: RewardConditionTypeData;
}
