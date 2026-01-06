import { Test, TestingModule } from '@nestjs/testing';
import { WoController } from './wo.controller';
import { WoService } from './wo.service';

describe('WoController', () => {
  let controller: WoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WoController],
      providers: [WoService],
    }).compile();

    controller = module.get<WoController>(WoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
