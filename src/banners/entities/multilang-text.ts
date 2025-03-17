import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class MultiLangText {
  @ApiProperty({ description: 'Language ISO code' })
  @IsString()
  @IsNotEmpty()
  language: string;

  @ApiProperty({ description: 'Text translated in the language' })
  @IsString()
  @IsNotEmpty()
  text: string;
}
