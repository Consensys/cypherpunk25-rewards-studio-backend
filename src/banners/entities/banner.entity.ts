import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MultiLangText } from './multilang-text';

export class Banner {
  @ApiProperty({ description: 'Unique identifier of the banner' })
  id: string; // ex: 'fund', 'swap', 'mm-campaign-123'

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

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Last update timestamp' })
  lastUpdatedAt?: Date;
}
