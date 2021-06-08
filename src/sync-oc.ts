import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from 'nestjs-config';
import generateTypeormConfigFile from './scripts/generate-typeorm-config-file';
import { JdaOcSyncService } from './jdaoc/service/jdaocsync.service';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'debug', 'error', 'verbose', 'warn']
  });

  const config = app.get(ConfigService);
  generateTypeormConfigFile(config);

  logger.log('.....Start OC sync.....');
  try {
    const jdaOcSyncService = app.get(JdaOcSyncService);
    const jdaOcSyncResponse = await jdaOcSyncService.jdasync();
    logger.log(jdaOcSyncResponse);    
  } catch (error) {
      logger.error('Sync error:', error);
  }
  logger.log('.....End OC sync.....');
  process.exit(0);
}

bootstrap();