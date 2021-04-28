import { Test, TestingModule } from '@nestjs/testing';
import { ShipmethodService } from './shipmethod.service';

describe('ShipmethodService', () => {
  let service: ShipmethodService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShipmethodService],
    }).compile();

    service = module.get<ShipmethodService>(ShipmethodService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
