import 'dotenv/config';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { AppModule } from './app.module.js';

const getSwaggerUiPath = () =>
  import.meta.env.PROD
    ? join(import.meta.dirname, 'swagger-ui-dist')
    : fileURLToPath(
        new URL('.', import.meta.resolve('swagger-ui-dist/package.json')),
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
