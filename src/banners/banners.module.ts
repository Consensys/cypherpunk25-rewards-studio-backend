import { Module } from '@nestjs/common';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';
import { PrismaModule } from '../utils/prisma/prisma.module';
import { PublicBannersController } from './public.banners.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [BannersController, PublicBannersController],
  providers: [BannersService],
  exports: [BannersService],
})
export class BannersModule {}
