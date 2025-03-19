import { Injectable } from '@nestjs/common';
import { AbstractRewardDistributionService } from '../abstract-challenge-control.service';
import { Reward } from '../../campaigns/entities/rewards/reward.entity';
import { PhosphorAdminApiClient } from '../../utils/phosphor/phosphor-admin-api.client';
import { CampaignsService } from '../../campaigns/campaigns.service';
@Injectable()
export class AirdropPhosphorNftRewardService extends AbstractRewardDistributionService {
  constructor(
    protected readonly phosphorAdminApiClient: PhosphorAdminApiClient,
    protected readonly campaignsService: CampaignsService,
  ) {
    super(phosphorAdminApiClient, campaignsService);
  }

  async distributeRewardForEligibleParticipants(
    reward: Reward,
    participantAddresses: string[],
  ): Promise<void> {
    if (
      !reward.typeData.phosphorItemId ||
      !reward.typeData.phosphorDropFlowId
    ) {
      this.logger.warn(
        `Reward ${reward.id} can't be distributed as it missed Phosphor dropflow id and/or item id`,
      );
      return;
    }
    for (const address of participantAddresses) {
      // handling each participant one at a time given the API limitation
      const resp = await this.phosphorAdminApiClient.airdropNft(
        reward.typeData.phosphorDropFlowId,
        reward.typeData.phosphorItemId,
        address,
      );
      if (resp.id) {
        this.logger.log(
          `Reward ${reward.id} (${reward.type}) distributed to ${address} (Phosphor item distribution id: ${resp.id})`,
        );
        await this.trackDistributedRewards(reward, [address]);
      }
    }
  }
}
