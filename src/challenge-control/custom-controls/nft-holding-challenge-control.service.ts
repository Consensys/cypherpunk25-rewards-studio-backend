import { Injectable } from '@nestjs/common';
import { Challenge } from '../../campaigns/entities/challenges/challenge.entity';
import { AbstractChallengeControlService } from '../abstract-challenge-control.service';
import { PhosphorNftPass } from '../../utils/phosphor/phosphor-nft-pass';
import { CampaignsService } from '../../campaigns/campaigns.service';
import { PhosphorAdminApiClient } from '../../utils/phosphor/phosphor-admin-api.client';
import { Logger } from '@nestjs/common';
@Injectable()
export class NftHoldingChallengeControlService extends AbstractChallengeControlService {
  protected readonly logger = new Logger(
    NftHoldingChallengeControlService.name,
  );

  constructor(
    protected readonly phosphorAdminApiClient: PhosphorAdminApiClient,
    protected readonly campaignsService: CampaignsService,
  ) {
    super(phosphorAdminApiClient, campaignsService);
  }

  async checkChallengeForAllParticipants(
    challenge: Challenge,
    participantAddresses: string[],
  ): Promise<void> {}

  async checkChallengeForSingleParticipant(
    challenge: Challenge,
    participantAddress: string,
    nftPass: PhosphorNftPass,
  ): Promise<PhosphorNftPass> {
    let challengeCompleted = false;
    if (!challenge.typeData?.contractAddress || !challenge.typeData?.chainId) {
      this.logger.warn(
        `Can't check NFT holding challenge for account ${participantAddress}. Challenge ${challenge.id} has no contract address or chain id`,
      );
      return nftPass;
    }
    const holdingStatus =
      await this.phosphorAdminApiClient.prodIndexerCheckIfAccountHoldsNft(
        participantAddress,
        challenge.typeData?.contractAddress,
        challenge.typeData?.chainId,
      );
    //console.log('holdingStatus', holdingStatus);
    challengeCompleted =
      holdingStatus.holdsNft &&
      (challenge.typeData?.minimumHeldNfts
        ? holdingStatus.totalNfts >= challenge.typeData?.minimumHeldNfts
        : true); // if min. held is set, wecheck, otherwise simply owning one is valid
    if (challengeCompleted) {
      this.logger.log(
        `NFT holding challenge ${challenge.id} validated for participant ${participantAddress}`,
      );
      nftPass = await this.trackSuccessfulChallenge(
        challenge,
        participantAddress,
        nftPass,
      );
    }
    return nftPass;
  }
}
