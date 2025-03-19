import { Injectable } from '@nestjs/common';
import {
  Challenge,
  ChallengeType,
} from '../campaigns/entities/challenges/challenge.entity';
import { PhosphorNftPass } from '../utils/phosphor/phosphor-nft-pass';
import { SwapChallengeControlService } from './custom-controls/swap-challenge-control.service';
import { NftHoldingChallengeControlService } from './custom-controls/nft-holding-challenge-control.service';
import { AbstractChallengeControlService } from './abstract-challenge-control.service';
@Injectable()
export class ChallengeControlService {
  private readonly challengeControlServices: Map<
    ChallengeType,
    AbstractChallengeControlService
  > = new Map();

  constructor(
    private readonly nftHoldingChallengeControlService: NftHoldingChallengeControlService,
    private readonly swapChallengeControlService: SwapChallengeControlService,
  ) {
    this.challengeControlServices.set(
      ChallengeType.NFT_OWNERSHIP_BY_TOKEN,
      this.nftHoldingChallengeControlService,
    );
    this.challengeControlServices.set(
      ChallengeType.NFT_OWNERSHIP_BY_QUANTITY,
      this.nftHoldingChallengeControlService,
    );
    this.challengeControlServices.set(
      ChallengeType.METAMASK_SWAP,
      this.swapChallengeControlService,
    );
  }

  async controlChallenge(
    challenge: Challenge,
    participantAddress: string,
    nftPass: PhosphorNftPass,
  ): Promise<PhosphorNftPass> {
    const challengeControlService = this.challengeControlServices.get(
      challenge.type,
    );
    if (!challengeControlService) {
      throw new Error(
        `No challenge control service found for challenge type: ${challenge.type}`,
      );
    }
    return challengeControlService.checkChallengeForSingleParticipant(
      challenge,
      participantAddress,
      nftPass,
    );
  }
}
