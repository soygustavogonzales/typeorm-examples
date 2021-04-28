import { Test, TestingModule } from '@nestjs/testing';
import { RseService } from './rse.service';

describe('RseService', () => {
  let service: RseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RseService],
    }).compile();

    service = module.get<RseService>(RseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
