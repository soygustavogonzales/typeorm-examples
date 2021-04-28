import { Test, TestingModule } from '@nestjs/testing';
import { SeasonStickerController } from './season-sticker.controller';

describe('Seson Sticker Controller', () => {
  let controller: SeasonStickerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeasonStickerController],
    }).compile();

    controller = module.get<SeasonStickerController>(SeasonStickerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
