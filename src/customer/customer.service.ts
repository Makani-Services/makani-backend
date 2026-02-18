import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerEntity } from './entities/customer.entity';
import { Brackets, Repository, UpdateResult } from 'typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CreateCustomerDto } from './dto/customer-create.dto';

@Injectable()
export class CustomerService extends TypeOrmCrudService<CustomerEntity> {
  constructor(
    @InjectRepository(CustomerEntity) repo: Repository<CustomerEntity>,
  ) {
    super(repo);
  }

  async getAll(keyword) {
    let query = this.repo
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.branch', 'branch')
      .where(
        new Brackets((qb) => {
          qb.where('customer.companyName ILike :searchString', {
            searchString: `%${keyword}%`,
          });
        }),
      )
      .andWhere('customer.isArchived = false');

    query = query.orderBy('LOWER(TRIM(customer.companyName))', 'ASC');
    return await query.getMany();
  }

  async addCustomer(
    data: CreateCustomerDto,
    company: string,
  ): Promise<CustomerEntity> {
    const newCustomer = new CustomerEntity({
      companyName: data.companyName,
      phone: data.phone,
      address: data.address,
      contact: data.contact,
      email: data.email,
      branch: data.branch ? ({ id: data.branch.id } as any) : undefined,
      company: company,
    });
    return await this.repo.save(newCustomer);
  }

  async getCustomer(customerId): Promise<CustomerEntity> {
    return await this.repo.findOne({
      where: { id: customerId },
      relations: ['branch'],
    });
  }

  async archiveOneCustomer(customerId: number): Promise<UpdateResult> {
    const result = await this.repo.update(customerId, { isArchived: true });
    if (result.affected === 0) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }
    return result;
  }

  async updateCustomer(data) {
    var newCustomer = new CustomerEntity(data);
    return await this.repo.save(newCustomer);
  }
}
