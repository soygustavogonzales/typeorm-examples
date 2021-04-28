import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExitportsService } from './service/exitports.service';
import { ExitportsController } from './exitports.controller';
import { ExitPort } from '../entities/exitPort.entity';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([ExitPort]), SharedModule],
  controllers: [ExitportsController],
  providers: [ExitportsService]
})
export class ExitportsModule {}
