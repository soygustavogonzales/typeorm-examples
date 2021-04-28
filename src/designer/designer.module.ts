import { Module } from '@nestjs/common';
import { DesignerController } from './designer.controller';
import { DesignerService } from './service/designer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Designer } from '../entities/designer.entity';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([Designer]), SharedModule],
  controllers: [DesignerController],
  providers: [DesignerService],
})
export class DesignerModule {}
