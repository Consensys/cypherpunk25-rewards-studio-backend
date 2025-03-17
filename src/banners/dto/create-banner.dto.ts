import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsDateString,
  IsArray,
} from 'class-validator';
import { MultiLangText } from '../entities/multilang-text';

export class CreateBannerDto {
  @ApiProperty({ description: 'Unique identifier of the banner' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Title of the banner in multiple languages',
    type: MultiLangText,
    isArray: true,
  })
  @IsArray()
  @IsNotEmpty()
  title: MultiLangText[];

  @ApiPropertyOptional({
    description: 'Subtitle of the banner in multiple languages',
    type: MultiLangText,
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  subtitle?: MultiLangText[];

  @ApiPropertyOptional({ description: 'URI of the banner image' })
  @IsUrl()
  @IsOptional()
  imageUri?: string;

  @ApiProperty({ description: 'URI of the link destination' })
  @IsUrl()
  @IsNotEmpty()
  linkUri: string;

  @ApiPropertyOptional({
    description: 'Start date of the banner display',
    default: 'Current timestamp',
  })
  @IsDateString()
  @IsOptional()
  startsAt?: Date;

  @ApiProperty({ description: 'End date of the banner display' })
  @IsDateString()
  @IsNotEmpty()
  endsAt: Date;
}
