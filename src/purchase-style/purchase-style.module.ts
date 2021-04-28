import { Module } from '@nestjs/common';
import { PurchaseStyleController } from './purchase-style.controller';
import { PurchaseStyleService } from './services/purchase-style.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseStyleDetails } from '../entities/purchaseStyleDetails.entity';
import { Provider } from '../entities/provider.entity';
import { PurchaseStyle } from '../entities/purchaseStyle.entity';
import { ExternalServicesModule } from '../external-services/external-services.module';
import { PurchaseStyleColor } from '../entities/purchaseStyleColor.entity';
import { PurchaseStyleColorShipping } from '../entities/purchaseStyleColorShipping.entity';
import { DollarService } from '../maintainer/dollar/service/dollar.service';
import { ImportFactorService } from '../maintainer/import-factor/service/import-factor.service';
import { DollarChange } from '../entities/dollarChange.entity';
import { ImportFactor } from '../entities/importFactor.entity';
import { SharedModule } from '../shared/shared.module';
import { PurchaseStyleNegotiation } from '../entities/purchaseStyleNegotiation.entity';
import { JdaskuService } from '../jdasku/service/jdasku.service';
import { JdaskuModule } from '../jdasku/jdasku.module';
import { ExitPort } from '../entities/exitPort.entity';
import { StatusPurchaseColor } from '../entities/statusPurchaseColor.entity';
import { ShippingDatesChild } from '../entities/shippingDatesChild.entity';

@Module({
  imports: [ExternalServicesModule, TypeOrmModule.forFeature([PurchaseStyle, PurchaseStyleNegotiation, PurchaseStyleColor, PurchaseStyleColorShipping, PurchaseStyleDetails, ShippingDatesChild, ImportFactor, DollarChange, ExitPort, Provider, StatusPurchaseColor]), SharedModule, JdaskuModule],
  controllers: [PurchaseStyleController],
  providers: [PurchaseStyleService, ImportFactorService, DollarService, JdaskuService],
})
export class PurchaseStyleModule { }
