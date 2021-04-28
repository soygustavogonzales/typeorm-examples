import { Module } from '@nestjs/common';
import { OriginController } from './origin.controller';
import { OriginService } from './service/origin.service';
import { OriginCountry } from '../entities/originCountry.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportFactor } from '../entities/importFactor.entity';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([OriginCountry, ImportFactor]), SharedModule],
  controllers: [OriginController],
  providers: [OriginService]
})
export class OriginModule { }
