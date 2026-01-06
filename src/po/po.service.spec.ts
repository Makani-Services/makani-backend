import { Test, TestingModule } from '@nestjs/testing';
import { PoService } from './po.service';

describe('WoService', () => {
  let service: PoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PoService],
    }).compile();

    service = module.get<PoService>(PoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
