import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MultiLangText } from '../entities/multilang-text';

export class PublicBannerDto {
  @ApiProperty({ description: 'Unique identifier of the banner' })
  id: string;

  @ApiProperty({
    description: 'Title of the banner in multiple languages',
    isArray: true,
    type: MultiLangText,
  })
  title: MultiLangText[];

  @ApiPropertyOptional({
    description: 'Subtitle of the banner in multiple languages',
    isArray: true,
    type: MultiLangText,
  })
  subtitle?: MultiLangText[];

  @ApiPropertyOptional({ description: 'URI of the banner image' })
  imageUri?: string;

  @ApiProperty({ description: 'URI of the link destination' })
  linkUri: string;

  @ApiProperty({ description: 'Start date of the banner display' })
  startsAt: Date;

  @ApiProperty({ description: 'End date of the banner display' })
  endsAt: Date;
}
