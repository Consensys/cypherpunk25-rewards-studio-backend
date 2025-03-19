import { Module } from '@nestjs/common';
import { CampaignsExecutionService } from './campaigns-execution.service';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { ConfigModule } from '@nestjs/config';
import { PhosphorAdminApiModule } from '../utils/phosphor/phosphor-admin-api.module';
import { CampaignsExecutionController } from './campaigns-execution.controller';
import { CampaignsSchedulerService } from './campaigns-scheduler.service';
import { PublicCampaignsExecutionController } from './public.campaigns-execution.controller';
import { BannersModule } from '../banners/banners.module';
import { ChallengeControlModule } from '../challenge-control/challenge-control.module';
import { RewardDistributionModule } from '../reward-distribution/reward-distribution.module';
@Module({
  imports: [
    ConfigModule,
    CampaignsModule,
    PhosphorAdminApiModule,
    BannersModule,
    ChallengeControlModule,
    RewardDistributionModule,
  ],
  providers: [CampaignsExecutionService, CampaignsSchedulerService],
  controllers: [
    CampaignsExecutionController,
    PublicCampaignsExecutionController,
  ],
  exports: [],
})
export class EngineModule {}
