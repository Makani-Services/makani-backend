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
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Controller('/api/branch')
export class BranchController {
  constructor(private readonly service: BranchService) {}

  @Get('get-all')
  findAll(@Headers() headers: any) {
    return this.service.findAll(headers.company);
  }

  @Post('delete')
  async delete(@Body() body: { branchId: number }) {
    return await this.service.delete(body.branchId);
  }

  @Post('save')
  async save(@Body() body: CreateBranchDto) {
    return this.service.save(body);
  }

  @Post('update')
  async update(@Body() body: UpdateBranchDto) {
    return this.service.update(body);
  }
}
