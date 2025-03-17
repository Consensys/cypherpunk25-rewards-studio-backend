import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  private readonly OPENGATE_STATUS_TTL = 60 * 60 * 12; // 12 hours
  private readonly PASSHOLDING_STATUS_TTL = 60 * 60 * 12; // 12 hours
  private readonly CLOSEDGATE_STATUS_TTL = 60; // 1 minute

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async getGateIfOpen_cached(
    campaignId: string,
    accountAddress: string,
  ): Promise<any> {
    const key = `campaign-${campaignId}-account-${accountAddress}-open-gate`;
    const cached = await this.get(key);
    if (cached) {
      return cached;
    }
  }

  async setGateIfOpen_cached(
    campaignId: string,
    accountAddress: string,
    value: any,
  ): Promise<void> {
    const key = `campaign-${campaignId}-account-${accountAddress}-open-gate`;
    await this.set(key, value, this.OPENGATE_STATUS_TTL); // long TTL for open gates, immutable state
  }

  async getGateIfClosed_cached(
    campaignId: string,
    accountAddress: string,
  ): Promise<any> {
    const key = `campaign-${campaignId}-account-${accountAddress}-closed-gate`;
    const cached = await this.get(key);
    if (cached) {
      return cached;
    }
  }

  async setGateIfClosed_cached(
    campaignId: string,
    accountAddress: string,
    value: any,
  ): Promise<void> {
    const key = `campaign-${campaignId}-account-${accountAddress}-closed-gate`;
    await this.set(key, value, this.CLOSEDGATE_STATUS_TTL); // short TTL for closed gates, state might change
  }

  async getChallengeLevelGateIfOpen_cached(
    challengeId: string,
    accountAddress: string,
  ): Promise<any> {
    const key = `challenge-${challengeId}-account-${accountAddress}-open-gate`;
    const cached = await this.get(key);
    if (cached) {
      return cached;
    }
  }

  async setChallengeLevelGateIfOpen_cached(
    challengeId: string,
    accountAddress: string,
    value: any,
  ): Promise<void> {
    const key = `challenge-${challengeId}-account-${accountAddress}-open-gate`;
    await this.set(key, value, this.OPENGATE_STATUS_TTL); // long TTL for open gates, immutable state
  }

  async getChallengeLevelGateIfClosed_cached(
    challengeId: string,
    accountAddress: string,
  ): Promise<any> {
    const key = `challenge-${challengeId}-account-${accountAddress}-closed-gate`;
    const cached = await this.get(key);
    if (cached) {
      return cached;
    }
  }

  async setChallengeLevelGateIfClosed_cached(
    challengeId: string,
    accountAddress: string,
    value: any,
  ): Promise<void> {
    const key = `challenge-${challengeId}-account-${accountAddress}-closed-gate`;
    await this.set(key, value, this.CLOSEDGATE_STATUS_TTL); // short TTL for closed gates, state might change
  }

  async getPassHoldingStatus_cached(
    accountAddress: string,
    contractAddress: string,
    chainId: number,
  ): Promise<any> {
    const key = `account-${accountAddress}-contract-${contractAddress}-chain-${chainId}-pass-holding`;
    const cached = await this.get(key);
    if (cached) {
      return cached;
    }
  }

  async setPassHoldingStatus_cached(
    accountAddress: string,
    contractAddress: string,
    chainId: number,
    value: any,
  ): Promise<void> {
    const key = `account-${accountAddress}-contract-${contractAddress}-chain-${chainId}-pass-holding`;
    await this.set(key, value, this.PASSHOLDING_STATUS_TTL); // long TTL for open gates, immutable state
  }

  private async get(key: string): Promise<any> {
    return await this.cacheManager.get(key);
  }

  private async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, (ttl ?? 0) * 1000); // TTL in ms
  }
}
