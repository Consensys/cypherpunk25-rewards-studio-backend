import { Injectable } from '@nestjs/common';
import { AbstractRewardDistributionService } from '../abstract-challenge-control.service';
import { Reward } from '../../campaigns/entities/rewards/reward.entity';
import { PhosphorAdminApiClient } from '../../utils/phosphor/phosphor-admin-api.client';
import { CampaignsService } from '../../campaigns/campaigns.service';
@Injectable()
export class AddToPhosphorAudienceRewardService extends AbstractRewardDistributionService {
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
    if (!reward.typeData.phosphorAudienceListId) {
      this.logger.warn(
        `Reward ${reward.id} can't be distributed as it missed Phosphor audience list id`,
      );
      return;
    }
    const resp = await this.phosphorAdminApiClient.addToPhosphorAudience(
      reward.typeData.phosphorAudienceListId,
      participantAddresses,
    );
    if (resp.added === participantAddresses.length) {
      this.logger.log(
        `Reward ${reward.id} (${reward.type}) distributed to ${participantAddresses.length} participants`,
      );
      await this.trackDistributedRewards(reward, participantAddresses);
    }
  }
}
