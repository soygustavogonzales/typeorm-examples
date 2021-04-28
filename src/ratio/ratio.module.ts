import { Module } from '@nestjs/common';
import { RatioController } from './ratio.controller';
import { RatioService } from './service/ratio.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ratio } from '../entities/ratio.entity';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ratio]), SharedModule],
  controllers: [RatioController],
  providers: [RatioService],
})
export class RatioModule {}
