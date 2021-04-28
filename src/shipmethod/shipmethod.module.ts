import { Module } from '@nestjs/common';
import { ShipmethodController } from './shipmethod.controller';
import { ShipmethodService } from './service/shipmethod.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shipmethod } from '../entities/shipmethod.entity';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([Shipmethod]), SharedModule],
  controllers: [ShipmethodController],
  providers: [ShipmethodService],
})
export class ShipmethodModule {}
