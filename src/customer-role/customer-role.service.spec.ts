import { Test, TestingModule } from '@nestjs/testing';
import { CustomerRoleService } from './customer-role.service';

describe('CustomerRoleService', () => {
  let service: CustomerRoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerRoleService],
    }).compile();

    service = module.get<CustomerRoleService>(CustomerRoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
