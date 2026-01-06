import { Test, TestingModule } from '@nestjs/testing';
import { CustomerNotificationService } from './customer-notification.service';

describe('CustomerNotificationService', () => {
  let service: CustomerNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerNotificationService],
    }).compile();

    service = module.get<CustomerNotificationService>(CustomerNotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
