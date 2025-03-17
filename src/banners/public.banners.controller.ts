import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BannersService } from './banners.service';
import { PublicBannerDto } from './dto/public-banner.dto';
import { Banner } from './entities/banner.entity';
import { ApiTags } from '@nestjs/swagger';
import { PublicApiGuard } from '../utils/security/public-api-guard.service';

@ApiTags('Banners [Public]')
@UseGuards(PublicApiGuard)
@Controller('banners')
export class PublicBannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  async findAll(): Promise<PublicBannerDto[]> {
    const banners = await this.bannersService.findAllActive();
    return banners.map(this.toPublicDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PublicBannerDto> {
    const banner = await this.bannersService.findOne(id);
    return this.toPublicDto(banner);
  }

  toPublicDto(banner: Banner): PublicBannerDto {
    return {
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle,
      imageUri: banner.imageUri,
      linkUri: banner.linkUri,
      startsAt: banner.startsAt,
      endsAt: banner.endsAt,
    };
  }
}
