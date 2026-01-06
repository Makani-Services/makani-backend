import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CustomerRoleService } from './customer-role.service';
import { CustomerRoleInputDto } from './dto/customer-role.input';
import { CustomerRoleUpdateDto } from './dto/customer-role.update';
import { CustomerRoleDeleteDto } from './dto/customer-role.delete';
import { CustomerRoleDto } from './dto/customer-role.dto';

@ApiTags('Customer Role Management')
@Controller('/api/customer-role')
@UseGuards(JwtAuthGuard)
export class CustomerRoleController {
  // Updated to get company from headers
  constructor(private readonly customerRoleService: CustomerRoleService) {}

  @Get('/get-all')
  @ApiOkResponse({ type: () => Array<CustomerRoleDto> })
  async getAll(@Headers() headers: any): Promise<CustomerRoleDto[]> {
    return await this.customerRoleService.getAll(headers.company);
  }

  @Get('getById')
  @ApiOkResponse({ type: () => CustomerRoleDto })
  async getById(
    @Query('id') id: number,
    @Headers() headers: any,
  ): Promise<CustomerRoleDto> {
    return await this.customerRoleService.getById(id, headers.company);
  }

  @Post('createOne')
  @ApiOkResponse({ type: () => CustomerRoleDto })
  async createOne(
    @Body() payload: CustomerRoleInputDto,
    @Headers() headers: any,
  ): Promise<CustomerRoleDto> {
    return await this.customerRoleService.createOne(payload, headers.company);
  }

  @Post('updateOne')
  @ApiOkResponse({ type: () => CustomerRoleDto })
  async updateOne(
    @Body() payload: CustomerRoleUpdateDto,
    @Headers() headers: any,
  ): Promise<CustomerRoleDto> {
    return await this.customerRoleService.updateOne(payload, headers.company);
  }

  @Post('deleteOne')
  @ApiOkResponse({ type: () => Boolean })
  async deleteOne(
    @Body() payload: CustomerRoleDeleteDto,
    @Headers() headers: any,
  ): Promise<boolean> {
    return await this.customerRoleService.deleteOne(payload, headers.company);
  }
}
