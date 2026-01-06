import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VendorEntity } from './entities/vendor.entity';
import { Brackets, Repository } from 'typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CreateVendorDto } from './dto/vendor-create.dto';

@Injectable()
export class VendorService extends TypeOrmCrudService<VendorEntity> {
  constructor(@InjectRepository(VendorEntity) repo: Repository<VendorEntity>) {
    super(repo);
  }

  async findAll(keyword, company: string) {
    let query = this.repo.createQueryBuilder('vendor');
    // .leftJoinAndSelect('vendor.branch', 'branch');

    if (keyword) {
      query = query.where(
        new Brackets((qb) => {
          qb.where('vendor.name ILike :searchString', {
            searchString: `%${keyword}%`,
          }).andWhere('vendor.company = :company', {
            company: company,
          });
        }),
      );
    }

    query = query.orderBy('LOWER(TRIM(vendor.name))', 'ASC');

    return await query.getMany();
  }

  async save(data: CreateVendorDto): Promise<VendorEntity> {
    var newVendor = new VendorEntity(data);
    return await this.repo.save(newVendor);
  }

  async delete(vendorId: number): Promise<Boolean> {
    const { affected } = await this.repo.delete(vendorId);

    if (affected > 0) {
      return true;
    } else {
      throw new NotFoundException(`User not found`);
    }
  }

  async updateVendor(data) {
    var newVendor = new VendorEntity(data);
    return await this.repo.save(newVendor);
  }
}
