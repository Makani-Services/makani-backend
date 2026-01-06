import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TimesheetService } from './timesheet.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { UpdateTimesheetDto } from './dto/update-timesheet.dto';
import { UpdateTechnicianDto } from 'src/technician/dto/update-technician.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/timesheet')
export class TimehseetController {
  constructor(private readonly timesheetService: TimesheetService) {}

  @Post('/create')
  create(@Body() body: any) {
    return this.timesheetService.create(body);
  }

  @Post('/update')
  update(@Body() body: any) {
    const id = body.id as number;
    const data = body.data as UpdateTimesheetDto;
    return this.timesheetService.update(id, data);
  }
}
