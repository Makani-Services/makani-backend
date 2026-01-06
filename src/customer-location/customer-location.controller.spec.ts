import { Test, TestingModule } from '@nestjs/testing';
import { CustomerLocationController } from './customer-location.controller';
import { CustomerLocationService } from './customer-location.service';

describe('CustomerLocationController', () => {
  let controller: CustomerLocationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerLocationController],
      providers: [CustomerLocationService],
    }).compile();

    controller = module.get<CustomerLocationController>(CustomerLocationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
