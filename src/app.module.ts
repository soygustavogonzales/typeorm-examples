import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from 'nestjs-config';
import * as path from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health/health.controller';
import { ExternalServicesModule } from './external-services/external-services.module';
import { JdaskuModule } from './jdasku/jdasku.module';
import { SharedModule } from './shared/shared.module';
import { JwtStrategy } from './shared/jwt/jwt-strategy';
import { ApiKeyStrategy } from './shared/jwt/api-key.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JdaSkuSyncConsumerService } from './jdasku/events/sqs-synchronize-sku-consumer.service';
import { JdaskusyncService } from './jdasku/service/jdaskusync.service';
import { JdaOcModule } from './jdaoc/jdaoc.module';

@Module({
  imports: [
  PassportModule.register({ defaultStrategy: ['headerapikey', 'jwt'] }),
  JwtModule.registerAsync({
    useFactory: (config: ConfigService) => {
      const options = {
        secret: config.get('app').jwt || process.env.JWT_SECRET,
        signOptions: {
          expiresIn: config.get('app').jwt_expiry || process.env.JWT_EXPIRYIN,
        },
      };
      return options;
    },
    inject: [ConfigService],
  }),
  ConfigModule.load(
    path.resolve(__dirname, 'config', '**', '!(*.d).{ts,js}'),
  ),
  TypeOrmModule.forRootAsync({
    useFactory: (config: ConfigService) => {
      const mergedOpts = {
        ...config.get('purchase-db'),
        options: {
          useUTC: true,
        }
      };
      return mergedOpts;
    },
    inject: [ConfigService],
  }),
    ExternalServicesModule,
    JdaskuModule,
    SharedModule,
    JdaOcModule,
  ],
  controllers: [HealthController],
  providers: [JwtStrategy, ApiKeyStrategy, JdaskusyncService, JdaSkuSyncConsumerService],
  exports: [JwtStrategy, ApiKeyStrategy,
    PassportModule]
})
export class AppModule { }
