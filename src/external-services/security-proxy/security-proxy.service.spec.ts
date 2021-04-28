import { Test, TestingModule } from '@nestjs/testing';
import { SecurityProxyService } from './security-proxy.service';

describe('SecurityProxyService', () => {
  let service: SecurityProxyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecurityProxyService],
    }).compile();

    service = module.get<SecurityProxyService>(SecurityProxyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
