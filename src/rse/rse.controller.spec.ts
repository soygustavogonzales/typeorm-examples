import { Test, TestingModule } from '@nestjs/testing';
import { RseController } from './rse.controller';

describe('Rse Controller', () => {
  let controller: RseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RseController],
    }).compile();

    controller = module.get<RseController>(RseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
