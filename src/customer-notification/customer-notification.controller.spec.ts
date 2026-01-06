import { Test, TestingModule } from '@nestjs/testing';
import { CustomerNotificationController } from './customer-notification.controller';
import { CustomerNotificationService } from './customer-notification.service';

describe('CustomerNotificationController', () => {
  let controller: CustomerNotificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerNotificationController],
      providers: [CustomerNotificationService],
    }).compile();

    controller = module.get<CustomerNotificationController>(CustomerNotificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
