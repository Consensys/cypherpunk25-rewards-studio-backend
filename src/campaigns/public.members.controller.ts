import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { ApiTags } from '@nestjs/swagger';
import { PublicApiGuard } from '../utils/security/public-api-guard.service';

@ApiTags('Members [Public]')
@UseGuards(PublicApiGuard)
@Controller('members')
export class PublicMembersController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get(':address/loyalty-score')
  async getMemberLoyaltyScore(
    @Param('address') address: string,
  ): Promise<{ address: string; loyaltyScore: number }> {
    const loyaltyScore =
      await this.campaignsService.getMemberLoyaltyScore(address);
    return {
      address,
      loyaltyScore,
    };
  }
}
