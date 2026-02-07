import { Body, Controller, Get, Post } from '@nestjs/common';
import { ServiceTypeService } from './service-type.service';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { UpdateServiceTypeDto } from './dto/update-service-type.dto';

@Controller('/api/service-type')
export class ServiceTypeController {
  constructor(private readonly service: ServiceTypeService) { }

  @Get('get-all')
  async getAll() {
    return await this.service.findAll();
  }

  @Post('save')
  async save(@Body() body: CreateServiceTypeDto) {
    console.log("🚀 ~ ServiceTypeController ~ save ~ body:", body)
    return await this.service.save(body);
  }

  @Post('update')
  async update(@Body() body: UpdateServiceTypeDto) {
    return await this.service.update(body);
  }

  @Post('archive')
  async archive(@Body() body: { serviceTypeId: number }) {
    return await this.service.archive(body.serviceTypeId);
  }
}
