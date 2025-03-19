import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { AdminApiGuard } from '../utils/security/admin-api-guard.service';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CampaignsExecutionService } from './campaigns-execution.service';

@ApiTags('Campaigns')
@UseGuards(AdminApiGuard)
@ApiSecurity('apikeyAuth')
@Controller('admin/campaigns')
export class CampaignsExecutionController {
  constructor(
    private readonly campaignsExecutionService: CampaignsExecutionService,
  ) {}

  @Post(':campaignId/execute')
  executeCampaign(@Param('campaignId') campaignId: string) {
    return this.campaignsExecutionService.executeCampaignDrop(campaignId);
  }

  @Post('check-all')
  triggerAllCampaignsChallengeCheck() {
    return this.campaignsExecutionService.checkActiveCampaignsForAllParticipants();
  }

  @Post('reward-all')
  triggerAllCampaignsRewardDistribution() {
    return this.campaignsExecutionService.distributeCampaignLevelRewards();
  }

  @Post('challenges/reward-all')
  triggerAllChallengesRewardDistribution() {
    return this.campaignsExecutionService.distributeChallengeLevelRewards();
  }
}
