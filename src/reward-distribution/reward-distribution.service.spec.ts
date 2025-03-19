import { Test, TestingModule } from '@nestjs/testing';
import { RewardDistributionService } from './reward-distribution.service';
import { PhosphorAdminApiModule } from '../utils/phosphor/phosphor-admin-api.module';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { AddToPhosphorAudienceRewardService } from './custom-distributions/add-to-phosphor-audience-reward.service';
import { AddToPhosphorAllowlistRewardService } from './custom-distributions/add-to-phosphor-allowlist-reward.service';
import { AirdropPhosphorNftRewardService } from './custom-distributions/airdrop-phosphor-nft-reward.service';
import { CacheModule } from '@nestjs/cache-manager';
describe('RewardDistributionService', () => {
  let service: RewardDistributionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CacheModule.register({
          isGlobal: true,
        }),
        PhosphorAdminApiModule,
        CampaignsModule,
      ],
      providers: [
        RewardDistributionService,
        AddToPhosphorAudienceRewardService,
        AddToPhosphorAllowlistRewardService,
        AirdropPhosphorNftRewardService,
      ],
    }).compile();

    service = module.get<RewardDistributionService>(RewardDistributionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
