import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import {
  Challenge,
  ChallengeType,
} from './entities/challenges/challenge.entity';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import {
  Reward,
  RewardConditionType,
  RewardType,
} from './entities/rewards/reward.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { PrismaService } from '../utils/prisma/prisma.service';
import {
  Prisma,
  Challenge as PrismaChallenge,
  Campaign as PrismaCampaign,
  Reward as PrismaReward,
  ChallengeSuccess as PrismaChallengeSuccess,
  RewardDistribution as PrismaRewardDistribution,
} from '@prisma/client';
import { ChallengeTypeData } from './entities/challenges/challenge-type-data.entity';
import { RewardConditionTypeData } from './entities/rewards/reward-condition-type-data.entity';
import { RewardTypeData } from './entities/rewards/reward-type-data.entity';
import { Campaign } from './entities/campaign.entity';
import { ConfigService } from '@nestjs/config';
import { PhosphorAdminApiClient } from '../utils/phosphor/phosphor-admin-api.client';
import { PublicCampaignPassDto } from './dto/public-campaign-pass.dto';
import { PhosphorPublicApiClient } from '../utils/phosphor/phosphor-public-api.client';
import { ChallengeSuccess } from './entities/challenges/challenge-success.entity';
import {
  PhosphorNftPass,
  PhosphorNftPassMetadata,
} from '../utils/phosphor/phosphor-nft-pass';
import { RewardDistribution } from './entities/rewards/reward-distribution.entity';
import { getAddressEligibleToChallengeLevelReward } from '@prisma/client/sql';
import { CacheService } from '../utils/cache/cache.service';
@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly phosphorAdminApiClient: PhosphorAdminApiClient,
    private readonly phosphorPublicApiClient: PhosphorPublicApiClient,
    private readonly cacheService: CacheService,
  ) {}

  async create(createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    const { name, description, imageUri, phosphorChainId, startsAt, endsAt } =
      createCampaignDto;
    const phosphorOrgId = this.configService.get('PHOSPHOR_ORG_ID');
    let campaign = await this.prisma.campaign.create({
      data: {
        name,
        description,
        image_uri: imageUri,
        phosphor_org_id: phosphorOrgId,
        phosphor_chain_id: phosphorChainId,
        starts_at: startsAt,
        ends_at: endsAt,
        ...(createCampaignDto.challenges && {
          challenges: {
            createMany: {
              data: createCampaignDto.challenges.map((challenge) => ({
                name: challenge.name,
                operator: challenge.operator,
                type: challenge.type,
                image_uri: challenge.imageUri,
                points: challenge.points,
                type_data: challenge.typeData as any as Prisma.JsonObject,
                starts_at: challenge.startsAt,
                ends_at: challenge.endsAt,
              })),
            },
          },
        }),
        ...(createCampaignDto.rewards && {
          rewards: {
            createMany: {
              data: createCampaignDto.rewards.map((reward) => ({
                name: reward.name,
                description: reward.description,
                type: reward.type,
                image_uri: reward.imageUri,
                type_data: reward.typeData as any as Prisma.JsonObject,
                condition_type: reward.conditionType,
                condition_type_data:
                  reward.conditionTypeData as any as Prisma.JsonObject,
              })),
            },
          },
        }),
      },
    });
    this.logger.log(`Campaign ${campaign.id} created`);
    if (createCampaignDto.challenges || createCampaignDto.rewards) {
      return await this.findOne(campaign.id); // will also return children resources
    }
    return this.mapPrismaCampaignToEntity(campaign);
  }

  async findAll(): Promise<Campaign[]> {
    const campaigns = await this.prisma.campaign.findMany({
      orderBy: {
        created_at: 'desc',
      },
      include: {
        challenges: true,
        rewards: true,
      },
    });
    let myself = this;
    return campaigns.map((campaign) =>
      myself.mapPrismaCampaignToEntity(campaign),
    );
  }

  async findAllActive(
    orderByWay: 'asc' | 'desc' = 'desc',
  ): Promise<Campaign[]> {
    const now = new Date();
    const campaigns = await this.prisma.campaign.findMany({
      where: {
        starts_at: { lte: now },
        ends_at: { gt: now },
        phosphor_contract_address: { not: null }, // only campaign with valid drop can be considered active
      },
      include: {
        challenges: true,
        rewards: true,
      },
      orderBy: {
        created_at: orderByWay ?? 'desc',
      },
    });
    let myself = this;
    return campaigns.map((campaign) =>
      myself.mapPrismaCampaignToEntity(campaign),
    );
  }

  async findOne(id: string): Promise<Campaign> {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        challenges: true,
        rewards: true,
      },
    });
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID "${id}" not found`);
    }
    return this.mapPrismaCampaignToEntity(campaign);
  }

  async findAllWithPendingDrop(): Promise<Campaign[]> {
    const campaigns = await this.prisma.campaign.findMany({
      orderBy: {
        created_at: 'asc',
      },
      where: {
        phosphor_drop_id: {
          not: null,
        },
        phosphor_contract_address: null,
      },
    });
    return campaigns.map(this.mapPrismaCampaignToEntity);
  }

  async update(
    id: string,
    updateProps: {
      name?: string;
      phosphorOrgId?: string;
      description?: string;
      imageUri?: string;
      phosphorDropId?: string;
      phosphorCollectionId?: string;
      phosphorContractAddress?: string;
      phosphorListingId?: string;
      phosphorChainId?: number;
      passMintUrl?: string;
      passMintPhosphorUrl?: string;
      startsAt?: Date;
      endsAt?: Date;
    },
  ): Promise<Campaign> {
    const {
      name,
      phosphorOrgId,
      description,
      imageUri,
      phosphorDropId,
      phosphorCollectionId,
      phosphorContractAddress,
      phosphorListingId,
      phosphorChainId,
      passMintUrl,
      passMintPhosphorUrl,
      startsAt,
      endsAt,
    } = updateProps;
    await this.findOne(id);
    const campaign = await this.prisma.campaign.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(phosphorOrgId && { phosphor_org_id: phosphorOrgId }),
        ...(description && { description }),
        ...(imageUri && { image_uri: imageUri }),
        ...(phosphorDropId && { phosphor_drop_id: phosphorDropId }),
        ...(phosphorContractAddress && {
          phosphor_contract_address: phosphorContractAddress,
        }),
        ...(phosphorCollectionId && {
          phosphor_collection_id: phosphorCollectionId,
        }),
        ...(phosphorListingId && { phosphor_listing_id: phosphorListingId }),
        ...(phosphorChainId && { phosphor_chain_id: phosphorChainId }),
        ...(passMintUrl && { pass_mint_url: passMintUrl }),
        ...(passMintPhosphorUrl && {
          pass_mint_phosphor_url: passMintPhosphorUrl,
        }),
        starts_at: startsAt,
        ends_at: endsAt,
      },
      include: {
        challenges: true,
        rewards: true,
      },
    });
    this.logger.log(`Campaign ${campaign.id} updated`);
    return this.mapPrismaCampaignToEntity(campaign);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.removeAllRewardDistributions(id);
    await this.removeAllChallengeSuccesses(id);
    await this.removeAllCampaignRewards(id);
    await this.removeAllCampaignChallenges(id);
    await this.prisma.campaign.delete({
      where: { id },
    });
  }

  async createCampaignChallenge(
    campaignId: string,
    createChallengeDto: CreateChallengeDto,
  ): Promise<Challenge> {
    const { name, operator, type, points, typeData, startsAt, endsAt } =
      createChallengeDto;
    const challenge = await this.prisma.challenge.create({
      data: {
        campaign_id: campaignId,
        name,
        operator,
        type,
        points,
        type_data: typeData as any as Prisma.JsonObject,
        starts_at: startsAt,
        ends_at: endsAt,
      },
    });
    return this.mapPrismaChallengeToEntity(challenge);
  }

  async findAllCampaignChallenges(campaignId: string): Promise<Challenge[]> {
    const challenges = await this.prisma.challenge.findMany({
      where: { campaign_id: campaignId },
    });
    return challenges.map(this.mapPrismaChallengeToEntity);
  }

  async findOneChallenge(id: string): Promise<Challenge> {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id },
    });
    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }
    return this.mapPrismaChallengeToEntity(challenge);
  }

  async updateCampaignChallenge(
    id: string,
    updateChallengeDto: UpdateChallengeDto,
  ): Promise<Challenge> {
    const { name, operator, type, points, typeData, startsAt, endsAt } =
      updateChallengeDto;
    await this.findOneChallenge(id);
    const updatedChallenge = await this.prisma.challenge.update({
      where: { id },
      data: {
        // Only update if provided
        ...(name && { name }),
        ...(operator && { operator }),
        ...(type && { type }),
        ...(points && { points }),
        ...(typeData && { type_data: typeData as any as Prisma.JsonObject }),
        starts_at: startsAt,
        ends_at: endsAt,
      },
    });
    return this.mapPrismaChallengeToEntity(updatedChallenge);
  }

  async removeCampaignChallenge(id: string): Promise<void> {
    await this.findOneChallenge(id);
    await this.prisma.challenge.delete({
      where: { id },
    });
  }

  async removeAllCampaignChallenges(campaignId: string): Promise<void> {
    await this.prisma.challenge.deleteMany({
      where: { campaign_id: campaignId },
    });
  }

  async createCampaignReward(
    campaignId: string,
    createRewardDto: CreateRewardDto,
  ): Promise<Reward> {
    const {
      name,
      description,
      type,
      typeData,
      conditionType,
      conditionTypeData,
      challengeId,
    } = createRewardDto;
    const reward = await this.prisma.reward.create({
      data: {
        campaign_id: campaignId,
        challenge_id: challengeId,
        name,
        description,
        type,
        type_data: typeData as any as Prisma.JsonObject,
        condition_type: conditionType,
        condition_type_data: conditionTypeData as any as Prisma.JsonObject,
      },
    });
    return this.mapPrismaRewardToEntity(reward);
  }

  async findAllCampaignRewards(campaignId: string): Promise<Reward[]> {
    const rewards = await this.prisma.reward.findMany({
      where: { campaign_id: campaignId },
    });
    return rewards.map(this.mapPrismaRewardToEntity);
  }

  async findOneReward(id: string): Promise<Reward> {
    const reward = await this.prisma.reward.findUnique({
      where: { id },
    });
    if (!reward) {
      throw new NotFoundException('Reward not found');
    }
    return this.mapPrismaRewardToEntity(reward);
  }

  async updateCampaignReward(
    id: string,
    updateRewardDto: UpdateRewardDto,
  ): Promise<Reward> {
    const {
      name,
      description,
      type,
      typeData,
      conditionType,
      imageUri,
      conditionTypeData,
      challengeId,
    } = updateRewardDto;
    await this.findOneReward(id);
    const updatedReward = await this.prisma.reward.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(type && { type }),
        ...(imageUri && { image_uri: imageUri }),
        ...(typeData && { type_data: typeData as any as Prisma.JsonObject }),
        ...(conditionType && { condition_type: conditionType }),
        ...(conditionTypeData && {
          condition_type_data: conditionTypeData as any as Prisma.JsonObject,
        }),
        ...(challengeId && { challenge_id: challengeId }),
      },
    });
    return this.mapPrismaRewardToEntity(updatedReward);
  }

  async removeCampaignReward(id: string): Promise<void> {
    await this.findOneReward(id);
    await this.prisma.reward.delete({
      where: { id },
    });
  }

  async removeAllCampaignRewards(campaignId: string): Promise<void> {
    await this.prisma.reward.deleteMany({
      where: { campaign_id: campaignId },
    });
  }

  async createChallengeSuccess(
    challengeId: string,
    campaignId: string,
    address: string,
    completedAt: Date,
    points?: number,
  ): Promise<ChallengeSuccess> {
    const success = await this.prisma.challengeSuccess.create({
      data: {
        challenge_id: challengeId,
        campaign_id: campaignId,
        address,
        points,
        completed_at: completedAt,
      },
    });
    return this.mapPrismaChallengeSuccessToEntity(success);
  }

  async getChallengeSuccess(id: string) {
    const success = await this.prisma.challengeSuccess.findUnique({
      where: { id },
    });
    if (!success) {
      throw new NotFoundException(`Challenge success with ID ${id} not found`);
    }
    return this.mapPrismaChallengeSuccessToEntity(success);
  }

  async getChallengeSuccessesByCampaign(campaignId: string) {
    const successes = await this.prisma.challengeSuccess.findMany({
      where: { campaign_id: campaignId },
    });
    return successes.map(this.mapPrismaChallengeSuccessToEntity);
  }

  async getChallengeSuccessesByChallenge(challengeId: string) {
    const successes = await this.prisma.challengeSuccess.findMany({
      where: { id: challengeId },
    });
    return successes.map(this.mapPrismaChallengeSuccessToEntity);
  }

  async getChallengeSuccessesByAddress(address: string) {
    const successes = await this.prisma.challengeSuccess.findMany({
      where: { address },
    });
    return successes.map(this.mapPrismaChallengeSuccessToEntity);
  }

  async getEligibleParticipantsForChallengeLevelReward(
    challengeId: string,
  ): Promise<string[]> {
    // participants that have completed the challenge but not yet received the reward
    const results = await this.prisma.$queryRawTyped(
      getAddressEligibleToChallengeLevelReward(challengeId),
    );
    return results.map((res) => res.address);
  }

  async getAlreadyRewardedParticipantsForCampaignLevelReward(
    campaingId: string,
    rewardId: string,
  ): Promise<string[]> {
    const results = await this.prisma.rewardDistribution.findMany({
      where: {
        campaign_id: campaingId,
        reward_id: rewardId,
      },
      select: {
        address: true,
      },
    });
    return results.map((res) => res.address);
  }

  async deleteChallengeSuccess(id: string) {
    await this.prisma.challengeSuccess.delete({
      where: { id },
    });
  }

  async removeAllChallengeSuccesses(campaignId: string): Promise<void> {
    await this.prisma.challengeSuccess.deleteMany({
      where: { campaign_id: campaignId },
    });
  }

  async createRewardDistribution(
    rewardId: string,
    campaignId: string,
    address: string,
    distributedAt: Date,
  ): Promise<RewardDistribution> {
    const distribution = await this.prisma.rewardDistribution.create({
      data: {
        reward_id: rewardId,
        campaign_id: campaignId,
        address,
        distributed_at: distributedAt,
      },
    });
    return this.mapPrismaRewardDistributionToEntity(distribution);
  }

  async createManyRewardDistributions(
    rewardId: string,
    campaignId: string,
    addresses: string[],
    distributedAt: Date,
  ): Promise<{ count: number }> {
    const distributions = await this.prisma.rewardDistribution.createMany({
      data: addresses.map((address) => ({
        reward_id: rewardId,
        campaign_id: campaignId,
        address,
        distributed_at: distributedAt,
      })),
    });
    return { count: distributions.count };
  }

  async getRewardDistribution(id: string) {
    const distribution = await this.prisma.rewardDistribution.findUnique({
      where: { id },
    });
    if (!distribution) {
      throw new NotFoundException(
        `Reward distribution with ID ${id} not found`,
      );
    }
    return this.mapPrismaRewardDistributionToEntity(distribution);
  }

  async getRewardDistributionsByCampaign(campaignId: string) {
    const distributions = await this.prisma.rewardDistribution.findMany({
      where: { campaign_id: campaignId },
    });
    return distributions.map(this.mapPrismaRewardDistributionToEntity);
  }

  async getRewardDistributionsByReward(rewardId: string) {
    const distributions = await this.prisma.rewardDistribution.findMany({
      where: { reward_id: rewardId },
    });
    return distributions.map(this.mapPrismaRewardDistributionToEntity);
  }

  async getRewardDistributionsByAddress(address: string) {
    const distributions = await this.prisma.rewardDistribution.findMany({
      where: { address },
    });
    return distributions.map(this.mapPrismaRewardDistributionToEntity);
  }

  async deleteRewardDistribution(id: string) {
    await this.prisma.rewardDistribution.delete({
      where: { id },
    });
  }

  async removeAllRewardDistributions(campaignId: string): Promise<void> {
    await this.prisma.rewardDistribution.deleteMany({
      where: { campaign_id: campaignId },
    });
  }

  private mapPrismaChallengeToEntity(challenge: PrismaChallenge): Challenge {
    const entity = new Challenge();
    entity.id = challenge.id;
    entity.campaignId = challenge.campaign_id;
    entity.name = challenge.name;
    entity.operator = challenge.operator;
    entity.type = challenge.type as ChallengeType;
    entity.typeData = challenge.type_data?.valueOf() as ChallengeTypeData;
    entity.points = challenge.points ?? undefined;
    entity.imageUri = challenge.image_uri ?? undefined;
    entity.startsAt = challenge.starts_at ?? undefined;
    entity.endsAt = challenge.ends_at ?? undefined;
    entity.createdAt = challenge.created_at;
    entity.lastUpdatedAt = challenge.last_updated_at;
    return entity;
  }

  private mapPrismaRewardToEntity(reward: PrismaReward): Reward {
    return {
      id: reward.id,
      campaignId: reward.campaign_id,
      challengeId: reward.challenge_id ?? undefined,
      name: reward.name,
      description: reward.description ?? undefined,
      type: reward.type as RewardType,
      typeData: reward.type_data?.valueOf() as RewardTypeData,
      conditionType: reward.condition_type as RewardConditionType,
      imageUri: reward.image_uri ?? undefined,
      conditionTypeData:
        reward.condition_type_data?.valueOf() as RewardConditionTypeData,
      createdAt: reward.created_at,
      lastUpdatedAt: reward.last_updated_at,
    };
  }

  private mapPrismaCampaignToEntity(campaign: any): Campaign {
    const entity = new Campaign();
    entity.id = campaign.id;
    entity.name = campaign.name;
    entity.description = campaign.description ?? undefined;
    entity.imageUri = campaign.image_uri ?? undefined;
    entity.phosphorOrgId = campaign.phosphor_org_id ?? undefined;
    entity.startsAt = campaign.starts_at ?? undefined;
    entity.endsAt = campaign.ends_at ?? undefined;
    entity.createdAt = campaign.created_at;
    entity.lastUpdatedAt = campaign.last_updated_at ?? undefined;
    entity.phosphorDropId = campaign.phosphor_drop_id ?? undefined;
    entity.phosphorContractAddress =
      campaign.phosphor_contract_address ?? undefined;
    entity.phosphorCollectionId = campaign.phosphor_collection_id ?? undefined;
    entity.phosphorListingId = campaign.phosphor_listing_id ?? undefined;
    entity.phosphorChainId = campaign.phosphor_chain_id ?? undefined;
    entity.passMintUrl = campaign.pass_mint_url ?? undefined;
    entity.passMintPhosphorUrl = campaign.pass_mint_phosphor_url ?? undefined;
    entity.challenges = campaign.challenges?.map(
      this.mapPrismaChallengeToEntity,
    );
    entity.rewards = campaign.rewards?.map(this.mapPrismaRewardToEntity);
    return entity;
  }

  private mapPrismaChallengeSuccessToEntity(
    success: PrismaChallengeSuccess,
  ): ChallengeSuccess {
    return {
      id: success.id,
      challengeId: success.challenge_id,
      campaignId: success.campaign_id,
      address: success.address,
      points: success.points ?? 0,
      completedAt: success.completed_at,
      createdAt: success.created_at,
      lastUpdatedAt: success.last_updated_at,
    };
  }

  private mapPrismaRewardDistributionToEntity(
    distribution: PrismaRewardDistribution,
  ): RewardDistribution {
    return {
      id: distribution.id,
      rewardId: distribution.reward_id,
      campaignId: distribution.campaign_id,
      address: distribution.address,
      distributedAt: distribution.distributed_at,
      createdAt: distribution.created_at,
      lastUpdatedAt: distribution.last_updated_at,
    };
  }

  async findParticipantPassForChallenge(
    challengeId: string,
    accountAddress: string,
    includeMetadata: boolean = false,
  ): Promise<PublicCampaignPassDto> {
    const challenge = await this.findOneChallenge(challengeId);
    return await this.findParticipantPass(
      challenge.campaignId,
      accountAddress,
      includeMetadata,
    );
  }

  async findParticipantPass(
    campaignId: string,
    accountAddress: string,
    includeMetadata: boolean = false,
  ): Promise<PublicCampaignPassDto> {
    //TODO cache this campaignId <> collectionId+contractAddress match, since immutable (only when collectionId is set)
    const campaign = await this.findOne(campaignId);
    if (
      campaign.phosphorContractAddress &&
      campaign.phosphorChainId &&
      campaign.phosphorCollectionId
    ) {
      //TODO cache this campaignId+accountAddress <> passIfAny match, since immutable
      const passHoldingStatus =
        await this.cacheService.getPassHoldingStatus_cached(
          accountAddress,
          campaign.phosphorContractAddress,
          campaign.phosphorChainId,
        );
      let passIfAny: any;
      if (passHoldingStatus && passHoldingStatus.holdsNft) {
        passIfAny = passHoldingStatus;
      } else {
        passIfAny = await this.phosphorAdminApiClient.checkIfAccountHoldsNft(
          accountAddress,
          campaign.phosphorContractAddress,
          campaign.phosphorChainId,
        );
      }
      if (passIfAny.holdsNft) {
        let nftPass: PhosphorNftPass | undefined;
        await this.cacheService.setPassHoldingStatus_cached(
          accountAddress,
          campaign.phosphorContractAddress,
          campaign.phosphorChainId,
          passIfAny,
        ); // caching holding status only when NFT is held (immutable status as they're non-transferrable SBTs)
        if (includeMetadata) {
          nftPass = await this.getParticipantPass(campaign, passIfAny.tokenId);
        }
        return {
          tokenId: passIfAny.tokenId,
          phosphorCollectionId: campaign.phosphorCollectionId,
          phosphorContractAddress: campaign.phosphorContractAddress,
          phosphorChainId: campaign.phosphorChainId,
          metadata: nftPass?.metadata,
        };
      }
    }
    throw new NotFoundException(
      'No pass found for participant for this campaign',
    );
  }

  async getParticipantPass(
    campaign: Campaign,
    tokenId: number,
  ): Promise<PhosphorNftPass | undefined> {
    if (
      campaign.phosphorContractAddress &&
      campaign.phosphorChainId &&
      campaign.phosphorCollectionId
    ) {
      const rawMetadata = await this.phosphorPublicApiClient.getNftMetadata(
        campaign.phosphorCollectionId,
        tokenId,
      );
      const metadata: PhosphorNftPassMetadata = new PhosphorNftPassMetadata();
      if (rawMetadata) {
        // mapping raw Phosphor onchain metadata to NFT pass metadata
        metadata.title = rawMetadata.name;
        metadata.description = rawMetadata.description;
        metadata.image_url = rawMetadata.image;
        for (const attribute of rawMetadata.attributes) {
          metadata[attribute.trait_type] = attribute.value;
        }
        metadata.campaign_completed =
          metadata['campaign_completed'].toString() === 'Yes' ? true : false;
        if (!metadata.challenges_summary_json) {
          this.logger.warn(
            `Challenges summary JSON not found in metadata for campaign ${campaign.id} token ${tokenId}`,
          );
          return;
        }
        metadata.challenges_summary = JSON.parse(
          metadata.challenges_summary_json,
        );
        //console.log(metadata);
      }
      const itemId = await this.phosphorAdminApiClient.getItemIdFromTokenId(
        campaign.phosphorCollectionId,
        tokenId,
      );
      return {
        itemId: itemId ?? '',
        tokenId,
        collectionId: campaign.phosphorCollectionId,
        contractAddress: campaign.phosphorContractAddress,
        chainId: campaign.phosphorChainId,
        metadata,
      };
    }
    return undefined;
  }

  async getMemberLoyaltyScore(address: string) {
    const aggreg = await this.prisma.challengeSuccess.aggregate({
      where: { address },
      _sum: {
        points: true,
      },
    });
    return aggreg?._sum.points ?? 0;
  }

  async getCampaignLeaderboard(
    campaignId: string,
  ): Promise<{ address: string; score: number }[]> {
    const results = await this.prisma.challengeSuccess.groupBy({
      by: ['address'],
      where: { campaign_id: campaignId },
      _sum: {
        points: true,
      },
    });
    return results.map((result) => ({
      address: result.address,
      score: result._sum.points ?? 0,
    }));
  }

  async getLoyaltyLeaderboard(): Promise<{ address: string; score: number }[]> {
    const results = await this.prisma.challengeSuccess.groupBy({
      by: ['address'],
      _sum: {
        points: true,
      },
    });
    return results.map((result) => ({
      address: result.address,
      score: result._sum.points ?? 0,
    }));
  }

  async findParticipantDistributedRewards(
    campaignId: string,
    accountAddress: string,
  ): Promise<RewardDistribution[]> {
    const distributions = await this.prisma.rewardDistribution.findMany({
      where: {
        campaign_id: campaignId,
        address: accountAddress,
      },
      include: {
        reward: true,
      },
    });
    return distributions.map(this.mapPrismaRewardDistributionToEntity);
  }
}
