import { Catch, ArgumentsHost, Logger, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch(HttpException)
export class HttpExceptionsFilter extends BaseExceptionFilter {
  private readonly logger: Logger = new Logger(HttpExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    if (this.shouldReduceLevelToInfo(exception)) {
      this.logger.log(
        `${exception.status ? exception.status + ' | ' : ''}${
          exception.message
        } | ${this.httpAdapterHost?.httpAdapter.getRequestMethod(ctx.getRequest())} ${this.httpAdapterHost?.httpAdapter.getRequestUrl(
          ctx.getRequest(),
        )}`,
      );
    } else {
      this.logger.error(exception.message, exception.stack);
    }
    super.catch(exception, host);
  }

  private shouldReduceLevelToInfo(exception: any) {
    return exception.message && exception.status < 500;
  }
}
