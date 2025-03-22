import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { async, firstValueFrom } from 'rxjs';

@Injectable()
export class PhosphorAdminApiClient {
  private readonly PORTFOLIO_FEED_ID = 'fb678225-2e09-4924-936b-a6f467aaafad';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getCurrentUser(): Promise<{
    organizationId: string;
    userId: string;
  } | null> {
    const response = await this.get('/v1/me');
    return response.data
      ? {
          organizationId: response.data.organization.id,
          userId: response.data.user.id,
        }
      : null;
  }

  async executeNewDrop(
    data: any,
  ): Promise<{ dropId: string; dropFlowId: string; organizationId: string }> {
    console.log(data);
    const response = await this.post('/beta/creators/drops/ez-launch', data);
    return {
      dropId: response.data?.drop.id,
      dropFlowId: response.data?.drop.flows[0].id,
      organizationId: response.data?.drop.organization_id,
    };
  }

  async getDropExecutionStatus(
    dropId: string,
  ): Promise<{ isExecutionCompleted: boolean }> {
    const response = await this.get(`/beta/drops/${dropId}/execution-status`);
    return {
      isExecutionCompleted: response.data?.flows
        ? response.data.contract_deployment?.status === 'COMPLETED' &&
          response.data.flows[0].distribution?.status === 'COMPLETED'
        : false,
    };
  }

  async getDropDetails(dropId: string): Promise<any> {
    const response = await this.get(`/beta/drops/${dropId}`);
    return response.data;
  }

  //TODO these responses should be CACHED (long TTL, immutable
  async getItemIdFromTokenId(
    collectionId: string,
    tokenId: number,
  ): Promise<string | null> {
    const response = await this.get(
      `/beta/drops/utils/cnft-utils/i/${collectionId}?token_id=${tokenId}`,
    );
    return response.data?.item_id ?? null;
  }

  async updateItemMetadata(itemId: string, metadata: any): Promise<void> {
    //console.log('SENDING NEW METADATA TO CREATOR');
    //console.log(metadata);
    await this.post(
      `/beta/drops/utils/cnft-utils/i/${itemId}/update`,
      metadata,
    );
  }

  async getAllHoldersForContract(
    contractAddress: string,
    chainId: number,
  ): Promise<
    {
      contract_address: string;
      token_id: string;
      quantity: string;
      owner: string;
      chain: string;
      received_at: Date;
    }[]
  > {
    const response = await this.get(
      `/beta/drops/utils/indexer-utils/contracts/${contractAddress}/holders?network=${chainId}`,
    );
    return response.data?.holders ?? [];
  }

  async checkIfAccountHoldsNft(
    accountAddress: string,
    contractAddress: string,
    chainId: number,
  ): Promise<{ holdsNft: boolean; totalNfts: number; tokenId: number }> {
    const response = await this.get(
      `/beta/drops/utils/indexer-utils/accounts/${accountAddress}/holdings?contract=${contractAddress}&network=${chainId}`,
    );
    return {
      holdsNft: response.data?.total_results > 0,
      totalNfts: response.data?.total_results,
      tokenId:
        response.data?.total_results > 0
          ? new Number(response.data?.results[0].token_id).valueOf()
          : 0, // assuming there's always one or none for a campaign NFT pass
    };
  }

  async prodIndexerGetAllHoldersForContract(
    contractAddress: string,
    chainId: number,
  ): Promise<
    {
      contract_address: string;
      token_id: string;
      quantity: string;
      owner: string;
      chain: string;
      received_at: Date;
    }[]
  > {
    const response = await this.indexerGet(
      `/beta/drops/utils/indexer-utils/contracts/${contractAddress}/holders?network=${chainId}`,
    );
    return response.data?.holders ?? [];
  }

  async prodIndexerCheckIfAccountHoldsNft(
    accountAddress: string,
    contractAddress: string,
    chainId: number,
  ): Promise<{ holdsNft: boolean; totalNfts: number; tokenId: number }> {
    const response = await this.indexerGet(
      `/beta/drops/utils/indexer-utils/accounts/${accountAddress}/holdings?contract=${contractAddress}&network=${chainId}`,
    );
    return {
      holdsNft: response.data?.total_results > 0,
      totalNfts: response.data?.total_results,
      tokenId:
        response.data?.total_results > 0
          ? new Number(response.data?.results[0].token_id).valueOf()
          : 0, // assuming there's always one or none for a campaign NFT pass
    };
  }

  async addToPhosphorAudience(
    audienceListId: string,
    addresses: string[],
  ): Promise<{ added: number }> {
    const members = addresses.map((address) => {
      return { value: address };
    });
    const response = await this.post(
      `/beta/creators/audience-lists/${audienceListId}/members/new-entries`,
      { members },
    );
    return { added: response.data?.added };
  }

  async addToPhosphorListingAllowlist(listingId: string, addresses: string[]) {
    await this.post(`/beta/listings/${listingId}/allow-list`, {
      action: 'ADD',
      eth_addresses: addresses,
    });
  }

  async airdropNft(
    dropFlowId: string,
    itemId: string,
    address: string,
  ): Promise<{ id: string }> {
    const response = await this.post(
      `/beta/creators/drops/flows/${dropFlowId}/item-distributions/additional-transfer`,
      { address, item_id: itemId },
    );
    return { id: response.data?.id };
  }

  async addDropToPortfolio(dropFlowId: string) {
    await this.post(`/beta/admin/feeds/drop-flow`, {
      operations: [
        {
          type: 'ADD',
          feed_id: this.PORTFOLIO_FEED_ID,
          drop_flow_id: dropFlowId,
        },
      ],
    });
  }

  private route(path: string) {
    return `${this.configService.get('PHOSPHOR_ADMIN_API_URL')}${path}`;
  }

  private indexerRoute(path: string) {
    return `${this.configService.get('PHOSPHOR_INDEXER_API_URL')}${path}`;
  }

  private headers() {
    return {
      headers: {
        accept: 'application/json',
        'phosphor-api-key': this.configService.get('PHOSPHOR_ORG_APIKEY'),
      },
    };
  }

  private indexerHeaders() {
    return {
      headers: {
        accept: 'application/json',
        'phosphor-api-key': this.configService.get('TEMP_INDEXER_VALUE'),
      },
    };
  }

  private async get(path: string): Promise<AxiosResponse<any>> {
    return await firstValueFrom(
      this.httpService.get(this.route(path), this.headers()),
    );
  }

  private async indexerGet(path: string): Promise<AxiosResponse<any>> {
    return await firstValueFrom(
      this.httpService.get(this.indexerRoute(path), this.indexerHeaders()),
    );
  }

  private async post(path: string, data: any): Promise<AxiosResponse<any>> {
    return await firstValueFrom(
      this.httpService.post(this.route(path), data, this.headers()),
    );
  }
}
