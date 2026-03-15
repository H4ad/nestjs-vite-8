import 'dotenv/config';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { AppModule } from './app.module.js';

const getSwaggerUiPath = () =>
  import.meta.env.PROD
    ? join(dirname(fileURLToPath(import.meta.url)), 'swagger-ui-dist')
    : dirname(
        createRequire(import.meta.url).resolve('swagger-ui-dist/package.json'),
      );

const createApp = async () => {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, cleanupOpenApiDoc(document), {
    customSwaggerUiPath: getSwaggerUiPath(),
  });
  return app;
};

if (import.meta.env.PROD) {
  createApp().then((app) => app.listen(3000));
}

export const viteNodeApp = createApp();
