import {
  Controller,
  Get,
  Query,
  UseGuards,
  Post,
  Body,
  Headers,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { Permissions } from 'src/core/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { CreateCompanyDto } from './dto/company-create.dto';
import { UpdateCompanyDto } from './dto/company-update.dto';
import { CompanyEntity } from './entities/company.entity';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/company')
export class CompanyController {
  constructor(private readonly service: CompanyService) {}

  @Get('get')
  // @Permissions(['Company:READ'])
  async get(@Headers() headers: any) {
    return await this.service.get(headers.company);
  }

  // @Post('save')
  // async save(@Body() body, @Headers() headers: any) {
  //   const data = body.data as CreateCompanyDto;
  //   const logoBase64 = body.logoBase64;
  //   const company = headers.company;

  //   return this.service.save(data as CreateCompanyDto, logoBase64, company);
  // }

  @Post('update')
  async updateCompany(@Body() body, @Headers() headers: any) {
    const data = body.data as UpdateCompanyDto;
    const logoBase64 = body.logoBase64;
    const company = headers.company;

    return this.service.update(data, logoBase64, company);
  }
}
