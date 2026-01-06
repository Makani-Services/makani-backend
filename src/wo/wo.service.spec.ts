import { Test, TestingModule } from '@nestjs/testing';
import { WoService } from './wo.service';

describe('WoService', () => {
  let service: WoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WoService],
    }).compile();

    service = module.get<WoService>(WoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
