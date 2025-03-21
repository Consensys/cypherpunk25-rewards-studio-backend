import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import type { MetaFiTxRelationshipData } from '../types/MetaFiTxRelationshipData';

@Injectable()
export class MetafiApiClient {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getTransactions(
    accountAddress: string,
    chainId: number,
  ): Promise<{
    pageInfo: { count: number; hasNextPage: boolean; cursor: string };
    data: {
      timestamp: Date;
      to: string;
      from: string;
      chainId: number;
      value: string;
    }[];
  }> {
    const response = await this.get(
      `/v1/accounts/${accountAddress}/transactions?networks=${chainId}&limit=50`,
    );
    return response?.data;
  }

  async getMostRecentTransactionAgainstSpecificAddress(
    accountAddress: string,
    againstAddress: string,
    chainId: number,
  ): Promise<MetaFiTxRelationshipData | null | undefined> {
    const response = await this.get(
      `/v1/networks/${chainId}/accounts/${accountAddress}/relationships/${againstAddress}`,
    );
    return response?.status === 204
      ? null
      : (response?.data as MetaFiTxRelationshipData);
  }

  private route(path: string) {
    return `${this.configService.get('METAFI_API_URL')}${path}`;
  }

  private headers() {
    return {
      headers: {
        accept: 'application/json',
        'x-metamask-clientproduct': 'rewards-studio',
      },
    };
  }

  private async get(path: string): Promise<AxiosResponse<any>> {
    return await firstValueFrom(
      this.httpService.get(this.route(path), this.headers()),
    );
  }

  private async post(path: string, data: any): Promise<AxiosResponse<any>> {
    return await firstValueFrom(
      this.httpService.post(this.route(path), data, this.headers()),
    );
  }
}
