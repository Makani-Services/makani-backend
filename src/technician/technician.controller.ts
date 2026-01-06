import {
  Body,
  Controller,
  Post,
  Query,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { PusherService } from 'src/pusher/pusher.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/technician')
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Post('/create')
  create(@Body() body: any, @Headers() headers: any) {
    return this.technicianService.create(body, headers.company);
  }

  @Post('/update_bulk_technician')
  updateBulkTechnician(@Body() body: any) {
    const woId = body.woId;
    const updatedTechArray = body.data;
    return this.technicianService.updateBulkTechnician(woId, updatedTechArray);
  }

  @Post('/bulk_timesheet_update')
  updateBulkTimesheet(@Body() body: any) {
    // const woId = body.woId;
    const techArray = body.techArray;
    return this.technicianService.updateBulkTimesheet(techArray);
  }

  @Post('/update')
  update(@Body() body: any, @Headers() headers: any) {
    const id = body.id as number;
    const data = body.data as UpdateTechnicianDto;
    return this.technicianService.update(id, data, headers);
  }

  @Post('/delete')
  delete(@Body() body: any) {
    // console.log('body.data: ', query);
    const woId = body.woId;
    const removedTechArray = body.data;
    const eventUser = body.eventUser;
    return this.technicianService.delete(woId, removedTechArray, eventUser);
  }

  @Post('/accept_order')
  acceptOrder(@Body() body: any, @Headers() headers: any) {
    return this.technicianService.acceptOrder(
      body.userId,
      body.orderId,
      headers.company,
    );
  }

  @Post('/reject_order')
  rejectOrder(@Body() body: any) {
    return this.technicianService.rejectOrder(body.userId, body.orderId);
  }

  @Post('/get_time_cards')
  getTimeCards(@Body() body: any) {
    return this.technicianService.getTimeCards(
      body.userId,
      body.startDate,
      body.endDate,
      0, //branchId:  0 is a temporary value for all branches. Tech app should be updated to work correctly
    );
  }
}
