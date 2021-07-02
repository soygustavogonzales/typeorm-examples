import { Module } from '@nestjs/common';
import { JdaocController } from './jdaoc.controller';
import { ExternalServicesModule } from '../external-services/external-services.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Purchase } from '../entities/purchase.entity';
import { OcJda } from '../entities/ocJda.entity';
import { SharedModule } from '../shared/shared.module';
import { JdaOcSyncService } from './service/jdaocsync.service';
import { JdaOcService } from './service/jdaoc.service';
import { Provider } from '../entities/provider.entity';
import { OcJdaMbr } from '../entities/ocJdaMbr.entity';

@Module({
  imports: [ExternalServicesModule, TypeOrmModule.forFeature([Purchase, OcJda, Provider, OcJdaMbr
  ]), SharedModule],
  controllers: [JdaocController],
  providers: [JdaOcSyncService, JdaOcService],
  exports: [JdaOcSyncService, JdaOcService,
    TypeOrmModule.forFeature([OcJda])]
})
export class JdaOcModule { }
