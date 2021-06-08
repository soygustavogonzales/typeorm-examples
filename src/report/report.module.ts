import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ReportController } from './report.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SSEMiddleware } from 'nestjs-sse';
import { ExternalServicesModule } from '../external-services/external-services.module';
import { SharedModule } from '../shared/shared.module';
import { JdaskuModule } from '../jdasku/jdasku.module';
import { PurchaseModule } from '../purchase/purchase.module';

import { ReportService } from './service/report.service';
import { PurchaseStyleService } from '../purchase-style/services/purchase-style.service';
import { DollarService } from '../maintainer/dollar/service/dollar.service';
import { JdaskuService } from '../jdasku/service/jdasku.service';
import { PaymentTermsService } from '../payment-terms/service/payment-terms/payment-terms.service';
import { ProviderService } from '../provider/service/provider.service';

import { PurchaseStyle } from '../entities/purchaseStyle.entity';
import { PurchaseStyleColor } from '../entities/purchaseStyleColor.entity';
import { PurchaseStyleColorShipping } from '../entities/purchaseStyleColorShipping.entity';
import { PurchaseStyleDetails } from '../entities/purchaseStyleDetails.entity';
import { DollarChange } from '../entities/dollarChange.entity';
import { ImportFactor } from '../entities/importFactor.entity';
import { RequestReport } from '../entities/requestReport.entity';
import { PurchaseStyleNegotiation } from '../entities/purchaseStyleNegotiation.entity';
import { PaymentTerms } from '../entities/paymentTerms.entity';
import { Provider } from '../entities/provider.entity';
import { ExitPort } from '../entities/exitPort.entity';
import { ImportFactorService } from '../maintainer/import-factor/service/import-factor.service';
import { StatusPurchaseColor } from '../entities/statusPurchaseColor.entity';
import { ShippingDatesChild } from '../entities/shippingDatesChild.entity';
import { StoreService } from '../store/service/store.service';
import { Store } from '../entities/store.entity';
import { PurchaseStore } from '../entities/purchaseStore.entity';
import { Sku } from '../entities/sku.entity';
import { OcJda } from '../entities/ocJda.entity';
import { Category } from '../entities/category.entity';
import { SustainableFeature } from '../entities/sustainableFeature.entity';
import { SeasonSticker } from '../entities/seasonSticker.entity';
import { Shipmethod } from '../entities/shipmethod.entity';
import { Segment } from '../entities/segment.entity';
import { OriginCountry } from '../entities/originCountry.entity';
import { Packaging } from '../entities/packaging.entity';
import { Size } from '../entities/size.entity';
import { Ratio } from '../entities/ratio.entity';
import { Rse } from '../entities/rse.entity';
import { Cso } from '../entities/cso.entity';


@Module({
  imports: [ExternalServicesModule, PurchaseModule, TypeOrmModule.forFeature(
    [
      PurchaseStyle, PurchaseStyleNegotiation, PurchaseStyleColor, PurchaseStyleColorShipping,
      PurchaseStyleDetails, ImportFactor, DollarChange, RequestReport, PaymentTerms, Provider, ExitPort,
      StatusPurchaseColor, ShippingDatesChild, Store, PurchaseStore, Sku, OcJda, Category, SustainableFeature,
      SeasonSticker, Shipmethod, Segment, OriginCountry, Packaging, Size, Ratio, Rse, Cso,
    ]), SharedModule, JdaskuModule],
  providers: [
    ReportService, PurchaseStyleService, PaymentTermsService, DollarService, JdaskuService, ProviderService,
    ImportFactorService, StoreService,
  ],
  controllers: [ReportController],
})
export class ReportModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SSEMiddleware)
      .forRoutes(ReportController);
  }
}
