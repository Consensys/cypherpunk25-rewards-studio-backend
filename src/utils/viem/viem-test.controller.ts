import {
  Controller,
  Get,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ViemClient } from './viem.client';
import { AdminApiGuard } from '../security/admin-api-guard.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('[Test] Web test queries')
@UseGuards(AdminApiGuard)
@Controller('viem-test')
export class ViemTestController {
  constructor(private readonly viemClient: ViemClient) {}

  @Get('block')
  async getBlock(@Query('blockNumber', ParseIntPipe) blockNumber: number) {
    const block = await this.viemClient.getBlock(59144, BigInt(blockNumber));
    console.log(block);
  }


  @Get('logs')
  async getLogs() {
    const block = await this.viemClient.getErc20Logs(
      59144,
      '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
      '0x05B9c336A5DA2B7452E1861496a3a3Caa1Caa873',
      '0xf344192b9146132fC0e997D1666dC1531Bf8F7Cd',
    );
    console.log(block);
  }
}
