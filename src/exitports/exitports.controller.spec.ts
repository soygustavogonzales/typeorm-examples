import { Test, TestingModule } from '@nestjs/testing';
import { ExitportsController } from './exitports.controller';

describe('Exitports Controller', () => {
  let controller: ExitportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExitportsController],
    }).compile();

    controller = module.get<ExitportsController>(ExitportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
