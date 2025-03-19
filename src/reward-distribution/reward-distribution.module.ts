import { Module } from '@nestjs/common';
import { RewardDistributionService } from './reward-distribution.service';
import { AddToPhosphorAudienceRewardService } from './custom-distributions/add-to-phosphor-audience-reward.service';
import { PhosphorAdminApiModule } from '../utils/phosphor/phosphor-admin-api.module';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { AirdropPhosphorNftRewardService } from './custom-distributions/airdrop-phosphor-nft-reward.service';
import { AddToPhosphorAllowlistRewardService } from './custom-distributions/add-to-phosphor-allowlist-reward.service';
@Module({
  imports: [PhosphorAdminApiModule, CampaignsModule],
  controllers: [],
  providers: [
    RewardDistributionService,
    AddToPhosphorAudienceRewardService,
    AddToPhosphorAllowlistRewardService,
    AirdropPhosphorNftRewardService,
  ],
  exports: [RewardDistributionService],
})
export class RewardDistributionModule {}
