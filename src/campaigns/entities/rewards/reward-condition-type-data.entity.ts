import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RewardConditionTypeData {
  @ApiProperty({ description: 'Name of the reward' })
  name: string;
}
