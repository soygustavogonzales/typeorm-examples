import { Module } from '@nestjs/common';
import { PackagingController } from './packaging.controller';
import { PackagingService } from './service/packaging.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Packaging } from '../entities/packaging.entity';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([Packaging]), SharedModule],
  controllers: [PackagingController],
  providers: [PackagingService],
})
export class PackagingModule {}
