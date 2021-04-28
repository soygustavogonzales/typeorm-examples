import { Test, TestingModule } from '@nestjs/testing';
import { StyleProxyService } from './style-proxy.service';

describe('StyleProxyService', () => {
  let service: StyleProxyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StyleProxyService],
    }).compile();

    service = module.get<StyleProxyService>(StyleProxyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
