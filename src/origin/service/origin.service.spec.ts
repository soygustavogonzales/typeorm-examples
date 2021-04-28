import { Test, TestingModule } from '@nestjs/testing';
import { OriginService } from './origin.service';

describe('OriginService', () => {
  let service: OriginService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OriginService],
    }).compile();

    service = module.get<OriginService>(OriginService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
