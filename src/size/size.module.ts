import { Module } from '@nestjs/common';
import { SizeController } from './size.controller';
import { SizeService } from './service/size.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Size } from '../entities/size.entity';
import { RatioService } from '../ratio/service/ratio.service';
import { Ratio } from '../entities/ratio.entity';
import { SizeJda } from '../entities/sizeJda.entity';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([Size, Ratio, SizeJda]), SharedModule],
  controllers: [SizeController],
  providers: [SizeService, RatioService],
})
export class SizeModule { }
