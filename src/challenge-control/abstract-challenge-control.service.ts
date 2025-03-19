import { Injectable } from '@nestjs/common';
import { Challenge } from '../campaigns/entities/challenges/challenge.entity';
import { PhosphorAdminApiClient } from '../utils/phosphor/phosphor-admin-api.client';
import { PhosphorNftPass } from '../utils/phosphor/phosphor-nft-pass';
import { CampaignsService } from '../campaigns/campaigns.service';
import { Logger } from '@nestjs/common';
@Injectable()
export abstract class AbstractChallengeControlService {
  protected readonly logger = new Logger(AbstractChallengeControlService.name);
  constructor(
    protected readonly phosphorAdminApiClient: PhosphorAdminApiClient,
    protected readonly campaignsService: CampaignsService,
  ) {}

  abstract checkChallengeForAllParticipants(
    challenge: Challenge,
    participantAddresses: string[],
  ): Promise<void>;

  abstract checkChallengeForSingleParticipant(
    challenge: Challenge,
    participantAddress: string,
    nftPass: PhosphorNftPass,
  ): Promise<PhosphorNftPass>;

  async trackSuccessfulChallenge(
    challenge: Challenge,
    participantAddress: string,
    nftPass: PhosphorNftPass,
    timestamp: Date = new Date(),
  ): Promise<PhosphorNftPass> {
    await this.addSuccessfulChallengeEntryForParticipant(
      challenge,
      participantAddress,
      timestamp,
    );
    const updatedNftPass = await this.updateNftMetadataWithSuccessfulChallenge(
      nftPass,
      challenge,
      timestamp,
    );
    this.logger.log(
      `Challenge ${challenge.id} completed for participant ${participantAddress} and stored in NFT pass`,
    );
    return updatedNftPass;
  }

  async addSuccessfulChallengeEntryForParticipant(
    challenge: Challenge,
    participantAddress: string,
    timestamp: Date = new Date(),
  ): Promise<void> {
    await this.campaignsService.createChallengeSuccess(
      challenge.id,
      challenge.campaignId,
      participantAddress,
      timestamp,
      challenge.points,
    );
  }

  async updateNftMetadataWithSuccessfulChallenge(
    nftPass: PhosphorNftPass,
    challenge: Challenge,
    timestamp: Date = new Date(),
  ): Promise<PhosphorNftPass> {
    const challengeSummary = nftPass.metadata?.challenges_summary?.find(
      (c) => c.challenge_id === challenge.id,
    );
    if (challengeSummary) {
      challengeSummary.challenge_completed = true;
      challengeSummary.challenge_timestamp = timestamp;
      challengeSummary.challenge_points = challenge.points ?? 0; // now giving points for completing the challenge
      nftPass.metadata?.sync();
      await this.updateNftMetadata(nftPass);
    }
    return nftPass;
  }

  private async updateNftMetadata(nftPass: PhosphorNftPass): Promise<void> {
    this.logger.log('Updating NFT metadata for challenge', nftPass.itemId);
    if (!nftPass.metadata) return;
    nftPass.metadata.challenges_summary_json = JSON.stringify(
      nftPass.metadata.challenges_summary,
    );
    await this.phosphorAdminApiClient.updateItemMetadata(nftPass.itemId, {
      ...nftPass.metadata,
      challenges_summary: undefined, // excluding this object from onchain metadata
    });
  }
}
