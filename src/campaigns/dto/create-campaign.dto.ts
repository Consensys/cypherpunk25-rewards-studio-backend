import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsInt,
  IsDateString,
  IsUrl,
} from 'class-validator';
import { CreateRewardDto } from './create-reward.dto';
import { CreateChallengeDto } from './create-challenge.dto';

export class CreateCampaignDto {
  @ApiProperty({ description: 'Name of the campaign' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the campaign' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'URI of the campaign image' })
  @IsUrl()
  @IsOptional()
  imageUri?: string;

  @ApiPropertyOptional({ description: 'Phosphor chain ID' })
  @IsInt()
  @IsOptional()
  phosphorChainId?: number;

  @ApiPropertyOptional({
    description: 'Start date of the campaign',
    default: 'Current timestamp',
  })
  @IsDateString()
  @IsOptional()
  startsAt?: Date;

  @ApiProperty({ description: 'End date of the campaign' })
  @IsDateString()
  @IsNotEmpty()
  endsAt: Date;

  @ApiPropertyOptional({
    description: 'Campaign rewards',
    isArray: true,
    type: CreateRewardDto,
  })
  rewards?: CreateRewardDto[];

  @ApiPropertyOptional({
    description: 'Campaign challenges',
    isArray: true,
    type: CreateChallengeDto,
  })
  challenges?: CreateChallengeDto[];
}
