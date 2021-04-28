import { Test, TestingModule } from '@nestjs/testing';
import { CsoService } from './cso.service';

describe('CsoService', () => {
  let service: CsoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CsoService],
    }).compile();

    service = module.get<CsoService>(CsoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
