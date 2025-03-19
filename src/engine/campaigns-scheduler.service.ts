import { Injectable } from '@nestjs/common';
import { CampaignsService } from '../campaigns/campaigns.service';
import { CampaignsExecutionService } from './campaigns-execution.service';
import { Cron, CronExpression } from '@nestjs/schedule';
@Injectable()
export class CampaignsSchedulerService {
  constructor(
    private readonly campaignsService: CampaignsService,
    private readonly campaignsExecutionService: CampaignsExecutionService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async checkCampaignsWithPendingDrop() {
    await this.campaignsExecutionService.checkCampaignsWithPendingDrop();
  }

  //@Cron(CronExpression.EVERY_6_HOURS)
  @Cron(CronExpression.EVERY_MINUTE)
  async checkCampaignChallengesForAllParticipants() {
    await this.campaignsExecutionService.checkActiveCampaignsForAllParticipants();
  }

  //@Cron(CronExpression.EVERY_6_HOURS)
  @Cron(CronExpression.EVERY_10_SECONDS)
  async distributeCampaignLevelRewards() {
    await this.campaignsExecutionService.distributeCampaignLevelRewards();
  }

  //@Cron(CronExpression.EVERY_6_HOURS)
  @Cron(CronExpression.EVERY_5_MINUTES)
  async distributeChallengeLevelRewards() {
    await this.campaignsExecutionService.distributeChallengeLevelRewards();
  }
}
