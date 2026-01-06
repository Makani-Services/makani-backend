import { Test, TestingModule } from '@nestjs/testing';
import { CustomerRoleController } from './customer-role.controller';
import { CustomerRoleService } from './customer-role.service';

describe('CustomerRoleController', () => {
  let controller: CustomerRoleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerRoleController],
      providers: [CustomerRoleService],
    }).compile();

    controller = module.get<CustomerRoleController>(CustomerRoleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
