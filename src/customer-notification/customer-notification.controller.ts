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
import { CustomerNotificationService } from './customer-notification.service';
import { CreateCustomerNotificationDto } from './dto/create-customer-notification.dto';
import { UpdateCustomerNotificationDto } from './dto/update-customer-notification.dto';
import { CustomerLocationService } from '../customer-location/customer-location.service';

@Controller('/api/customer-notification')
export class CustomerNotificationController {
  constructor(
    private readonly customerNotificationService: CustomerNotificationService,
    private readonly customerLocationService: CustomerLocationService,
  ) {}

  @Post('/create')
  async create(@Body() body: any, @Headers() headers: any) {
    const status = body.status;
    const type = body.type;
    const recipientList = body.recipientList;
    const company = headers.company;
    const locationId = body.locationId;

    const customerLocation = await this.customerLocationService.findOne(
      locationId,
    );

    const createCustomerNotificationDto = {
      status,
      type,
      recipientList,
      company,
      customerLocation,
    };

    return this.customerNotificationService.create(
      createCustomerNotificationDto,
    );
  }

  @Post()
  findAll() {
    return this.customerNotificationService.findAll();
  }

  @Post('/find-one')
  findOne(@Body() body: any, @Headers() headers: any) {
    console.log('🚀 ~ CustomerNotificationController ~ findOne ~ body:', body);
    const status = body.status;
    const type = body.type;
    const company = headers.company;
    const locationId = body.locationId;
    return this.customerNotificationService.findOne(
      status,
      type,
      locationId,
      company,
    );
  }

  @Post('/delete')
  remove(@Body() body: any, @Headers() headers: any) {
    const status = body.status;
    const type = body.type;
    const locationId = body.locationId;
    const company = headers.company;
    return this.customerNotificationService.remove(
      status,
      type,
      locationId,
      company,
    );
  }

  @Post('/update')
  update(@Body() body: any, @Headers() headers: any) {
    const status = body.status;
    const type = body.type;
    const locationId = body.locationId;
    const company = headers.company;
    const recipientList = body.recipientList;

    const updateCustomerNotificationDto = {
      status,
      type,
      recipientList,
      company,
      locationId,
    };

    return this.customerNotificationService.update(
      updateCustomerNotificationDto,
    );
  }
}
