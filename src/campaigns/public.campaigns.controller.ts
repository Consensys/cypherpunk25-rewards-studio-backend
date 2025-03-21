import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { ApiTags } from '@nestjs/swagger';
import { PublicCampaignDto } from './dto/public-campaign.dto';
import { Campaign } from './entities/campaign.entity';
import { Challenge } from './entities/challenges/challenge.entity';
import { PublicChallengeDto } from './dto/public-challenge.dto';
import { PublicRewardDto } from './dto/public-reward.dto';
import { Reward } from './entities/rewards/reward.entity';
import { PublicCampaignPassDto } from './dto/public-campaign-pass.dto';
import { PublicApiGuard } from '../utils/security/public-api-guard.service';
import { PublicRewardDistributionDto } from './dto/public-reward-distribution.dto';
import { RewardDistribution } from './entities/rewards/reward-distribution.entity';
import { CacheService } from '../utils/cache/cache.service';
@ApiTags('Campaigns [Public]')
@UseGuards(PublicApiGuard)
@Controller('campaigns')
export class PublicCampaignsController {
  constructor(
    private readonly campaignsService: CampaignsService,
    private readonly cacheService: CacheService,
  ) {}

  @Get()
  async findAllActive(): Promise<PublicCampaignDto[]> {
    const campaigns = await this.campaignsService.findAllActive();
    let myself = this;
    return campaigns.map((campaign) => myself.toPublicCampaignDto(campaign));
  }

