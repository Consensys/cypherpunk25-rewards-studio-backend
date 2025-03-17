import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PhosphorPublicApiClient {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getNftMetadata(
    collectionId: string,
    tokenId: number,
  ): Promise<{
    name: string;
    description: string;
    image: string;
    attributes: { trait_type: string; value: string }[];
  }> {
    const response = await this.get(`/v1/metadata/${collectionId}/${tokenId}`);
    return response?.data;
  }

  private route(path: string) {
    return `${this.configService.get('PHOSPHOR_PUBLIC_API_URL')}${path}`;
  }

  private headers() {
    return {
      headers: {
        accept: 'application/json',
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
