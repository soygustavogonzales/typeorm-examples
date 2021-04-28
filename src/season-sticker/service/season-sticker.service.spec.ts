import { Test, TestingModule } from '@nestjs/testing';
import { SeasonStickerService } from './season-sticker.service';

describe('SeasonStickerService', () => {
  let service: SeasonStickerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SeasonStickerService],
    }).compile();

    service = module.get<SeasonStickerService>(SeasonStickerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
