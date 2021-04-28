import { Test, TestingModule } from '@nestjs/testing';
import { ExitportsService } from './exitports.service';

describe('ExitportsService', () => {
  let service: ExitportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExitportsService],
    }).compile();

    service = module.get<ExitportsService>(ExitportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
