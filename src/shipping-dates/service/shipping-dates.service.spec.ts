import { Test, TestingModule } from '@nestjs/testing';
import { ShippingDatesService } from './shipping-dates.service';

describe('ShippingDatesService', () => {
  let service: ShippingDatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShippingDatesService],
    }).compile();

    service = module.get<ShippingDatesService>(ShippingDatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
