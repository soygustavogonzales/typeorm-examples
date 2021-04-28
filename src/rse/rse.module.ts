import { Module } from '@nestjs/common';
import { RseController } from './rse.controller';
import { RseService } from './service/rse.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rse } from '../entities/rse.entity';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([Rse]), SharedModule],
  controllers: [RseController],
  providers: [RseService]
})
export class RseModule {}
