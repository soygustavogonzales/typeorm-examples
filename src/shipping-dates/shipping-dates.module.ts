import { Module } from '@nestjs/common';
import { ShippingDatesController } from './shipping-dates.controller';
import { ShippingDatesService } from './service/shipping-dates.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingDates } from '../entities/shippingDates.entity';
import { OriginCountry } from '../entities/originCountry.entity';
import { SeasonCommercial } from '../entities/seasonCommercial.entity';
import { ShippingDatesChild } from '../entities/shippingDatesChild.entity';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([ShippingDates, OriginCountry, SeasonCommercial, ShippingDatesChild]), SharedModule],
  controllers: [ShippingDatesController],
  providers: [ShippingDatesService],
})
export class ShippingDatesModule {}
