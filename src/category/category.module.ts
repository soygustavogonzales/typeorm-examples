import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './service/category.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../entities/category.entity';
import { PurchaseStyleDetails } from '../entities/purchaseStyleDetails.entity';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([Category, PurchaseStyleDetails]), SharedModule],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
