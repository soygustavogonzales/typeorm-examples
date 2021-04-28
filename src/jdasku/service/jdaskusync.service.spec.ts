import { Test, TestingModule } from '@nestjs/testing';
import { JdaskusyncService } from './jdaskusync.service';

describe('JdaskusyncService', () => {
  let service: JdaskusyncService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JdaskusyncService],
    }).compile();

    service = module.get<JdaskusyncService>(JdaskusyncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
