import { Test, TestingModule } from '@nestjs/testing';
import { RatioService } from './ratio.service';

describe('RatioService', () => {
  let service: RatioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RatioService],
    }).compile();

    service = module.get<RatioService>(RatioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
