import { Test, TestingModule } from '@nestjs/testing';
import { DesignerController } from './designer.controller';

describe('Designer Controller', () => {
  let controller: DesignerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DesignerController],
    }).compile();

    controller = module.get<DesignerController>(DesignerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
