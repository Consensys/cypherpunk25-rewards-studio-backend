import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CampaignsService } from '../campaigns/campaigns.service';
import { PhosphorAdminApiClient } from '../utils/phosphor/phosphor-admin-api.client';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { BannersService } from '../banners/banners.service';
import {
  PhosphorNftPass,
  PhosphorNftPassMetadata,
} from '../utils/phosphor/phosphor-nft-pass';
import { ChallengeControlService } from '../challenge-control/challenge-control.service';
import { RewardDistributionService } from '../reward-distribution/reward-distribution.service';

@Injectable()
export class CampaignsExecutionService {
  private readonly logger = new Logger(CampaignsExecutionService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly campaignsService: CampaignsService,
    private readonly phosphorAdminApiClient: PhosphorAdminApiClient,
    private readonly bannersService: BannersService,
    private readonly challengeControlService: ChallengeControlService,
    private readonly rewardDistributionService: RewardDistributionService,
  ) {}

  async executeCampaignDrop(campaignId: string) {
    const campaign = await this.campaignsService.findOne(campaignId);
    if (campaign.phosphorDropId) {
      throw new ConflictException(
        `Campaign ${campaignId} already has a Phosphor drop associated`,
      );
    }
    const createDrop = this.buildCreateDropPayload(campaign);
    const drop = await this.phosphorAdminApiClient.executeNewDrop(createDrop);
    await this.campaignsService.update(campaignId, {
      phosphorDropId: drop.dropId,
      passMintUrl: await this.buildPortfolioLink(campaign.id),
      passMintPhosphorUrl: this.buildPhosphorLink(
        drop.dropFlowId,
        drop.organizationId,
      ),
    });
    this.logger.log(`Drop ${drop.dropId} created for campaign ${campaign.id}`);
  }

  private buildCreateDropPayload(campaign: Campaign) {
    return {
      name: campaign.name,
      collection_description: campaign.description,
      token_type: 'ERC721',
      network_id: campaign.phosphorChainId,
      is_soulbound_token: true, // non transferrable, tight to MM account
      contract_symbol: 'REWARDS_CAMPAIGN',
      collection_image_url: campaign.imageUri,
      flow: {
        distribution: {
          type: 'FREE_MINT',
        },
        is_template_item_based: true,
        is_in_public_profile: true, //TODO should be false to force mint in Portfolio
        mint: {
          listing_type: 'CRYPTO',
          max_per_user: 1,
          opens_at: campaign.startsAt,
          closes_at: campaign.endsAt,
        },
      },
      items: [
        {
          attributes: {
            ...this.buildPhosphorNftPassInitialMetadata(campaign),
            challenges_summary: undefined, // explicitly removing this object/array prop from item attributes
          },
          is_template_item_based: true,
        },
      ],
    };
  }

  private buildPhosphorNftPassInitialMetadata(
    campaign: Campaign,
  ): PhosphorNftPassMetadata {
    const metadata = new PhosphorNftPassMetadata();
    metadata.title = `Campaign Pass - ${campaign.name}`;
    metadata.description = `${campaign.description} ${!campaign.description?.endsWith('.') ? '.' : ''} This pass is a proof of participation in the campaign`;
    metadata.image_url = campaign.imageUri;
    const challengesSummary = campaign.challenges?.map((c) => {
      return {
        challenge_id: c.id,
        challenge_name: c.name,
        challenge_completed: false,
        challenge_points: 0, // will be set once completed
      };
    });
    metadata.sync();
    metadata.challenges_summary_json = JSON.stringify(challengesSummary);
    return metadata;
  }

  async checkCampaignsWithPendingDrop() {
    const campaigns = await this.campaignsService.findAllWithPendingDrop();
    for (const campaign of campaigns) {
      await this.checkCampaignWithPendingDrop(campaign.id, {
        createBanner: true,
        addToPortfolio: false, //TODO activate for final tests and demo
      });
    }
  }

  async checkCampaignWithPendingDrop(
    campaignId: string,
    options: { createBanner: boolean; addToPortfolio: boolean } = {
      createBanner: false,
      addToPortfolio: false,
    },
  ) {
    const campaign = await this.campaignsService.findOne(campaignId);
    if (!campaign.phosphorDropId) return;
    this.logger.log(
      `Checking execution of Drop ${campaign.phosphorDropId} for campaign ${campaignId}`,
    );
    const status = await this.phosphorAdminApiClient.getDropExecutionStatus(
      campaign.phosphorDropId,
    );
    if (status.isExecutionCompleted) {
      const drop = await this.phosphorAdminApiClient.getDropDetails(
        campaign.phosphorDropId,
      );
      await this.campaignsService.update(campaignId, {
        phosphorContractAddress: drop.contract_address,
        phosphorCollectionId: drop.collection_id,
      });
      this.logger.log(
        `Execution of Drop ${campaign.phosphorDropId} for campaign ${campaignId} is completed`,
      );
      if (options.createBanner) {
        await this.createBannerForCampaign(campaign);
      }
      if (options.addToPortfolio) {
        await this.addToPortfolio(drop.flows[0].id);
      }
    } else {
      this.logger.debug(
        `Execution of Drop ${campaign.phosphorDropId} for campaign ${campaignId} is still in progress`,
      );
    }
  }

