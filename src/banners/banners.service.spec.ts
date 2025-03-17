import { Test, TestingModule } from '@nestjs/testing';
import { BannersService } from './banners.service';
import { PrismaService } from '../utils/prisma/prisma.service';

describe('BannersService', () => {
  let service: BannersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BannersService, PrismaService],
    }).compile();

    service = module.get<BannersService>(BannersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
