import { Module } from '@nestjs/common';
import { CsoController } from './cso.controller';
import { CsoService } from './service/cso.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cso } from '../entities/cso.entity';
import { PurchaseStyleDetails } from '../entities/purchaseStyleDetails.entity';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cso, PurchaseStyleDetails]), SharedModule],
  controllers: [CsoController],
  providers: [CsoService]
})
export class CsoModule {}
