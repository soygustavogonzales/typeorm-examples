import { Test, TestingModule } from '@nestjs/testing';
import { RatioController } from './ratio.controller';

describe('Ratio Controller', () => {
  let controller: RatioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RatioController],
    }).compile();

    controller = module.get<RatioController>(RatioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
