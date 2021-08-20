import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseStyle } from '../entities/purchaseStyle.entity';
import { ExternalServicesModule } from '../external-services/external-services.module';
import { SharedModule } from '../shared/shared.module';
import { ComexController } from './comex.controller';
import { ComexService } from './service/comex.service';


@Module({
    imports: [ExternalServicesModule, TypeOrmModule.forFeature([PurchaseStyle
    ]), SharedModule],
    controllers: [ComexController],
    providers: [ComexService]
  })
export class ComexModule {}
