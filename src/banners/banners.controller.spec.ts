import { Test, TestingModule } from '@nestjs/testing';
import { BannersController } from './banners.controller';
import { BannersService } from './banners.service';
import { PrismaService } from '../utils/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
describe('BannersController', () => {
  let controller: BannersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BannersController],
      providers: [BannersService, PrismaService, ConfigService],
    }).compile();

    controller = module.get<BannersController>(BannersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