  async checkChallengeForAccount(
    accountAddress: string,
    challengeId: string,
  ): Promise<PhosphorNftPass | undefined> {
    //FIXME => should really only check the given challenge (but also updating pass if successful)
    const challenge = await this.campaignsService.findOneChallenge(challengeId);
    return await this.checkCampaignChallengesForAccount(accountAddress, {
      campaignId: challenge.campaignId,
      challengeId,
    });
  }

  async checkCampaignChallengesForAccount(
    accountAddress: string,
    options: {
      campaignId?: string;
      campaign?: Campaign;
      challengeId?: string;
    },
  ): Promise<PhosphorNftPass | undefined> {
    let { campaignId, campaign, challengeId } = options;
    let nftPass: PhosphorNftPass | undefined;
    if (!campaign) {
      if (!campaignId) {
        throw new Error('Either campaignId or campaign must be provided');
      }
      campaign = await this.campaignsService.findOne(campaignId);
    }
    if (
      !campaign.phosphorContractAddress ||
      !campaign.phosphorChainId ||
      !campaign.challenges
    ) {
      this.logger.warn(`Campaign ${campaignId} has no challenges`);
      return undefined;
    }
    const nftCheck = await this.phosphorAdminApiClient.checkIfAccountHoldsNft(
      accountAddress,
      campaign.phosphorContractAddress,
      campaign.phosphorChainId,
    );
    if (nftCheck.holdsNft) {
      nftPass = await this.campaignsService.getParticipantPass(
        campaign,
        nftCheck.tokenId,
      );
      if (!nftPass) {
        this.logger.warn(
          `Campaign ${campaignId} has no NFT pass for account ${accountAddress}`,
        );
        return undefined;
      }
      if (nftPass?.metadata?.campaign_completed) {
        this.logger.debug(
          `Campaign ${campaignId} has already been completed by participant ${accountAddress}`,
        );
        return nftPass;
      }
      // considering only active challenges that are not completed by participant
      const completedChallengeIds = nftPass?.metadata?.challenges_summary
        ?.filter((c) => c.challenge_completed)
        ?.map((c) => {
          return c.challenge_id;
        });
      // filtering on single challenge if provided, otherwise considering all active challenges
      const challengesToCheck = challengeId
        ? campaign.challenges.filter((c) => c.id === challengeId)
        : campaign.challenges;
      // only keeping challenge(s) that should be checked for this participant
      const activeChallengesStillToComplete = challengesToCheck.filter(
        (c) => c.isActive() && !completedChallengeIds?.includes(c.id),
      );
      for (const challenge of activeChallengesStillToComplete) {
        nftPass = await this.challengeControlService.controlChallenge(
          challenge,
          accountAddress,
          nftPass,
        );
      }
    }
    return nftPass;
  }

  async checkActiveCampaignsForAllParticipants() {
    const campaigns = await this.campaignsService.findAllActive('asc'); // treating oldest first
    for (const campaign of campaigns) {
      await this.checkCampaignChallengesForAllParticipants(campaign.id);
    }
  }

  async checkCampaignChallengesForAllParticipants(campaignId: string) {
    const campaign = await this.campaignsService.findOne(campaignId);
    if (
      !campaign.phosphorContractAddress ||
      !campaign.phosphorChainId ||
      !campaign.challenges
    )
      return;
    const participants =
      await this.phosphorAdminApiClient.getAllHoldersForContract(
        campaign.phosphorContractAddress,
        campaign.phosphorChainId,
      );
    this.logger.log(
      `Total holders for campaign ${campaignId}: ${participants.length}`,
    );
    for (const participant of participants) {
      await this.checkCampaignChallengesForAccount(participant.owner, {
        campaignId, //FIXME not sure me need to pass this one here
        campaign,
      });
    }
  }

  async distributeCampaignLevelRewards() {
    const campaigns = await this.campaignsService.findAllActive('asc'); // treating oldest first
    for (const campaign of campaigns) {
      await this.distributeCampaignRewardsToParticipants(campaign.id);
    }
  }

