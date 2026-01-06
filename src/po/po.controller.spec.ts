import { Test, TestingModule } from '@nestjs/testing';
import { PoController } from './po.controller';
import { PoService } from './po.service';

describe('WoController', () => {
  let controller: PoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PoController],
      providers: [PoService],
    }).compile();

    controller = module.get<PoController>(PoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
