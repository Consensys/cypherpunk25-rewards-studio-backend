import { Injectable } from '@nestjs/common';
import { AbstractRewardDistributionService } from '../abstract-challenge-control.service';
import { Reward } from '../../campaigns/entities/rewards/reward.entity';
import { PhosphorAdminApiClient } from '../../utils/phosphor/phosphor-admin-api.client';
import { CampaignsService } from '../../campaigns/campaigns.service';
@Injectable()
export class AddToPhosphorAllowlistRewardService extends AbstractRewardDistributionService {
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
    if (!reward.typeData.phosphorListingId) {
      this.logger.warn(
        `Reward ${reward.id} can't be distributed as it missed Phosphor listing id`,
      );
      return;
    }
    const resp =
      await this.phosphorAdminApiClient.addToPhosphorListingAllowlist(
        reward.typeData.phosphorListingId,
        participantAddresses,
      );
    await this.trackDistributedRewards(reward, participantAddresses);
  }
}
