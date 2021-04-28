import { Module } from '@nestjs/common';
import { DollarController } from './dollar/dollar.controller';
import { ImportFactorController } from './import-factor/import-factor.controller';
import { ImportFactorService } from './import-factor/service/import-factor.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DollarChange } from '../entities/dollarChange.entity';
import { DollarService } from './dollar/service/dollar.service';
import { ImportFactor } from '../entities/importFactor.entity';
import { ExternalServicesModule } from '../external-services/external-services.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [ExternalServicesModule, TypeOrmModule.forFeature([DollarChange, ImportFactor]), SharedModule],
  controllers: [DollarController, ImportFactorController],
  providers: [DollarService, ImportFactorService],
})
export class MaintainerModule {}
