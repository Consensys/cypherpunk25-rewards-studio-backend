import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ViemClient } from './viem.client';
import { ViemTestController } from './viem-test.controller';
@Module({
  imports: [ConfigModule],
  providers: [ViemClient],
  controllers: [ViemTestController],
  exports: [ViemClient],
})
export class ViewModule {}
