import { Module } from '@nestjs/common';
import { SegmentController } from './segment.controller';
import { SegmentService } from './service/segment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Segment } from '../entities/segment.entity';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([Segment]), SharedModule],
  controllers: [SegmentController],
  providers: [SegmentService]
})
export class SegmentModule {}
