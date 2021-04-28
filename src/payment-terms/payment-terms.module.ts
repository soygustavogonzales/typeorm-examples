import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentTermsService } from './service/payment-terms/payment-terms.service';
import { PaymentTermsController } from './payment-terms.controller';
import { PaymentTerms } from '../entities/paymentTerms.entity';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentTerms]), SharedModule],
  controllers: [PaymentTermsController],
  providers: [PaymentTermsService],
})
export class PaymentTermsModule {}

