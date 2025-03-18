import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Challenge } from './challenges/challenge.entity';
import { Reward } from './rewards/reward.entity';

export class Campaign {
  @ApiProperty({ description: 'Unique identifier of the campaign' })
  id: string;

  @ApiProperty({ description: 'The Phosphor organization ID' })
  phosphorOrgId: string;

  @ApiProperty({ description: 'Name of the campaign' })
  name: string;

  @ApiPropertyOptional({ description: 'Description of the campaign' })
  description?: string;

  @ApiPropertyOptional({ description: 'URI of the campaign image' })
  imageUri?: string;

  @ApiPropertyOptional({ description: 'Phosphor drop ID' })
  phosphorDropId?: string;

  @ApiPropertyOptional({ description: 'Phosphor contract address' })
  phosphorContractAddress?: string;

  @ApiPropertyOptional({ description: 'Phosphor collection ID' })
  phosphorCollectionId?: string;

  @ApiPropertyOptional({ description: 'Phosphor listing ID' })
  phosphorListingId?: string;

  @ApiPropertyOptional({ description: 'Phosphor chain ID' })
  phosphorChainId?: number;

  @ApiPropertyOptional({
    description: 'URL to mint the pass to enter campaign',
  })
  passMintUrl?: string;

  @ApiPropertyOptional({
    description: 'URL to mint the pass to enter campaign',
  })
  passMintPhosphorUrl?: string;

  @ApiProperty({ description: 'Start date of the campaign' })
  startsAt: Date;

  @ApiProperty({ description: 'End date of the campaign' })
  endsAt: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Last update timestamp' })
  lastUpdatedAt?: Date;

  @ApiPropertyOptional({
    description: 'Campaign rewards',
    isArray: true,
    type: Reward,
  })
  rewards?: Reward[];

  @ApiPropertyOptional({
    description: 'Campaign challenges',
    isArray: true,
    type: Challenge,
  })
  challenges?: Challenge[];

  isActive(): boolean {
    const now = new Date();
    return this.startsAt && this.endsAt
      ? this.startsAt <= now && this.endsAt >= now
      : false;
  }
}
