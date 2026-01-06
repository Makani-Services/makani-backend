import { Test, TestingModule } from '@nestjs/testing';
import { CustomerNoteController } from './customer-note.controller';
import { CustomerNoteService } from './customer-note.service';

describe('CustomerNoteController', () => {
  let controller: CustomerNoteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerNoteController],
      providers: [CustomerNoteService],
    }).compile();

    controller = module.get<CustomerNoteController>(CustomerNoteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
