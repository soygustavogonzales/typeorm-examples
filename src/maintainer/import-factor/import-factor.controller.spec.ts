import { Test, TestingModule } from '@nestjs/testing';
import { ImportFactorController } from './import-factor.controller';

describe('ImportFactor Controller', () => {
  let controller: ImportFactorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImportFactorController],
    }).compile();

    controller = module.get<ImportFactorController>(ImportFactorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
