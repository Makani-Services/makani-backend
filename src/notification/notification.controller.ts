import { Controller, Post, Body, Get, Query, Headers } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('api/notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('/create')
  create(@Body() body: any, @Headers() headers: any) {
    return this.notificationService.create(body, headers.company);
  }

  // @Post('/update')
  // update(@Body() body: any) {
  //   console.log('createWoDto: ', body);
  //   return this.notificationService.update(body);
  // }

  @Post('/get')
  getOne(@Body() body: any, @Headers() headers: any) {
    return this.notificationService.getOneItem(
      body.type,
      body.flow,
      body.event,
      body.branchId,
      headers.company,
    );
  }
}
