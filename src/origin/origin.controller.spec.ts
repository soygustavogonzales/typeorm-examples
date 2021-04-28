import { Test, TestingModule } from '@nestjs/testing';
import { OriginController } from './origin.controller';

describe('Origin Controller', () => {
  let controller: OriginController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OriginController],
    }).compile();

    controller = module.get<OriginController>(OriginController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
