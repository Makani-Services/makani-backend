import { Test, TestingModule } from '@nestjs/testing';
import { CustomerUserInviteService } from './customer-user-invite.service';

describe('CustomerUserInviteService', () => {
  let service: CustomerUserInviteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerUserInviteService],
    }).compile();

    service = module.get<CustomerUserInviteService>(CustomerUserInviteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
