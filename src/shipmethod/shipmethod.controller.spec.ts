import { Test, TestingModule } from '@nestjs/testing';
import { ShipmethodController } from './shipmethod.controller';

describe('Shipmethod Controller', () => {
  let controller: ShipmethodController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShipmethodController],
    }).compile();

    controller = module.get<ShipmethodController>(ShipmethodController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