  async distributeCampaignRewardsToParticipants(campaignId: string) {
    const campaign = await this.campaignsService.findOne(campaignId);
    if (!campaign.rewards) {
      this.logger.debug(
        `Campaign ${campaignId} has no campaign-level rewards, skipping campaign-level reward distribution`,
      );
      return;
    }
    if (!campaign.phosphorContractAddress || !campaign.phosphorChainId) {
      this.logger.warn(
        `Campaign ${campaignId} has no phosphor contract address or chain id, skipping campaign-level reward distribution`,
      );
      return;
    }
    //FIXME: this is not the best way to do this,
    // we should have this info stored in DB,
    // instead of relying on NFT pass metadata
    // as it's super heavy to execute fetching one NFT at a time)
    // and won't scale
    const allHolders =
      await this.phosphorAdminApiClient.getAllHoldersForContract(
        campaign.phosphorContractAddress,
        campaign.phosphorChainId,
      );
    const allParticipantsThatCompletedCampaign: string[] = [];
    for (const holder of allHolders) {
      const nftPass = await this.campaignsService.getParticipantPass(
        campaign,
        new Number(holder.token_id).valueOf(),
      );
      if (nftPass && nftPass.metadata?.campaign_completed) {
        allParticipantsThatCompletedCampaign.push(holder.owner);
      }
    }
    for (const reward of campaign.rewards) {
      if (reward.challengeId) continue; // ignoring the challenge-level rewards here
      const alreadyRewardedParticipants =
        await this.campaignsService.getAlreadyRewardedParticipantsForCampaignLevelReward(
          campaign.id,
          reward.id,
        );
      // filtering out participants that have already been rewarded
      const eligibleParticipants = allParticipantsThatCompletedCampaign.filter(
        (p) => !alreadyRewardedParticipants.includes(p),
      );
      await this.rewardDistributionService.distributeReward(
        reward,
        eligibleParticipants,
      );
    }
  }

  async distributeChallengeLevelRewards() {
    const campaigns = await this.campaignsService.findAllActive('asc'); // treating oldest first
    for (const campaign of campaigns) {
      await this.distrbuteChallengeRewardsToParticipants(campaign.id);
    }
  }

  async distrbuteChallengeRewardsToParticipants(campaignId: string) {
    const campaign = await this.campaignsService.findOne(campaignId);
    // considering only challenges with associated reward (challenge-level rewards)
    const challengeIdsAssociatedWithReward = campaign.rewards
      ?.filter((r) => r.challengeId)
      .map((r) => r.challengeId);
    const challengesWithRewards = campaign.challenges?.filter((c) =>
      challengeIdsAssociatedWithReward?.includes(c.id),
    );
    if (!challengesWithRewards || challengesWithRewards?.length === 0) {
      this.logger.debug(
        `Campaign ${campaignId} has no challenge with challenge-level rewards, skipping challenge-level reward distribution`,
      );
      return;
    }
    for (const challenge of challengesWithRewards) {
      const eligibleParticipantsForChallengeReward =
        await this.campaignsService.getEligibleParticipantsForChallengeLevelReward(
          challenge.id,
        );
      const reward = campaign.rewards?.find(
        (r) => r.challengeId === challenge.id,
      );
      if (!reward) return; // should never occur
      await this.rewardDistributionService.distributeReward(
        reward,
        eligibleParticipantsForChallengeReward,
      );
    }
  }

  private async createBannerForCampaign(campaign: Campaign) {
    if (!campaign.phosphorDropId) return;
    const portfolioLink = await this.buildPortfolioLink(campaign.id);
    const banner = await this.bannersService.create({
      id: campaign.id, // temp easy tweak to map banner and campaign
      title: [{ language: 'en', text: campaign.name }],
      subtitle: [{ language: 'en', text: campaign.description ?? '' }],
      linkUri: portfolioLink,
      startsAt: campaign.startsAt,
      endsAt: campaign.endsAt,
      imageUri: campaign.imageUri,
    });
    this.logger.log(`Banner ${banner.id} created for campaign ${campaign.id}`);
  }

  private async addToPortfolio(dropFlowId: string) {
    await this.phosphorAdminApiClient.addDropToPortfolio(dropFlowId);
    this.logger.log(`Drop flow ${dropFlowId} added to Portfolio feed`);
  }

  private async buildPortfolioLink(campaignId: string) {
    return `${this.configService.get('METAMASK_PORTFOLIO_URL')}/explore/rewards/campaign/${campaignId}`;
  }

  private buildPhosphorLink(dropFlowId: string, organizationId: string) {
    return `${this.configService.get('PHOSPHOR_URL')}/${organizationId}/c/${dropFlowId}`;
  }
}
