import { Test, TestingModule } from '@nestjs/testing';
import { TimehseetController } from './timesheet.controller';
import { TimesheetService } from './timesheet.service';

describe('TechnicianController', () => {
  let controller: TimehseetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimehseetController],
      providers: [TimesheetService],
    }).compile();

    controller = module.get<TimehseetController>(TimehseetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
