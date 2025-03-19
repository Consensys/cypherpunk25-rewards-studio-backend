import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CampaignsExecutionService } from './campaigns-execution.service';
import { PublicCampaignPassDto } from '../campaigns/dto/public-campaign-pass.dto';
import { PublicApiGuard } from '../utils/security/public-api-guard.service';
@ApiTags('Campaigns [Public]')
@UseGuards(PublicApiGuard)
@Controller('campaigns')
export class PublicCampaignsExecutionController {
  constructor(
    private readonly campaignsExecutionService: CampaignsExecutionService,
  ) {}

  @Post(':campaignId/account/:accountAddress/sync-pass')
  async syncParticipantPass(
    @Param('campaignId') campaignId: string,
    @Param('accountAddress') accountAddress: string,
  ): Promise<PublicCampaignPassDto> {
    const nftPass =
      await this.campaignsExecutionService.checkCampaignChallengesForAccount(
        accountAddress,
        campaignId,
      );
    return {
      tokenId: nftPass?.tokenId ?? 0,
      phosphorCollectionId: nftPass?.collectionId,
      phosphorContractAddress: nftPass?.contractAddress,
      phosphorChainId: nftPass?.chainId,
      metadata: nftPass?.metadata,
    };
  }

  @Post('challenges/:challengeId/account/:accountAddress/sync-pass')
  async syncParticipantPassForChallenge(
    @Param('challengeId') challengeId: string,
    @Param('accountAddress') accountAddress: string,
  ): Promise<PublicCampaignPassDto> {
    const nftPass =
      await this.campaignsExecutionService.checkChallengeForAccount(
        accountAddress,
        challengeId,
      );
    return {
      tokenId: nftPass?.tokenId ?? 0,
      phosphorCollectionId: nftPass?.collectionId,
      phosphorContractAddress: nftPass?.contractAddress,
      phosphorChainId: nftPass?.chainId,
      metadata: nftPass?.metadata,
    };
  }
}
