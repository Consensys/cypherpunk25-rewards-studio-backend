import { Test, TestingModule } from '@nestjs/testing';
import { CampaignsService } from './campaigns.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../utils/prisma/prisma.service';
import { PhosphorAdminApiModule } from '../utils/phosphor/phosphor-admin-api.module';
import { PhosphorPublicApiModule } from '../utils/phosphor/phosphor-public-api.module';
import { RewardsCacheModule } from '../utils/cache/rewards-cache.module';
import { CacheModule } from '@nestjs/cache-manager';
describe('CampaignsService', () => {
  let service: CampaignsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CacheModule.register({
          isGlobal: true,
        }),
        PhosphorAdminApiModule,
        PhosphorPublicApiModule,
        RewardsCacheModule,
      ],
      providers: [CampaignsService, ConfigService, PrismaService],
    }).compile();

    service = module.get<CampaignsService>(CampaignsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
