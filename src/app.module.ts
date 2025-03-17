import { Module } from '@nestjs/common';
import { MembersModule } from './members/members.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { BannersModule } from './banners/banners.module';
import { ConfigModule } from '@nestjs/config';
import { EngineModule } from './engine/engine.module';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './utils/filters/all-exceptions.filter';
import { HttpExceptionsFilter } from './utils/filters/http-exceptions.filter';
import { ChallengeControlModule } from './challenge-control/challenge-control.module';
import { RewardDistributionModule } from './reward-distribution/reward-distribution.module';
import { CacheModule } from '@nestjs/cache-manager';
@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
    }),
    MembersModule,
    CampaignsModule,
    BannersModule,
    ChallengeControlModule,
    EngineModule,
    RewardDistributionModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionsFilter,
    },
  ],
})
export class AppModule {}
