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
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { Challenge } from './entities/challenges/challenge.entity';
import { CampaignsService } from './campaigns.service';
import { AdminApiGuard } from '../utils/security/admin-api-guard.service';

@ApiTags('Campaign challenges')
@UseGuards(AdminApiGuard)
@ApiSecurity('apikeyAuth')
@Controller('admin/campaigns')
export class ChallengeController {
  constructor(private readonly campaignService: CampaignsService) {}

  @Post(':campaignId/challenges')
  @ApiOperation({ summary: 'Create a new challenge for a campaign' })
  @ApiBody({ type: CreateChallengeDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The challenge has been successfully created.',
    type: Challenge,
  })
  create(
    @Param('campaignId') campaignId: string,
    @Body() createChallengeDto: CreateChallengeDto,
  ): Promise<Challenge> {
    return this.campaignService.createCampaignChallenge(
      campaignId,
      createChallengeDto,
    );
  }

  @Get(':campaignId/challenges')
  @ApiOperation({ summary: 'Get all challenges' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all challenges.',
    type: [Challenge],
  })
  findAllForcampaign(
    @Param('campaignId') campaignId: string,
  ): Promise<Challenge[]> {
    return this.campaignService.findAllCampaignChallenges(campaignId);
  }

  @Get('challenges/:id')
  @ApiOperation({ summary: 'Get a challenge by id' })
  @ApiParam({ name: 'id', description: 'Challenge ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The found challenge.',
    type: Challenge,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Challenge not found.',
  })
  findOne(@Param('id') id: string): Promise<Challenge> {
    return this.campaignService.findOneChallenge(id);
  }

  @Patch('challenges/:id')
  @ApiOperation({ summary: 'Update a challenge' })
  @ApiParam({ name: 'id', description: 'Challenge ID' })
  @ApiBody({ type: UpdateChallengeDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The challenge has been successfully updated.',
    type: Challenge,
  })
  update(
    @Param('id') id: string,
    @Body() updateChallengeDto: UpdateChallengeDto,
  ): Promise<Challenge> {
    return this.campaignService.updateCampaignChallenge(id, updateChallengeDto);
  }

  @Delete('challenges/:id')
  @ApiOperation({ summary: 'Delete a challenge' })
  @ApiParam({ name: 'id', description: 'Challenge ID' })
  remove(@Param('id') id: string): Promise<void> {
    return this.campaignService.removeCampaignChallenge(id);
  }
}
