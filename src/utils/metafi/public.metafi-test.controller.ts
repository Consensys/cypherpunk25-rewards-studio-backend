import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MetafiApiClient } from './metafi-api.client';
import { PublicApiGuard } from '../security/public-api-guard.service';

@ApiTags('Metafi [Public]')
@UseGuards(PublicApiGuard)
@Controller('metafi')
export class PublicMetafiTestController {
  constructor(private readonly metafiApiClient: MetafiApiClient) {}

  @Get('test')
  async test(): Promise<any> {
    return this.metafiApiClient.getMostRecentTransactionAgainstSpecificAddress(
      '0x30083f56A555f7E61C2b352c7D4684243CfeaB37',
      '0x38141b47131a5ddcc0af2520116a876833169585',
      59144,
    );
  }
}
