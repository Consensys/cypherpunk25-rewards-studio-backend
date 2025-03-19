import { Injectable } from '@nestjs/common';
import { AbstractRewardDistributionService } from './abstract-challenge-control.service';
import { RewardType } from '../campaigns/entities/rewards/reward.entity';
import { Reward } from '../campaigns/entities/rewards/reward.entity';
import { AddToPhosphorAudienceRewardService } from './custom-distributions/add-to-phosphor-audience-reward.service';
import { AddToPhosphorAllowlistRewardService } from './custom-distributions/add-to-phosphor-allowlist-reward.service';
import { AirdropPhosphorNftRewardService } from './custom-distributions/airdrop-phosphor-nft-reward.service';
import { Logger } from '@nestjs/common';
@Injectable()
export class RewardDistributionService {
  private readonly logger = new Logger(RewardDistributionService.name);

  private readonly rewardDistributionServices: Map<
    RewardType,
    AbstractRewardDistributionService
  > = new Map();

  constructor(
    private readonly addToPhosphorAudienceRewardService: AddToPhosphorAudienceRewardService,
    private readonly addToPhosphorAllowlistRewardService: AddToPhosphorAllowlistRewardService,
    private readonly airdropPhosphorNftRewardService: AirdropPhosphorNftRewardService,
  ) {
    this.rewardDistributionServices.set(
      RewardType.PHOSPHOR_AUDIENCE_LIST_ADD,
      this.addToPhosphorAudienceRewardService,
    );
    this.rewardDistributionServices.set(
      RewardType.PHOSPHOR_AIRDROP_NFT,
      this.airdropPhosphorNftRewardService,
    );
    this.rewardDistributionServices.set(
      RewardType.PHOSPHOR_DROP_ALLOW_LIST_ADD,
      this.addToPhosphorAllowlistRewardService,
    );
  }

  async distributeReward(
    reward: Reward,
    participantAddresses: string[],
  ): Promise<void> {
    const rewardDistributionService = this.rewardDistributionServices.get(
      reward.type,
    );
    if (!rewardDistributionService) {
      this.logger.error(
        `No reward distribution service found for reward type: ${reward.type}`,
      );
      return;
    }
    if (participantAddresses.length > 0) {
      this.logger.log(
        `Distributing reward ${reward.id} (${reward.type}) to ${participantAddresses.length} participants`,
      );
      await rewardDistributionService.distributeRewardForEligibleParticipants(
        reward,
        participantAddresses,
      );
    }
  }
}
