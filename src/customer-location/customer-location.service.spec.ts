import { Test, TestingModule } from '@nestjs/testing';
import { CustomerLocationService } from './customer-location.service';

describe('CustomerLocationService', () => {
  let service: CustomerLocationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerLocationService],
    }).compile();

    service = module.get<CustomerLocationService>(CustomerLocationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
