import { Test, TestingModule } from '@nestjs/testing';
import { DollarService } from './dollar.service';

describe('ServicesService', () => {
  let service: DollarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DollarService],
    }).compile();

    service = module.get<DollarService>(DollarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
