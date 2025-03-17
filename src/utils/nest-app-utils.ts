import { INestApplication, ValidationPipe } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import helmet from 'helmet';

export function setupSecurityAtFirst(app: INestApplication) {
  // this call must be the first one before any other app.use(...)
  app.use(helmet());
}

export function setupCors(app: INestApplication) {
  app.enableCors();
}
export function setupSwagger(
  app: INestApplication,
  title: string,
  description: string,
) {
  const config = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .addApiKey(
      { type: 'apiKey', in: 'header', name: 'Rewards-Api-Key' },
      'apikeyAuth',
    )
    .build();
  const options: SwaggerDocumentOptions = {
    deepScanRoutes: true,
  };
  const document = SwaggerModule.createDocument(app, config, options);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
}

export function setupGlobalPipes(app: INestApplication) {
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
}
