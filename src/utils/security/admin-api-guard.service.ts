import { ExecutionContext, Injectable } from '@nestjs/common';
import { CanActivate } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AdminApiGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return this.extractAuthDetailsFromApiGatewayHeaders(context);
  }

  private extractAuthDetailsFromApiGatewayHeaders(
    context: ExecutionContext,
  ): boolean {
    const adminApiKey = this.configService.get('ADMIN_API_KEY');
    if (!adminApiKey) {
      throw new Error('No Admin API-KEY defined in environment variables');
    }
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    return apiKey === this.configService.get('ADMIN_API_KEY');
  }
}
