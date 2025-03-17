import { ExecutionContext, Injectable } from '@nestjs/common';
import { CanActivate } from '@nestjs/common';

@Injectable()
export class PublicApiGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    return true; // accepts all
  }
}
