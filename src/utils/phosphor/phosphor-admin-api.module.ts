import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import 'dotenv/config';
import { PhosphorAdminApiClient } from './phosphor-admin-api.client';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
      baseURL: process.env.PHOSPHOR_ADMIN_API_URL,
      headers: {
        accept: 'application/json',
      },
    }),
    ConfigModule,
  ],
  providers: [PhosphorAdminApiClient],
  controllers: [],
  exports: [PhosphorAdminApiClient],
})
export class PhosphorAdminApiModule {}
