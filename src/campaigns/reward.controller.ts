import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiSecurity,
} from '@nestjs/swagger';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { Reward } from './entities/rewards/reward.entity';
import { CampaignsService } from './campaigns.service';
import { AdminApiGuard } from '../utils/security/admin-api-guard.service';

@ApiTags('Campaign rewards')
@UseGuards(AdminApiGuard)
@ApiSecurity('apikeyAuth')
@Controller('admin/campaigns')
export class RewardController {
  constructor(private readonly campaignService: CampaignsService) {}

  @Post(':campaignId/rewards')
  @ApiOperation({ summary: 'Create a new reward for a campaign' })
  @ApiBody({ type: CreateRewardDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The reward has been successfully created.',
    type: Reward,
  })
  create(
    @Param('campaignId') campaignId: string,
    @Body() createRewardDto: CreateRewardDto,
  ): Promise<Reward> {
    return this.campaignService.createCampaignReward(
      campaignId,
      createRewardDto,
    );
  }

  @Get(':campaignId/rewards')
  @ApiOperation({ summary: 'Get all rewards for a campaign' })
  @ApiParam({ name: 'campaignId', description: 'Campaign ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all rewards for the campaign.',
    type: [Reward],
  })
  findAllForCampaign(
    @Param('campaignId') campaignId: string,
  ): Promise<Reward[]> {
    return this.campaignService.findAllCampaignRewards(campaignId);
  }

  @Get('rewards/:id')
  @ApiOperation({ summary: 'Get a reward by id' })
  @ApiParam({ name: 'id', description: 'Reward ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The found reward.',
    type: Reward,
  })
  findOne(@Param('id') id: string): Promise<Reward> {
    return this.campaignService.findOneReward(id);
  }

  @Patch('rewards/:id')
  @ApiOperation({ summary: 'Update a reward' })
  @ApiParam({ name: 'id', description: 'Reward ID' })
  @ApiBody({ type: UpdateRewardDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The reward has been successfully updated.',
    type: Reward,
  })
  update(
    @Param('id') id: string,
    @Body() updateRewardDto: UpdateRewardDto,
  ): Promise<Reward> {
    return this.campaignService.updateCampaignReward(id, updateRewardDto);
  }

  @Delete('rewards/:id')
  @ApiOperation({ summary: 'Delete a reward' })
  @ApiParam({ name: 'id', description: 'Reward ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The reward has been successfully deleted.',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.campaignService.removeCampaignReward(id);
  }
}