  @Get('leaderboard') //TODO should be moved to Loyalty module
  async getLoyaltyProgramLeaderboard(): Promise<
    { address: string; score: number }[]
  > {
    return await this.campaignsService.getLoyaltyLeaderboard();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PublicCampaignDto> {
    const campaign = await this.campaignsService.findOne(id);
    return this.toPublicCampaignDto(campaign);
  }

  @Get(':id/account/:accountAddress/pass')
  async findParticipantPass(
    @Param('id') id: string,
    @Param('accountAddress') accountAddress: string,
    @Query('include_metadata') includeMetadata: boolean = false,
  ): Promise<PublicCampaignPassDto> {
    return await this.campaignsService.findParticipantPass(
      id,
      accountAddress,
      includeMetadata,
    );
  }

  @Get(':id/account/:accountAddress/enter-gate')
  async getGateStatusForParticipant(
    @Param('id') id: string,
    @Param('accountAddress') accountAddress: string,
  ): Promise<{ gateStatus: string; isGateOpen: boolean; message: string }> {
    try {
      const cached = await this.getGateStatusFromCacheIfAny(id, accountAddress);
      if (cached) {
        return cached;
      }
      const pass = await this.campaignsService.findParticipantPass(
        id,
        accountAddress,
        true,
      );
      const gate = {
        gateStatus: 'OPEN',
        isGateOpen: true,
        message: `Gate is open for account: ${accountAddress}`,
      };
      if (pass?.metadata?.campaign_completed) {
        await this.cacheService.setGateIfOpen_cached(id, accountAddress, gate);
        return gate;
      }
    } catch {
      // ugly, hack mode, we don't care about the error.
      // Here, any error means the gate is closed
    }
    await this.cacheService.setGateIfClosed_cached(id, accountAddress, {
      gateStatus: 'CLOSED',
      isGateOpen: false,
      message: `Gate is closed for account: ${accountAddress}`,
    });
    throw new ForbiddenException(
      `Gate is closed for account: ${accountAddress}`,
    );
  }

  private async getGateStatusFromCacheIfAny(
    id: string,
    accountAddress: string,
  ): Promise<{
    gateStatus: string;
    isGateOpen: boolean;
    message: string;
  } | null> {
    // 2 caches to protect resources, once for open (long TTL, one for closed (short TTL, state might change)
    const cachedOpen = await this.cacheService.getGateIfOpen_cached(
      id,
      accountAddress,
    );
    if (cachedOpen) {
      return cachedOpen;
    }
    const cachedClosed = await this.cacheService.getGateIfClosed_cached(
      id,
      accountAddress,
    );
    if (cachedClosed) {
      return cachedClosed;
    }
    return null;
  }

  @Get('challenges/:challengeId/account/:accountAddress/enter-gate')
  async getChallengeLevelGateStatusForParticipant(
    @Param('challengeId') challengeId: string,
    @Param('accountAddress') accountAddress: string,
  ): Promise<{ gateStatus: string; isGateOpen: boolean; message: string }> {
    try {
      const cached = await this.getChallengeLevelGateStatusFromCacheIfAny(
        challengeId,
        accountAddress,
      );
      if (cached) {
        return cached;
      }
      const pass = await this.campaignsService.findParticipantPassForChallenge(
        challengeId,
        accountAddress,
        true,
      );
      const challengeSummary = pass?.metadata?.challenges_summary?.find(
        (c) => c.challenge_id === challengeId,
      );
      if (challengeSummary?.challenge_completed) {
        const gate = {
          gateStatus: 'OPEN',
          isGateOpen: true,
          message: `Gate is open for account: ${accountAddress}`,
        };
        await this.cacheService.setChallengeLevelGateIfOpen_cached(
          challengeId,
          accountAddress,
          gate,
        );
        return gate;
      }
    } catch {
      // ugly, hack mode, we don't care about the error.
      // Here, any error means the gate is closed
    }
    await this.cacheService.setChallengeLevelGateIfClosed_cached(
      challengeId,
      accountAddress,
      {
        gateStatus: 'CLOSED',
        isGateOpen: false,
        message: `Gate is closed for account: ${accountAddress}`,
      },
    );
    throw new ForbiddenException(
      `Gate is closed for account: ${accountAddress}`,
    );
  }

  private async getChallengeLevelGateStatusFromCacheIfAny(
    challengeId: string,
    accountAddress: string,
  ): Promise<{
    gateStatus: string;
    isGateOpen: boolean;
    message: string;
  } | null> {
    // 2 caches to protect resources, once for open (long TTL, one for closed (short TTL, state might change)
    const cachedOpen =
      await this.cacheService.getChallengeLevelGateIfOpen_cached(
        challengeId,
        accountAddress,
      );
    if (cachedOpen) {
      return cachedOpen;
    }
    const cachedClosed =
      await this.cacheService.getChallengeLevelGateIfClosed_cached(
        challengeId,
        accountAddress,
      );
    if (cachedClosed) {
      return cachedClosed;
    }
    return null;
  }

  @Get(':id/account/:accountAddress/rewards')
  async findParticipantDistributedRewards(
    @Param('id') id: string,
    @Param('accountAddress') accountAddress: string,
  ): Promise<PublicRewardDistributionDto[]> {
    const distributions =
      await this.campaignsService.findParticipantDistributedRewards(
        id,
        accountAddress,
      );
    return distributions.map(this.toPublicRewardDistributionDto);
  }

  @Get(':id/leaderboard')
  async getCampaignLeaderboard(
    @Param('id') campaignId: string,
  ): Promise<{ address: string; score: number }[]> {
    return await this.campaignsService.getCampaignLeaderboard(campaignId);
  }

  toPublicCampaignDto(campaign: Campaign): PublicCampaignDto {
    return {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      imageUri: campaign.imageUri,
      phosphorOrgId: campaign.phosphorOrgId,
      phosphorDropId: campaign.phosphorDropId,
      phosphorContractAddress: campaign.phosphorContractAddress,
      phosphorListingId: campaign.phosphorListingId,
      phosphorChainId: campaign.phosphorChainId,
      startsAt: campaign.startsAt,
      endsAt: campaign.endsAt,
      challenges: campaign.challenges?.map(this.toPublicChallengeDto),
      rewards: campaign.rewards?.map(this.toPublicRewardDto),
    };
  }

  toPublicChallengeDto(challenge: Challenge): PublicChallengeDto {
    return {
      id: challenge.id,
      campaignId: challenge.campaignId,
      name: challenge.name,
      imageUri: challenge.imageUri,
      operator: challenge.operator,
      type: challenge.type,
      typeData: challenge.typeData,
      points: challenge.points,
      startsAt: challenge.startsAt,
      endsAt: challenge.endsAt,
      reward: challenge.reward,
    };
  }

  toPublicRewardDto(reward: Reward): PublicRewardDto {
    return {
      id: reward.id,
      campaignId: reward.campaignId,
      challengeId: reward.challengeId,
      name: reward.name,
      description: reward.description,
      imageUri: reward.imageUri,
      type: reward.type,
      typeData: reward.typeData,
      conditionType: reward.conditionType,
      conditionTypeData: reward.conditionTypeData,
    };
  }

  toPublicRewardDistributionDto(
    distribution: RewardDistribution,
  ): PublicRewardDistributionDto {
    return {
      id: distribution.id,
      rewardId: distribution.rewardId,
      campaignId: distribution.campaignId,
      address: distribution.address,
      distributedAt: distribution.distributedAt,
    };
  }
}
