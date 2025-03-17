import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  setupGlobalPipes,
  setupSecurityAtFirst,
  setupSwagger,
} from './utils/nest-app-utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  setupSecurityAtFirst(app);
  setupGlobalPipes(app);
  setupSwagger(app, 'Rewards API', 'Enabling Rewards campaigns');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
