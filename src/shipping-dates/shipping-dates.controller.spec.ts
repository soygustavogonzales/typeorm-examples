import { Test, TestingModule } from '@nestjs/testing';
import { ShippingDatesController } from './shipping-dates.controller';

describe('Shipping Dates Controller', () => {
  let controller: ShippingDatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShippingDatesController],
    }).compile();

    controller = module.get<ShippingDatesController>(ShippingDatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
