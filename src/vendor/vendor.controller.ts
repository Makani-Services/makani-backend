import {
  Controller,
  Get,
  Query,
  UseGuards,
  Post,
  Body,
  Headers,
} from '@nestjs/common';
import { VendorService } from './vendor.service';
import { Permissions } from 'src/core/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { CreateVendorDto } from './dto/vendor-create.dto';
import { UpdateVendorDto } from './dto/vendor-update.dto';
import { VendorEntity } from './entities/vendor.entity';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/vendor')
export class VendorController {
  constructor(private readonly service: VendorService) {}

  @Get('get_all')
  async getAll(@Query() query: any, @Headers() headers: any) {
    return await this.service.findAll(query.keyword, headers.company);
  }

  @Post('delete')
  async delete(@Body() body: any) {
    return await this.service.delete(body.vendorId);
  }

  @Post('save')
  async save(@Body() body: CreateVendorDto) {
    return this.service.save(body);
  }

  @Post('update')
  async updateVendor(@Body() body: UpdateVendorDto) {
    return this.service.updateVendor(body);
  }
}
