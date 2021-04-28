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
import { SizeModule } from './size/size.module';
import { StoreModule } from './store/store.module';
import { ProviderModule } from './provider/provider.module';
import { OriginModule } from './origin/origin.module';
import { PurchaseModule } from './purchase/purchase.module';
import { SeasonStickerModule } from './season-sticker/season-sticker.module';
import { PackagingModule } from './packaging/packaging.module';
import { CategoryModule } from './category/category.module';
import { PurchaseStyleModule } from './purchase-style/purchase-style.module';
import { RseModule } from './rse/rse.module';
import { SegmentModule } from './segment/segment.module';
import { ShipmethodModule } from './shipmethod/shipmethod.module';
import { RatioModule } from './ratio/ratio.module';
import { DesignerModule } from './designer/designer.module';
import { StatusModule } from './status/status.module';
import { ShippingDatesModule } from './shipping-dates/shipping-dates.module';
import { MaintainerModule } from './maintainer/maintainer.module';
import { CsoModule } from './cso/cso.module';
import { ExitportsModule } from './exitports/exitports.module';
import { ReportModule } from './report/report.module';
import { PaymentTermsModule } from './payment-terms/payment-terms.module';
import { NewReportModule } from './report/new-report.module';

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
    StoreModule,
    ProviderModule,
    OriginModule,
    PurchaseModule,
    SeasonStickerModule,
    PackagingModule,
    SizeModule,
    CategoryModule,
    PurchaseStyleModule,
    RseModule,
    SegmentModule,
    ShipmethodModule,
    RatioModule,
    DesignerModule,
    StatusModule,
    ShippingDatesModule,
    ExternalServicesModule,
    MaintainerModule,
    CsoModule,
    ExitportsModule,
    ReportModule,
    JdaskuModule,
    SharedModule,
    PaymentTermsModule,
    JdaOcModule,
    NewReportModule,
  ],
  controllers: [HealthController],
  providers: [JwtStrategy, ApiKeyStrategy, JdaskusyncService, JdaSkuSyncConsumerService],
  exports: [JwtStrategy, ApiKeyStrategy,
    PassportModule]
})
export class AppModule { }
