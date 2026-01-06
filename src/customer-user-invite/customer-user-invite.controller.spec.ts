import { Test, TestingModule } from '@nestjs/testing';
import { CustomerUserInviteController } from './customer-user-invite.controller';
import { CustomerUserInviteService } from './customer-user-invite.service';

describe('CustomerUserInviteController', () => {
  let controller: CustomerUserInviteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerUserInviteController],
      providers: [CustomerUserInviteService],
    }).compile();

    controller = module.get<CustomerUserInviteController>(CustomerUserInviteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
