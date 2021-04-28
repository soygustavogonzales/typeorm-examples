import { Module } from '@nestjs/common';
import { JdaocController } from './jdaoc.controller';
import { ExternalServicesModule } from '../external-services/external-services.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Purchase } from '../entities/purchase.entity';
import { OcJda } from '../entities/ocJda.entity';
import { SharedModule } from '../shared/shared.module';
import { JdaOcSyncService } from './service/jdaocsync.service';

@Module({
  imports: [ExternalServicesModule, TypeOrmModule.forFeature(
    [Purchase, OcJda]), SharedModule],
  controllers: [JdaocController],
  providers: [JdaOcSyncService],
  exports: [JdaOcSyncService, TypeOrmModule.forFeature(
    [OcJda])]
})
export class JdaOcModule { }
