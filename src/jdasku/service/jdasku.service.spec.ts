import { Test, TestingModule } from '@nestjs/testing';
import { JdaskuService } from './jdasku.service';

describe('JdaskuService', () => {
  let service: JdaskuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JdaskuService],
    }).compile();

    service = module.get<JdaskuService>(JdaskuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
