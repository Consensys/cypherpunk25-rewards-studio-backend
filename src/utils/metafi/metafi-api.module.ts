import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import 'dotenv/config';
import { ConfigModule } from '@nestjs/config';
import { MetafiApiClient } from './metafi-api.client';
import { PublicMetafiTestController } from './public.metafi-test.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
      baseURL: process.env.METAFI_API_URL,
      headers: {
        accept: 'application/json',
      },
    }),
    ConfigModule,
  ],
  providers: [MetafiApiClient],
  controllers: [PublicMetafiTestController],
  exports: [MetafiApiClient],
})
export class MetafiApiModule {}
