import { Test, TestingModule } from '@nestjs/testing';
import { StoreProxyService } from './store-proxy.service';

describe('StoreProxyService', () => {
  let service: StoreProxyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoreProxyService],
    }).compile();

    service = module.get<StoreProxyService>(StoreProxyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
