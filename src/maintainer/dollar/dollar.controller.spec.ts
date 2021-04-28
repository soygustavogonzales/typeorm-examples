import { Test, TestingModule } from '@nestjs/testing';
import { DollarController } from './dollar.controller';

describe('Dollar Controller', () => {
  let controller: DollarController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DollarController],
    }).compile();

    controller = module.get<DollarController>(DollarController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
