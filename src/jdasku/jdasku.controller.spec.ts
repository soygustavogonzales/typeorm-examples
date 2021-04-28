import { Test, TestingModule } from '@nestjs/testing';
import { JdaskuController } from './jdasku.controller';

describe('Jdasku Controller', () => {
  let controller: JdaskuController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JdaskuController],
    }).compile();

    controller = module.get<JdaskuController>(JdaskuController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
