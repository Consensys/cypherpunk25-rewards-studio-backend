import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PhosphorNftPassMetadata } from '../../utils/phosphor/phosphor-nft-pass';

export class PublicCampaignPassDto {
  @ApiProperty({ description: 'Unique identifier of the NFT pass' })
  tokenId: number;

  @ApiPropertyOptional({
    description: 'Unique identifier of the NFT collection',
  })
  phosphorCollectionId?: string;

  @ApiPropertyOptional({ description: 'Address of the NFT contract' })
  phosphorContractAddress?: string;

  @ApiPropertyOptional({ description: 'Chain ID of the NFT pass' })
  phosphorChainId?: number;

  @ApiPropertyOptional({ description: 'Metadata of the NFT pass' })
  metadata?: PhosphorNftPassMetadata;
}
