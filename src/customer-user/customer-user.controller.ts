import { Controller, Query, Headers, Get, Post, Body } from '@nestjs/common';
import { CustomerUserService } from './customer-user.service';

@Controller('api/customer-user')
export class CustomerUserController {
  constructor(private readonly customerUserService: CustomerUserService) {}

  @Get('get-all')
  // @Permissions(['USER:READ'])
  async getAll(@Query() query: any, @Headers() headers: any) {
    if (query.role) {
      return await this.customerUserService.getAllUsers(
        query.locationId,
        query.role,
        query.customerId,
        headers.company,
      );
    } else {
      return await this.customerUserService.getAllUsers(
        query.locationId,
        null,
        query.customerId,
        headers.company,
      );
    }
  }

  @Get('get-all-users')
  // @Permissions(['USER:READ'])
  async getAllUsers(@Query() query: any, @Headers() headers: any) {
    const customerId = query.customerId;
    return await this.customerUserService.getAllCustomerUsers(
      customerId,
      headers.company,
    );
  }
  @Post('update')
  async updateOne(@Body() body: any) {
    return await this.customerUserService.updateUser(body.user);
  }
}
