import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseStyleService } from './purchase-style.service';

describe('PurchaseStyleService', () => {
  let service: PurchaseStyleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PurchaseStyleService],
    }).compile();

    service = module.get<PurchaseStyleService>(PurchaseStyleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
