import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerUserEntity } from './entities/customer-user.entity';
import { CustomerEntity } from 'src/customer/entities/customer.entity';
import { CustomerRoleEntity } from 'src/customer-role/entities/customer-role.entity';
import { CustomerLocationEntity } from 'src/customer-location/entities/customer-location.entity';
import { UserEntity } from 'src/user/entities/user.entity';

@Injectable()
export class CustomerUserService {
  constructor(
    @InjectRepository(CustomerUserEntity)
    private readonly customerUserRepository: Repository<CustomerUserEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
    @InjectRepository(CustomerRoleEntity)
    private readonly customerRoleRepository: Repository<CustomerRoleEntity>,
    @InjectRepository(CustomerLocationEntity)
    private readonly customerLocationRepository: Repository<CustomerLocationEntity>,
  ) {}

  async getAllUsers(
    locationId: number,
    role = null,
    customerId: number,
    company: string,
  ): Promise<CustomerUserEntity[]> {
    let location = Number(locationId);
    let result;

    if (role === 'Administrator') {
      let query = this.customerUserRepository
        .createQueryBuilder('customerUser')
        .leftJoinAndSelect('customerUser.customerRoles', 'roles')
        .leftJoinAndSelect(
          'customerUser.customerLocations',
          'customerLocations',
        )
        .leftJoinAndSelect('customerUser.customer', 'customer')
        .where('roles.name != :roleName', { roleName: 'Administrator' })
        .andWhere('customerUser.company = :company', { company })
        .andWhere('customer.id = :customerId', { customerId })
        .orderBy('customerUser.name', 'ASC')
        .addOrderBy('customerLocations.id', 'ASC');
      result = await query.getMany();
    } else if (role === 'Manager') {
      let query = this.customerUserRepository
        .createQueryBuilder('customerUser')
        .leftJoinAndSelect('customerUser.customerRoles', 'roles')
        .leftJoinAndSelect(
          'customerUser.customerLocations',
          'customerLocations',
        )
        .leftJoinAndSelect('customerUser.customer', 'customer')
        .where('roles.name NOT IN (:...excludedRoles)', {
          excludedRoles: ['Administrator', 'Manager'],
        })
        .andWhere('customerUser.company = :company', { company })
        .andWhere('customer.id = :customerId', { customerId })
        .orderBy('customerUser.name', 'ASC')
        .addOrderBy('branches.id', 'ASC');

      result = await query.getMany();
    } else {
      let query = this.customerUserRepository
        .createQueryBuilder('customerUser')
        .leftJoinAndSelect('customerUser.customerRoles', 'roles')
        .leftJoinAndSelect(
          'customerUser.customerLocations',
          'customerLocations',
        )
        .leftJoinAndSelect('customerUser.customer', 'customer')
        .where('customerUser.company = :company', { company })
        .andWhere('customer.id = :customerId', { customerId })
        .orderBy('customerUser.name', 'ASC')
        .addOrderBy('customerLocations.id', 'ASC');
      result = await query.getMany();
    }

    if (location > 0) {
      result = result.filter((user) => {
        let locationIds = user.customerLocations.map(
          (customerLocation) => customerLocation.id,
        );
        return locationIds.includes(location);
      });
    }

    return result;
  }

  async getAllCustomerUsers(customerId: number, company: string) {
    return await this.customerUserRepository.find({
      where: { company: company, customer: { id: customerId } },
      relations: ['customer', 'customerRoles', 'customerLocations'],
    });
  }

  async updateUser(userData): Promise<CustomerUserEntity> {
    var user: CustomerUserEntity = await this.customerUserRepository.findOneBy({
      id: userData.id,
    });
    if (user) {
      var updatedUser = new CustomerUserEntity(userData);
      return await this.customerUserRepository.save(updatedUser);
    } else {
      throw new NotFoundException(`User not found`);
    }
  }

  async createNewCustomerUser(
    name: string,
    email: string,
    password: string,
    company: string,
    customerId?: number,
    customerRoleId?: number,
    customerLocationId?: number,
  ): Promise<CustomerUserEntity> {
    console.log(
      '🚀 ~ CustomerUserService ~ createNewCustomerUser ~ customerLocationId:',
      customerLocationId,
    );
    // Check if email already exists
    const existingUser = await this.customerUserRepository.findOneBy({ email });
    if (existingUser) {
      throw new HttpException('Email already exists', HttpStatus.CONFLICT);
    }

    // Create new customer user
    const newCustomerUser = new CustomerUserEntity();
    newCustomerUser.name = name;
    newCustomerUser.email = email;
    newCustomerUser.password = password;
    newCustomerUser.company = company;

    // If customerId is provided, associate with customer
    if (customerId) {
      const customer = await this.customerRepository.findOneBy({
        id: customerId,
      });
      if (!customer) {
        throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
      }
      newCustomerUser.customer = customer;
    }

    // If customerRoleId is provided, associate with customer role
    if (customerRoleId) {
      const customerRole = await this.customerRoleRepository.findOneBy({
        id: customerRoleId,
      });
      if (!customerRole) {
        throw new HttpException(
          'Customer role not found',
          HttpStatus.NOT_FOUND,
        );
      }
      newCustomerUser.customerRoles = [customerRole];
    }

    // If customerLocationId is provided, associate with customer location
    if (customerLocationId) {
      const customerLocation = await this.customerLocationRepository.findOneBy({
        id: customerLocationId,
      });
      if (!customerLocation) {
        throw new HttpException(
          'Customer location not found',
          HttpStatus.NOT_FOUND,
        );
      }
      newCustomerUser.customerLocations = [customerLocation];
    }

    try {
      const savedUser = await this.customerUserRepository.save(newCustomerUser);
      delete savedUser.password;
      return savedUser;
    } catch (error) {
      console.log(
        '🚀🚀🚀 ~ CustomerUserService ~ createNewCustomerUser ~ error:',
        error,
      );
      throw new HttpException(
        'Failed to create customer user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async setPassword(email: string, newPassword: string): Promise<boolean> {
    var customerUserFromDb = await this.customerUserRepository.findOneBy({
      email: email,
    });

    if (!customerUserFromDb)
      throw new HttpException('CUSTOMER_USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    const isOldPassword = await customerUserFromDb.checkPassword(newPassword);
    if (!isOldPassword) {
      customerUserFromDb.password = newPassword;
      await this.customerUserRepository.save(customerUserFromDb);
      return true;
    } else {
      throw new HttpException(
        'RESET_PASSWORD.SAME_AS_OLD_PASSWORD',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async getRecipientEmailList(item) {
    let userIdArray = item.recipientList.split(',');
    let allUsers = await this.customerUserRepository.find();
    let recipientArray = allUsers.filter((user) =>
      userIdArray.includes(String(user.id)),
    );
    let recipientEmailArray = recipientArray.map((user) => user.email);
    return recipientEmailArray;
  }
}
