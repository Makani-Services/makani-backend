import {
  Controller,
  Get,
  Query,
  UseGuards,
  Post,
  Body,
  Headers,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Permissions } from 'src/core/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { CreateCustomerDto } from './dto/customer-create.dto';
import { UpdateCustomerDto } from './dto/customer-update.dto';
import { DeleteCustomerDto } from './dto/customer-delete.dto';
import { CustomerEntity } from './entities/customer.entity';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/customer')
export class CustomerController {
  constructor(private readonly service: CustomerService) {}

  @Get('get_all')
  // @Permissions(['CUSTOMER:READ'])
  async getAll(@Query() query: any) {
    return await this.service.getAll(query.keyword);
  }

  @Get('get_one')
  async getCustomerById(@Query() query: any) {
    return await this.service.getCustomer(Number(query.customerId));
  }

  @Post('archive_customer')
  // @Permissions(['CUSTOMER:CREATE'])
  async archive(@Body() body: DeleteCustomerDto) {
    return await this.service.archiveOneCustomer(body.customerId);
  }

  @Post('add_customer')
  // @Permissions(['CUSTOMER:CREATE'])
  async addCustomer(@Body() body: CreateCustomerDto, @Headers() headers: any) {
    return this.service.addCustomer(body, headers.company);
  }

  @Post('update_customer')
  // @Permissions(['CUSTOMER:CREATE'])
  async updateCustomer(@Body() body: UpdateCustomerDto) {
    return this.service.updateCustomer(body);
  }
}
