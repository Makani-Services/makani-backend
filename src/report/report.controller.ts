import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Controller('api/report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post('/create')
  create(@Body() body: any, @Headers() headers: any) {
    return this.reportService.create(body, headers.company);
  }

  @Post('/update')
  update(@Body() body: any, @Headers() headers: any) {
    return this.reportService.update(body.id, body.data, headers.company);
  }

  @Get('/get_all')
  getAll(@Query() query: any, @Headers() headers: any) {
    return this.reportService.getAll(Number(query.branchId), headers.company);
  }

  @Get('/delete')
  delete(@Query() query: any, @Headers() headers: any) {
    return this.reportService.delete(Number(query.id), headers.company);
  }

  @Post('/send_hours_worked_report')
  sendHoursWorkedReport(@Body() body: any, @Headers() headers: any) {
    return this.reportService.sendHoursWorkedReport(
      body.branchId,
      body.recipients,
      body.past7Days,
      body.past30Days,
      body.date,
      body.customDays,
      body.customStartDate,
      body.customEndDate,
      headers.company,
    );
  }
}
