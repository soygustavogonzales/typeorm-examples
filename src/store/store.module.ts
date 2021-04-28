import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreService } from './service/store.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from '../entities/store.entity';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([Store]), SharedModule],
  controllers: [StoreController],
  providers: [StoreService],
})
export class StoreModule {}
