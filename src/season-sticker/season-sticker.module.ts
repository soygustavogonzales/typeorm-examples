import { Module } from '@nestjs/common';
import { SeasonStickerController } from './season-sticker.controller';
import { SeasonStickerService } from './service/season-sticker.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeasonSticker } from '../entities/seasonSticker.entity';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([SeasonSticker]), SharedModule],
  controllers: [SeasonStickerController],
  providers: [SeasonStickerService],
})
export class SeasonStickerModule {}
