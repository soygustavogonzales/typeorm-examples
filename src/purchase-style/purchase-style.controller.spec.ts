import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseStyleController } from './purchase-style.controller';

describe('PurchaseStyle Controller', () => {
  let controller: PurchaseStyleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseStyleController],
    }).compile();

    controller = module.get<PurchaseStyleController>(PurchaseStyleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
