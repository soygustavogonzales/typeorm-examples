import { Module } from '@nestjs/common';
import { JdaskuController } from './jdasku.controller';
import { JdaskuService } from './service/jdasku.service';
import { ExternalServicesModule } from '../external-services/external-services.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Purchase } from '../entities/purchase.entity';
import { Sku } from '../entities/sku.entity';
import { SkuColor } from '../entities/skuColor.entity';
import { SkuColorSize } from '../entities/skuColorSize.entity';
import { SizeJda } from '../entities/sizeJda.entity';
import { SkuJdaMbr } from '../entities/skuJdaMbr.entity';
import { SharedModule } from '../shared/shared.module';
import { JdaskusyncService } from './service/jdaskusync.service';
import { PurchaseStyle } from '../entities/purchaseStyle.entity';
import { SeasonCommercial } from '../entities/seasonCommercial.entity';
import { SkuErrDictionary } from '../entities/skuErrDictionary.entity';

@Module({
  imports: [ExternalServicesModule, TypeOrmModule.forFeature(
    [Purchase, PurchaseStyle, Sku, SkuColor, SkuColorSize, SizeJda, SkuJdaMbr, SeasonCommercial, SkuErrDictionary]), SharedModule],
  controllers: [JdaskuController],
  providers: [JdaskuService, JdaskusyncService],
  exports: [JdaskusyncService, TypeOrmModule.forFeature(
    [Sku, SkuColor])]
})
export class JdaskuModule { }
