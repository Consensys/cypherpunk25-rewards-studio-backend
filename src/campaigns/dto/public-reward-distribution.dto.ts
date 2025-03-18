import { ApiProperty } from '@nestjs/swagger';

export class PublicRewardDistributionDto {
  @ApiProperty({ description: 'Unique identifier of the reward distribution' })
  id: string;

  @ApiProperty({ description: 'Reward ID this distribution belongs to' })
  rewardId: string;

  @ApiProperty({ description: 'Campaign ID this distribution belongs to' })
  campaignId: string;

  @ApiProperty({
    description: 'Address of the participant who received the reward',
  })
  address: string;

  @ApiProperty({ description: 'Timestamp when reward was distributed' })
  distributedAt: Date;
}
