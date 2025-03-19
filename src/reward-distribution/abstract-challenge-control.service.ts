import { Injectable } from '@nestjs/common';
import { PhosphorAdminApiClient } from '../utils/phosphor/phosphor-admin-api.client';
import { CampaignsService } from '../campaigns/campaigns.service';
import { Logger } from '@nestjs/common';
import { Reward } from '../campaigns/entities/rewards/reward.entity';
@Injectable()
export abstract class AbstractRewardDistributionService {
  protected readonly logger = new Logger(
    AbstractRewardDistributionService.name,
  );
  constructor(
    protected readonly phosphorAdminApiClient: PhosphorAdminApiClient,
    protected readonly campaignsService: CampaignsService,
  ) {}

  abstract distributeRewardForEligibleParticipants(
    reward: Reward,
    participantAddresses: string[],
  ): Promise<void>;

  async trackDistributedReward(
    reward: Reward,
    participantAddress: string,
    timestamp: Date = new Date(),
  ): Promise<void> {
    await this.campaignsService.createRewardDistribution(
      reward.id,
      reward.campaignId,
      participantAddress,
      timestamp,
    );
  }

  async trackDistributedRewards(
    reward: Reward,
    participantAddresses: string[],
    timestamp: Date = new Date(),
  ): Promise<void> {
    await this.campaignsService.createManyRewardDistributions(
      reward.id,
      reward.campaignId,
      participantAddresses,
      timestamp,
    );
  }
}
