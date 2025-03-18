import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsDateString,
  IsUrl,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { ChallengeTypeData } from '../entities/challenges/challenge-type-data.entity';
import { Type } from 'class-transformer';
import { ChallengeType } from '../entities/challenges/challenge.entity';
export class CreateChallengeDto {
  @ApiProperty({ description: 'Name of the challenge' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'URI of the challenge image' })
  @IsUrl()
  @IsOptional()
  imageUri?: string;

  @ApiProperty({ description: 'Operator for the challenge' })
  @IsString()
  @IsNotEmpty()
  operator: string;

  @ApiProperty({ description: 'Type of the challenge' })
  @IsString()
  @IsNotEmpty()
  @IsEnum(ChallengeType)
  type: ChallengeType;

  @ApiPropertyOptional({ description: 'Points awarded for the challenge' })
  @IsInt()
  @IsOptional()
  points?: number;

  @ApiProperty({
    description: 'Additional data specific to the challenge type',
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ChallengeTypeData)
  typeData: ChallengeTypeData;

  @ApiPropertyOptional({
    description: 'Start date of the challenge',
    default: 'Current timestamp',
  })
  @IsDateString()
  @IsOptional()
  startsAt?: Date;

  @ApiPropertyOptional({ description: 'End date of the challenge' })
  @IsDateString()
  @IsOptional()
  endsAt?: Date;
}
