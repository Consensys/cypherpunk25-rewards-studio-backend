import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { Banner } from './entities/banner.entity';
import { PrismaService } from '../utils/prisma/prisma.service';
import { Prisma, Banner as PrismaBanner } from '@prisma/client';
import { MultiLangText } from './entities/multilang-text';

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBannerDto: CreateBannerDto): Promise<Banner> {
    const { title, subtitle, linkUri, imageUri, startsAt, endsAt, id } =
      createBannerDto;
    const banner = await this.prisma.banner.create({
      data: {
        id,
        title: title as any as Prisma.JsonObject, // Prisma expects Json type
        subtitle: subtitle as any as Prisma.JsonObject, // Prisma expects Json type
        link_uri: linkUri,
        starts_at: startsAt,
        ends_at: endsAt,
        image_uri: imageUri,
      },
    });
    return this.mapPrismaToEntity(banner);
  }

  async findAll(): Promise<Banner[]> {
    const banners = await this.prisma.banner.findMany({
      orderBy: {
        created_at: 'desc',
      },
    });
    return this.mapPrismaToEntities(banners);
  }

  async findOne(id: string): Promise<Banner> {
    const banner = await this.prisma.banner.findUnique({
      where: { id },
    });
    if (!banner) {
      throw new NotFoundException('Banner not found');
    }
    return this.mapPrismaToEntity(banner);
  }

  async update(id: string, updateBannerDto: UpdateBannerDto): Promise<Banner> {
    const { title, subtitle, linkUri, imageUri, startsAt, endsAt } =
      updateBannerDto;
    const banner = await this.prisma.banner.update({
      where: { id },
      data: {
        // Only update if provided
        ...(linkUri && { link_uri: linkUri }),
        ...(imageUri && { image_uri: imageUri }),
        ...(startsAt && { starts_at: startsAt }),
        ...(endsAt && { ends_at: endsAt }),
        ...(title && { title: title as any as Prisma.JsonObject }),
        ...(subtitle && { subtitle: subtitle as any as Prisma.JsonObject }),
      },
    });
    return this.mapPrismaToEntity(banner);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.banner.delete({
      where: { id },
    });
  }

  async findAllActive(): Promise<Banner[]> {
    const now = new Date();
    const banners = await this.prisma.banner.findMany({
      where: {
        AND: [{ starts_at: { lte: now } }, { ends_at: { gt: now } }],
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    return this.mapPrismaToEntities(banners);
  }

  private mapPrismaToEntity(banner: PrismaBanner): Banner {
    return {
      id: banner.id,
      title: banner.title?.valueOf() as MultiLangText[],
      subtitle: banner.subtitle?.valueOf() as MultiLangText[],
      linkUri: banner.link_uri,
      imageUri: banner.image_uri ?? undefined,
      startsAt: banner.starts_at,
      endsAt: banner.ends_at,
      createdAt: banner.created_at,
      lastUpdatedAt: banner.last_updated_at ?? undefined,
    };
  }

  private mapPrismaToEntities(banners: PrismaBanner[]): Banner[] {
    return banners.map(this.mapPrismaToEntity);
  }
}
