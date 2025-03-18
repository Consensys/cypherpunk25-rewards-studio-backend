import { Module } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { PrismaModule } from '../utils/prisma/prisma.module';
import { ChallengeController } from './challenge.controller';
import { RewardController } from './reward.controller';
import { ConfigModule } from '@nestjs/config';
import { PublicCampaignsController } from './public.campaigns.controller';
import { PhosphorAdminApiModule } from '../utils/phosphor/phosphor-admin-api.module';
import { PhosphorPublicApiModule } from '../utils/phosphor/phosphor-public-api.module';
import { PublicMembersController } from './public.members.controller';
import { RewardsCacheModule } from '../utils/cache/rewards-cache.module';
@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    PhosphorAdminApiModule,
    PhosphorPublicApiModule,
    RewardsCacheModule,
  ],
  controllers: [
    CampaignsController,
    ChallengeController,
    RewardController,
    PublicCampaignsController,
    PublicMembersController,
  ],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule {}
