import { Test, TestingModule } from '@nestjs/testing';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../utils/prisma/prisma.service';
import { PhosphorAdminApiModule } from '../utils/phosphor/phosphor-admin-api.module';
import { PhosphorPublicApiModule } from '../utils/phosphor/phosphor-public-api.module';
import { CacheModule } from '@nestjs/cache-manager';
import { RewardsCacheModule } from '../utils/cache/rewards-cache.module';
describe('CampaignsController', () => {
  let controller: CampaignsController;

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
      controllers: [CampaignsController],
      providers: [CampaignsService, ConfigService, PrismaService],
    }).compile();

    controller = module.get<CampaignsController>(CampaignsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
