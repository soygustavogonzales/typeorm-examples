import { Test, TestingModule } from '@nestjs/testing';
import { ImportFactorService } from './import-factor.service';

describe('ImportFactorService', () => {
  let service: ImportFactorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImportFactorService],
    }).compile();

    service = module.get<ImportFactorService>(ImportFactorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
