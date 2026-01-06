import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCustomerLocationDto } from './dto/create-customer-location.dto';
import { UpdateCustomerLocationDto } from './dto/update-customer-location.dto';
import { CustomerLocationEntity } from './entities/customer-location.entity';
import { CustomerEntity } from 'src/customer/entities/customer.entity';

@Injectable()
export class CustomerLocationService {
  constructor(
    @InjectRepository(CustomerLocationEntity)
    private readonly customerLocationRepository: Repository<CustomerLocationEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
  ) {}

  async create(
    createCustomerLocationDto: CreateCustomerLocationDto,
  ): Promise<CustomerLocationEntity> {
    // Validate that customerId is provided
    if (!createCustomerLocationDto.customerId) {
      throw new BadRequestException('customerId is required');
    }

    // Find the customer to ensure it exists
    const customer = await this.customerRepository.findOne({
      where: { id: createCustomerLocationDto.customerId },
    });

    if (!customer) {
      throw new NotFoundException(
        `Customer with ID ${createCustomerLocationDto.customerId} not found`,
      );
    }

    // Create new location with customer relationship
    const newLocation = new CustomerLocationEntity({
      name: createCustomerLocationDto.name,
      address: createCustomerLocationDto.address,
      phone: createCustomerLocationDto.phone,
      timezone: createCustomerLocationDto.timezone,
      customer: customer,
    });

    return await this.customerLocationRepository.save(newLocation);
  }

  async findAll(): Promise<CustomerLocationEntity[]> {
    return await this.customerLocationRepository.find({
      relations: ['customer'],
      order: { createdAt: 'ASC' },
    });
  }

  async findAllByCustomerId(
    customerId: number,
  ): Promise<CustomerLocationEntity[]> {
    return await this.customerLocationRepository.find({
      where: { customer: { id: customerId } },
      relations: ['customer'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: number): Promise<CustomerLocationEntity> {
    const location = await this.customerLocationRepository.findOne({
      where: { id },
      relations: ['customer'],
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    return location;
  }

  async update(
    id: number,
    updateCustomerLocationDto: UpdateCustomerLocationDto,
  ): Promise<CustomerLocationEntity> {
    const location = await this.findOne(id);

    Object.assign(location, updateCustomerLocationDto);
    return await this.customerLocationRepository.save(location);
  }

  async remove(id: number): Promise<{ success: boolean; message: string }> {
    const location = await this.findOne(id);

    await this.customerLocationRepository.remove(location);

    return {
      success: true,
      message: `Location with ID ${id} has been deleted successfully`,
    };
  }
}
