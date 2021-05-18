import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { NewReportController } from './new-report.controller';
import { StatusPurchaseColor } from '../entities/statusPurchaseColor.entity';
import { ShippingDatesChild } from '../entities/shippingDatesChild.entity';
import { StoreService } from '../store/service/store.service';
import { Store } from '../entities/store.entity';

@Module({
  imports: [ExternalServicesModule, PurchaseModule, TypeOrmModule.forFeature(
    [
      PurchaseStyle, PurchaseStyleNegotiation, PurchaseStyleColor, PurchaseStyleColorShipping,
      PurchaseStyleDetails, ImportFactor, DollarChange, RequestReport, PaymentTerms, Provider, ExitPort,
      StatusPurchaseColor, ShippingDatesChild, Store,
    ]), SharedModule, JdaskuModule],
  providers: [
    ReportService, PurchaseStyleService, PaymentTermsService, DollarService, JdaskuService, ProviderService,
    ImportFactorService, StoreService,
  ],
  controllers: [NewReportController],
})
export class NewReportModule { }
