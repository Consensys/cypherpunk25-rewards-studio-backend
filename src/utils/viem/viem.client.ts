import { Injectable } from '@nestjs/common';
import {
  createPublicClient,
  fallback,
  http,
  HttpTransport,
  parseAbiItem,
  PublicClient,
} from 'viem';
import { lineaSepolia, linea } from 'viem/chains';
import { ConfigService } from '@nestjs/config';
import { Erc20TransferLog } from './viem-interfaces';

@Injectable()
export class ViemClient {
  private readonly publicClients: Map<number, any> = new Map();

  constructor(private readonly configService: ConfigService) {}

  async getBlock(chainId: number, blockNumber: bigint) {
    return this.getClient(chainId).getBlock({
      blockNumber,
    });
  }

  /*
  async getBlockByTimestamp(chainId: number, timestamp: number) {
    return this.getClient(chainId)
      .getBlock({
        blockTag: 'latest',
        includeTransactions: false,
      })
      .then(async (latestBlock) => {
        // Binary search to find the block with the closest timestamp
        let left = 0n;
        let right = latestBlock.number;

        while (left <= right) {
          const mid = (left + right) / 2n;
          const block = await this.getClient(chainId).getBlock({
            blockNumber: mid,
            includeTransactions: false,
          });

          if (block.timestamp === BigInt(timestamp)) {
            return block;
          }

          if (block.timestamp < BigInt(timestamp)) {
            left = mid + 1n;
          } else {
            right = mid - 1n;
          }
        }

        // Return the block with the closest timestamp
        const leftBlock = await this.getClient(chainId).getBlock({
          blockNumber: left,
          includeTransactions: false,
        });
        const rightBlock = await this.getClient(chainId).getBlock({
          blockNumber: right,
          includeTransactions: false,
        });

        const leftDiff = Number(leftBlock.timestamp) - timestamp;
        const rightDiff = timestamp - Number(rightBlock.timestamp);

        return leftDiff < rightDiff ? leftBlock : rightBlock;
      });
  }*/

  async getErc20Logs(
    chainId: number,
    erc20TokenAddress: `0x${string}`,
    from: `0x${string}`,
    to: `0x${string}`,
  ): Promise<Erc20TransferLog[]> {
    const logs = await this.getClient(chainId).getLogs({
      address: erc20TokenAddress, //'0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
      event: parseAbiItem(
        'event Transfer(address indexed from, address indexed to, uint256 value)',
      ),
      args: {
        from, // '0x05B9c336A5DA2B7452E1861496a3a3Caa1Caa873',
        to, // '0xf344192b9146132fC0e997D1666dC1531Bf8F7Cd',
      },
      fromBlock: 0n,
      toBlock: 'latest',
    });
    return logs.map((log) => ({
      eventName: log.eventName,
      args: log.args,
      transactionHash: log.transactionHash,
      blockNumber: log.blockNumber,
    }));
  }

  getClient(chainId: number): PublicClient {
    if (!this.publicClients.has(chainId)) {
      const client = createPublicClient({
        chain: this.getChain(chainId),
        transport: fallback([http(), this.getRpcForChain(chainId)]),
      });
      this.addPublicClient(chainId, client);
    }
    return this.publicClients.get(chainId);
  }

  private addPublicClient(chainId: number, client: any) {
    this.publicClients.set(chainId, client);
  }

  private getPublicClient(chainId: number) {
    return this.publicClients.get(chainId);
  }

  private getChain(chainId: number) {
    switch (chainId) {
      case 59141:
        return lineaSepolia;
      case 59144:
        return linea;
      default:
        throw new Error(`Chain ${chainId} not supported`);
    }
  }

  private getRpcForChain(chainId: number): HttpTransport {
    switch (chainId) {
      case 59141:
        return http(this.configService.get('LINEA_SEPOLIA_RPC_URL'));
      case 59144:
        return http(this.configService.get('LINEA_RPC_URL'));
      default:
        throw new Error(`Chain ${chainId} not supported`);
    }
  }

  private getFallbackTransports = (rpcUrls: string[]) =>
    rpcUrls.map((url) => http(url));
}
