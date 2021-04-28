import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from 'nestjs-config';
import * as bodyParser from 'body-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import generateTypeormConfigFile from './scripts/generate-typeorm-config-file';
const newrelic = require('newrelic');

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'debug', 'error', 'verbose', 'warn']
  });
  const config = app.get(ConfigService);

  const port = app.get(ConfigService).get('app.port') || process.env.APP_SERVER_PORT;
  const nodeEnv = app.get(ConfigService).get('app.node_env') || process.env.NODE_ENV;
  const apiVersion = app.get(ConfigService).get('app.version') || process.env.APP_VERSION;
  const appName = app.get(ConfigService).get('app.name') || 'Sync Service';
  const corsAllowed = app.get(ConfigService).get('app.cors_allowed') || process.env.CORS_ALLOWED_DOMAIN;
  const basePath = nodeEnv !== 'development' ? 'ecom/sync/api/' : 'api/';
  app.use(bodyParser.json({ limit: '50mb' }));
  generateTypeormConfigFile(config);

  app.setGlobalPrefix(`${basePath}${apiVersion}`);
  const apiName = appName;
  const descText = appName;
  const options = new DocumentBuilder()
    .setTitle(apiName)
    .setDescription(descText)
    .addApiKey({ type: 'apiKey', in: 'header', name: 'api-key' })
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);

  app.enableCors({
    origin: corsAllowed,
  });

  if (nodeEnv !== 'development') {
    SwaggerModule.setup(`ecom/sync/api/${apiVersion}/api-docs`, app, document,
      {
        swaggerOptions: {
          displayRequestDuration: true,
        },
      });
  } else {
    SwaggerModule.setup(`api/${apiVersion}/api-docs`, app, document, { swaggerOptions: { displayRequestDuration: true } });
  }

  await app.listen(port);
  logger.log(`Aplication listening on port ${port}`);
}

bootstrap();
