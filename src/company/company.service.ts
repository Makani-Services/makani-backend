import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyEntity } from './entities/company.entity';
import { Repository } from 'typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CreateCompanyDto } from './dto/company-create.dto';
import * as fs from 'fs';
import { UpdateCompanyDto } from './dto/company-update.dto';

@Injectable()
export class CompanyService extends TypeOrmCrudService<CompanyEntity> {
  constructor(
    @InjectRepository(CompanyEntity) repo: Repository<CompanyEntity>,
  ) {
    super(repo);
  }

  async get(company: string): Promise<CompanyEntity> {
    return await this.repo.findOne({ where: { identifier: company } });
  }

  // async save(
  //   data: CreateCompanyDto,
  //   logoBase64,
  //   company: string,
  // ): Promise<CompanyEntity> {
  //   var newCompany = new CompanyEntity(data);
  //   newCompany.id = 0;

  //   if (logoBase64) {
  //     // const filePath = 'public/company/logo.png';
  //     const filePath = `public/${company}/company/logo.png`;

  //     const buffer = Buffer.from(logoBase64, 'base64');
  //     try {
  //       await fs.promises.writeFile(filePath, buffer);
  //     } catch (err) {
  //       console.log('err: ', err);
  //     }
  //     newCompany.logo = 'logo.png';
  //   }
  //   return await this.repo.save(newCompany);
  // }

  async update(
    data: UpdateCompanyDto,
    logoBase64: string | undefined,
    company: string,
  ) {
    const companyItem = await this.repo.findOne({
      where: { identifier: company },
    });

    if (!companyItem) {
      throw new NotFoundException('Company not found');
    }

    if (logoBase64) {
      const logoDir = `public/${company}/company`;
      const filePath = `${logoDir}/logo.png`;
      const buffer = Buffer.from(logoBase64, 'base64');
      try {
        await fs.promises.mkdir(logoDir, { recursive: true });
        await fs.promises.writeFile(filePath, buffer as NodeJS.ArrayBufferView);
        companyItem.logo = 'logo.png';
      } catch (err) {
        console.log('err: ', err);
      }
    }

    const updateFields: Partial<CompanyEntity> = {
      name: data.name,
      address: data.address,
      phone: data.phone,
      fax: data.fax,
      website: data.website,
    };
    this.repo.merge(companyItem, updateFields);

    return await this.repo.save(companyItem);
  }

  // async getOneCompany(identifier: string): Promise<CompanyEntity> {
  //   return await this.repo.findOne({ where: { identifier: identifier } });
  // }
}
