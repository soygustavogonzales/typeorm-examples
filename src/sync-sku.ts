import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from 'nestjs-config';
import generateTypeormConfigFile from './scripts/generate-typeorm-config-file';
import { JdaskusyncService } from './jdasku/service/jdaskusync.service';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'debug', 'error', 'verbose', 'warn']
  });

  const config = app.get(ConfigService);
  generateTypeormConfigFile(config);
  
  logger.log('.....Start SKU sync.....');
  try {    
    const jdaSkuSyncService = app.get(JdaskusyncService);
    const jdaSkuSyncResponse = await jdaSkuSyncService.jdasync();
    logger.log(jdaSkuSyncResponse);    
  } catch (error) {
      logger.error('Sync error:', error);
  }
  logger.log('.....End SKU sync.....');
  process.exit(0);
}

bootstrap();