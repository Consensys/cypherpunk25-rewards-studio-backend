import { Injectable, Logger } from '@nestjs/common';
import { Challenge } from '../../campaigns/entities/challenges/challenge.entity';
import { AbstractChallengeControlService } from '../abstract-challenge-control.service';
import { PhosphorNftPass } from '../../utils/phosphor/phosphor-nft-pass';
import { CampaignsService } from '../../campaigns/campaigns.service';
import { PhosphorAdminApiClient } from '../../utils/phosphor/phosphor-admin-api.client';
import { MetafiApiClient } from '../../utils/metafi/metafi-api.client';
import { ChallengeTypeData } from '../../campaigns/entities/challenges/challenge-type-data.entity';
import type { MetaFiTxRelationshipData } from '../../utils/types/MetaFiTxRelationshipData';

@Injectable()
export class SwapChallengeControlService extends AbstractChallengeControlService {
  protected readonly logger: Logger = new Logger(
    SwapChallengeControlService.name,
  );

  //TODO: move to Maps (faster to read)
  private readonly swapsContracts: { chainId: number; address: string }[] = [
    {
      chainId: 1,
      address: '0x881D40237659C251811CEC9c364ef91dC08D300C',
    },
    {
      chainId: 137,
      address: '0x881D40237659C251811CEC9c364ef91dC08D300C',
    },
    {
      chainId: 59144,
      address: '0x9dDA6Ef3D919c9bC8885D5560999A3640431e8e6',
    },
    {
      chainId: 42161,
      address: '0x9dDA6Ef3D919c9bC8885D5560999A3640431e8e6',
    },
    {
      chainId: 8453,
      address: '0x9dDA6Ef3D919c9bC8885D5560999A3640431e8e6',
    },
  ];
  private readonly swapsV2Contracts: { chainId: number; address: string }[] = [
    {
      chainId: 1,
      address: '0x2b52adacb176a8651ec5cf17b26d160219d34194',
    },
    {
      chainId: 137,
      address: '0x881D40237659C251811CEC9c364ef91dC08D300C',
    },
    {
      chainId: 59144,
      address: '0xf2f031f30f1c835dbe17264c9371546c4cec1bcd',
    },
    {
      chainId: 42161,
      address: '0xcfec161540f82c0c48a0851af9fce0d94eecac67',
    },
    {
      chainId: 8453,
      address: '0x411b9b5a876095acebaa1811bd016cb1b3e2a679',
    },
  ];

  constructor(
    protected readonly phosphorAdminApiClient: PhosphorAdminApiClient,
    protected readonly campaignsService: CampaignsService,
    private readonly metafiApiClient: MetafiApiClient,
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
    //FIXME: Very simple implementation atm
    // only checking one chain, for both swap contracts versions
    // using simple endpoint for Metafi to check latest txRelationship between two addresses
    const chainId = challenge.typeData.chainId;
    if (!chainId) {
      this.logger.warn(
        `Challenge ${challenge.id} can't be completed multi-chains swap check is not supported yet. ChainId must be defined in challenge type data`,
      );
      return nftPass;
    }

    const swapContractsToCheck = {
      v1: this.swapsContracts.find((c) => c.chainId === chainId)?.address,
      v2: this.swapsV2Contracts.find((c) => c.chainId === chainId)?.address,
    };
    if (swapContractsToCheck.v1) {
      const tx =
        await this.metafiApiClient.getMostRecentTransactionAgainstSpecificAddress(
          participantAddress,
          swapContractsToCheck.v1,
          chainId,
        );
      challengeCompleted = this.checkTransactionIfAny(tx, challenge.typeData);
    }
    if (!challengeCompleted && swapContractsToCheck.v2) {
      const tx =
        await this.metafiApiClient.getMostRecentTransactionAgainstSpecificAddress(
          participantAddress,
          swapContractsToCheck.v2,
          chainId,
        );
      challengeCompleted = this.checkTransactionIfAny(tx, challenge.typeData);
    }
    if (challengeCompleted) {
      this.logger.log(
        `Metamask Swap challenge ${challenge.id} validated for participant ${participantAddress}`,
      );
      nftPass = await this.trackSuccessfulChallenge(
        challenge,
        participantAddress,
        nftPass,
      );
    }
    return nftPass;
  }

  private checkTransactionIfAny(
    txRelationship: MetaFiTxRelationshipData | null | undefined,
    constraints: ChallengeTypeData,
  ): boolean {
    if (!txRelationship) return false;
    const found = !!txRelationship.count && txRelationship.count > 0;
    const timestampOk =
      !constraints.transactionMinimumTimestamp ||
      new Date(txRelationship.data.timestamp) >=
        new Date(constraints.transactionMinimumTimestamp);
    const quantityOk =
      !constraints.minimumMetaMaskSwaps ||
      txRelationship.count >= constraints.minimumMetaMaskSwaps;
    return found && quantityOk && timestampOk;
  }
}
