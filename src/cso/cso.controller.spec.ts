import { Test, TestingModule } from '@nestjs/testing';
import { CsoController } from './cso.controller';

describe('Cso Controller', () => {
  let controller: CsoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CsoController],
    }).compile();

    controller = module.get<CsoController>(CsoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
