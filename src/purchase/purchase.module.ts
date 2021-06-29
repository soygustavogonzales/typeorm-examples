import { Module } from '@nestjs/common';
import { PurchaseController } from './purchase.controller';
import { PurchaseService } from './service/purchase.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusService } from '../status/service/status.service';
import { StoreService } from '../store/service/store.service';
import { ExternalServicesModule } from '../external-services/external-services.module';
import { PurchaseStyleService } from '../purchase-style/services/purchase-style.service';
import { ImportFactorService } from '../maintainer/import-factor/service/import-factor.service';
import { DollarService } from '../maintainer/dollar/service/dollar.service';
import { SharedModule } from '../shared/shared.module';
import { JdaskuModule } from '../jdasku/jdasku.module';
import { JdaskuService } from '../jdasku/service/jdasku.service';
import { ProviderService } from '../provider/service/provider.service';
import { SizeService } from '../size/service/size.service';
import { ShipmethodService } from '../shipmethod/service/shipmethod.service';
import { PackagingService } from '../packaging/service/packaging.service';
import { SeasonStickerService } from '../season-sticker/service/season-sticker.service';
import { RseService } from '../rse/service/rse.service';
import { CsoService } from '../cso/service/cso.service';
import { CategoryService } from '../category/service/category.service';
import { ExitportsService } from '../exitports/service/exitports.service';
import { DesignerService } from '../designer/service/designer.service';
import { RatioService } from '../ratio/service/ratio.service';
import { OriginService } from '../origin/service/origin.service';
import { SegmentService } from '../segment/service/segment.service';

import { Purchase } from '../entities/purchase.entity';
import { SeasonCommercial } from '../entities/seasonCommercial.entity';
import { Status } from '../entities/status.entity';
import { Store } from '../entities/store.entity';
import { PurchaseStore } from '../entities/purchaseStore.entity';
import { PurchaseStyle } from '../entities/purchaseStyle.entity';
import { PurchaseStyleColor } from '../entities/purchaseStyleColor.entity';
import { ShippingDates } from '../entities/shippingDates.entity';
import { PurchaseStyleColorShipping } from '../entities/purchaseStyleColorShipping.entity';
import { PurchaseStyleDetails } from '../entities/purchaseStyleDetails.entity';
import { DollarChange } from '../entities/dollarChange.entity';
import { ImportFactor } from '../entities/importFactor.entity';
import { PurchaseStyleNegotiation } from '../entities/purchaseStyleNegotiation.entity';
import { ShippingDatesChild } from '../entities/shippingDatesChild.entity';
import { Provider } from '../entities/provider.entity';
import { OriginCountry } from '../entities/originCountry.entity';
import { Size } from '../entities/size.entity';
import { Shipmethod } from '../entities/shipmethod.entity';
import { Packaging } from '../entities/packaging.entity';
import { SeasonSticker } from '../entities/seasonSticker.entity';
import { Rse } from '../entities/rse.entity';
import { Cso } from '../entities/cso.entity';
import { Category } from '../entities/category.entity';
import { ExitPort } from '../entities/exitPort.entity';
import { Designer } from '../entities/designer.entity';
import { Ratio } from '../entities/ratio.entity';
import { Segment } from '../entities/segment.entity';
import { StatusPurchaseColor } from '../entities/statusPurchaseColor.entity';
import { OcJda } from '../entities/ocJda.entity';
import { Sku } from '../entities/sku.entity';
import { SustainableFeature } from '../entities/sustainableFeature.entity';
import { Certifications } from '../entities/certifications.entity';
import { Exhibition } from '../entities/exhibition.entity';
@Module({
  imports: [ExternalServicesModule, TypeOrmModule.forFeature(
    [
      Purchase, SeasonCommercial, Status, Store, PurchaseStore,
      PurchaseStyle, PurchaseStyleNegotiation, PurchaseStyleColor, ShippingDates, ShippingDatesChild,
      PurchaseStyleColorShipping, PurchaseStyleDetails, Provider, ImportFactor, DollarChange,
      OriginCountry, Size, Shipmethod, Packaging, SeasonSticker, Rse, Cso, Category, ExitPort,
      Designer, Ratio, Segment, StatusPurchaseColor, OcJda, Sku, SustainableFeature, Certifications, Exhibition,
    ]), SharedModule, JdaskuModule],
  controllers: [PurchaseController],
  providers: [PurchaseService, StatusService, StoreService, PurchaseStyleService,
    ProviderService, ImportFactorService, DollarService, JdaskuService, SizeService,
    ShipmethodService, PackagingService, SeasonStickerService, RseService, CsoService,
    CategoryService, ExitportsService, DesignerService, RatioService, OriginService, SegmentService],
  exports: [
    PurchaseService,
  ],
})
export class PurchaseModule {

}
