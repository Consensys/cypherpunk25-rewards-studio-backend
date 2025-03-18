import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PublicRewardDto } from './public-reward.dto';
import { PublicChallengeDto } from './public-challenge.dto';

export class PublicCampaignDto {
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

  @ApiPropertyOptional({ description: 'Phosphor listing ID' })
  phosphorListingId?: string;

  @ApiPropertyOptional({ description: 'Phosphor chain ID' })
  phosphorChainId?: number;

  @ApiProperty({ description: 'Start date of the campaign' })
  startsAt: Date;

  @ApiProperty({ description: 'End date of the campaign' })
  endsAt: Date;

  @ApiPropertyOptional({
    description: 'Campaign rewards',
    isArray: true,
    type: PublicRewardDto,
  })
  rewards?: PublicRewardDto[];

  @ApiPropertyOptional({
    description: 'Campaign challenges',
    isArray: true,
    type: PublicChallengeDto,
  })
  challenges?: PublicChallengeDto[];
}
