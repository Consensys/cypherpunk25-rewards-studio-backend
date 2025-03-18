import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsUrl } from 'class-validator';
export class RewardTypeData {
  @ApiPropertyOptional({
    description: 'Phosphor audience list ID used for an audience list reward',
  })
  @IsUUID()
  @IsOptional()
  phosphorAudienceListId: string;

  @ApiPropertyOptional({
    description: 'Phosphor listing ID used for a NFT allowlist reward',
  })
  @IsUUID()
  @IsOptional()
  phosphorListingId: string;

  @ApiPropertyOptional({
    description: 'Phosphor DropFlow ID used for a NFT airdrop reward',
  })
  @IsUUID()
  @IsOptional()
  phosphorDropFlowId: string;

  @ApiPropertyOptional({
    description: 'Phosphor Item ID used for a NFT airdrop reward',
  })
  @IsUUID()
  @IsOptional()
  phosphorItemId: string;

  @ApiPropertyOptional({
    description: 'Phosphor audience list ID used for an audience list reward',
  })
  @IsUrl()
  @IsOptional()
  phosphorDropUrl: string;
}
