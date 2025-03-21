import { Module } from '@nestjs/common';
import { PhosphorPublicApiModule } from '../utils/phosphor/phosphor-public-api.module';
import { PhosphorAdminApiModule } from '../utils/phosphor/phosphor-admin-api.module';
import { NftHoldingChallengeControlService } from './custom-controls/nft-holding-challenge-control.service';
import { SwapChallengeControlService } from './custom-controls/swap-challenge-control.service';
import { ChallengeControlService } from './challenge-control.service';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { MetafiApiModule } from '../utils/metafi/metafi-api.module';
import { MmCardTxChallengeControlService } from './custom-controls/mmcard-tx-challenge-control.service';
import { ViewModule } from '../utils/viem/viem.module';
@Module({
  imports: [
    CampaignsModule,
    PhosphorPublicApiModule,
    PhosphorAdminApiModule,
    MetafiApiModule,
    ViewModule,
  ],
  controllers: [],
  providers: [
    ChallengeControlService,
    NftHoldingChallengeControlService,
    SwapChallengeControlService,
    MmCardTxChallengeControlService,
  ],
  exports: [ChallengeControlService],
})
export class ChallengeControlModule {}
