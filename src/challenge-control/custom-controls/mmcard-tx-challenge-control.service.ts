import { Injectable, Logger } from '@nestjs/common';
import { Challenge } from '../../campaigns/entities/challenges/challenge.entity';
import { AbstractChallengeControlService } from '../abstract-challenge-control.service';
import { PhosphorNftPass } from '../../utils/phosphor/phosphor-nft-pass';
import { CampaignsService } from '../../campaigns/campaigns.service';
import { PhosphorAdminApiClient } from '../../utils/phosphor/phosphor-admin-api.client';
import { ChallengeTypeData } from '../../campaigns/entities/challenges/challenge-type-data.entity';
import { Erc20Token } from '../../utils/entities/common-enums';
import { ViemClient } from '../../utils/viem/viem.client';
import { Erc20TransferLog } from '../../utils/viem/viem-interfaces';

@Injectable()
export class MmCardTxChallengeControlService extends AbstractChallengeControlService {
  protected readonly logger: Logger = new Logger(
    MmCardTxChallengeControlService.name,
  );

  private readonly mmCardAddress = '0xf344192b9146132fC0e997D1666dC1531Bf8F7Cd';
  private readonly mmCardChainId = 59144;

  private readonly cardErc20Tokens: Map<Erc20Token, `0x${string}`> = new Map();

  constructor(
    protected readonly phosphorAdminApiClient: PhosphorAdminApiClient,
    protected readonly campaignsService: CampaignsService,
    private readonly viemClient: ViemClient,
  ) {
    super(phosphorAdminApiClient, campaignsService);
    this.initMap();
  }

  private initMap() {
    this.cardErc20Tokens.set(
      Erc20Token.USDC,
      '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
    );
    this.cardErc20Tokens.set(
      Erc20Token.USDT,
      '0xA219439258ca9da29E9Cc4cE5596924745e12B93',
    );
    this.cardErc20Tokens.set(
      Erc20Token.WETH,
      '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f',
    );
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
    const erc20Token = challenge.typeData.erc20Token;
    if (erc20Token && !this.cardErc20Tokens.has(erc20Token)) {
      this.logger.warn(
        `Challenge ${challenge.id} can't be completed, ERC20 ${erc20Token} is not supported yet for MM card check.`,
      );
      return nftPass;
    }

    let erc20TokensToCheck: `0x${string}`[] = [];
    if (erc20Token) {
      erc20TokensToCheck.push(this.cardErc20Tokens.get(erc20Token) ?? '0x'); // ONLY SPECIFIC ONE
    } else {
      erc20TokensToCheck.push(...this.cardErc20Tokens.values()); // ALL
    }

    for (const erc20TokenAddress of erc20TokensToCheck) {
      // fetching transfer(s) from the participant to the mm card address for given ERC20 token
      const transfers = await this.viemClient.getErc20Logs(
        this.mmCardChainId,
        erc20TokenAddress,
        participantAddress as `0x${string}`,
        this.mmCardAddress,
      );
      challengeCompleted = await this.checkTransfersIfAny(
        transfers,
        challenge.typeData,
      );
      if (challengeCompleted) break; // no need to check other erc20 tokens
    }

    if (challengeCompleted) {
      this.logger.log(
        `Metamask Card Tx challenge ${challenge.id} validated for participant ${participantAddress}`,
      );
      nftPass = await this.trackSuccessfulChallenge(
        challenge,
        participantAddress,
        nftPass,
      );
    }
    return nftPass;
  }

  private async checkTransfersIfAny(
    transfers: Erc20TransferLog[] | null | undefined,
    constraints: ChallengeTypeData,
  ): Promise<boolean> {
    if (!transfers || transfers.length === 0) return false;
    const minimumBlockNumber = await this.getMinimumBlockNumberForTimestamp(
      constraints.transactionMinimumTimestamp,
    );
    if (minimumBlockNumber > 0n) {
      // keeping only transfers after the minimum block number
      transfers = transfers.filter((t) => t.blockNumber >= minimumBlockNumber);
    }
    const minimumMetaMaskCardTransactions =
      constraints.minimumMetaMaskCardTransactions ?? 1; // always checking at least 1 tx as a minimum
    const quantityOk = transfers.length >= minimumMetaMaskCardTransactions;
    return quantityOk;
  }

  private async getMinimumBlockNumberForTimestamp(
    timestamp: Date | undefined,
  ): Promise<bigint> {
    if (!timestamp) return 0n;
    // TODO cache the timestamp -> block number mapping
    // FIXME: this is a hack to avoid the viem client to be called millions of times to detect the block number
    return 0n;
    /*const blockNumber = await this.viemClient.getBlockNumber(
      this.mmCardChainId,
      timestamp,
    );
    return blockNumber;*/
  }
}
