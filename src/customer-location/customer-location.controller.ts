import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { CustomerLocationService } from './customer-location.service';
import { CreateCustomerLocationDto } from './dto/create-customer-location.dto';
import { UpdateCustomerLocationDto } from './dto/update-customer-location.dto';

@Controller('api/customer/location/')
export class CustomerLocationController {
  constructor(
    private readonly customerLocationService: CustomerLocationService,
  ) {}

  @Get('get-one')
  async getOne(@Query('locationId') locationId: string) {
    if (!locationId) {
      throw new BadRequestException('locationId is required');
    }
    const locationIdNum = parseInt(locationId);
    if (isNaN(locationIdNum)) {
      throw new BadRequestException('locationId must be a valid number');
    }
    return await this.customerLocationService.findOne(locationIdNum);
  }

  @Get('get-all')
  async getAll(@Query('customerId') customerId: string) {
    if (!customerId) {
      throw new BadRequestException('customerId is required');
    }
    const customerIdNum = parseInt(customerId);
    if (isNaN(customerIdNum)) {
      throw new BadRequestException('customerId must be a valid number');
    }
    return await this.customerLocationService.findAllByCustomerId(
      customerIdNum,
    );
  }

  @Post('save')
  async saveLocation(
    @Body() createCustomerLocationDto: CreateCustomerLocationDto,
  ) {
    return await this.customerLocationService.create(createCustomerLocationDto);
  }

  @Post('delete')
  async deleteLocation(@Body() body: { locationId: number }) {
    return await this.customerLocationService.remove(body.locationId);
  }

  @Post('update')
  async updateLocation(
    @Body() updateCustomerLocationDto: UpdateCustomerLocationDto,
  ) {
    return await this.customerLocationService.update(
      updateCustomerLocationDto.id,
      updateCustomerLocationDto,
    );
  }
}
