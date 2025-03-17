import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import 'dotenv/config';
import { ConfigModule } from '@nestjs/config';
import { PhosphorPublicApiClient } from './phosphor-public-api.client';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
      baseURL: process.env.PHOSPHOR_PUBLIC_API_URL,
      headers: {
        accept: 'application/json',
      },
    }),
    ConfigModule,
  ],
  providers: [PhosphorPublicApiClient],
  controllers: [],
  exports: [PhosphorPublicApiClient],
})
export class PhosphorPublicApiModule {}
