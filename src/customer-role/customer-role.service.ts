import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerRoleEntity } from './entities/customer-role.entity';
import { CustomerRoleInputDto } from './dto/customer-role.input';
import { CustomerRoleUpdateDto } from './dto/customer-role.update';
import { CustomerRoleDeleteDto } from './dto/customer-role.delete';
import { CustomerRoleDto } from './dto/customer-role.dto';

@Injectable()
export class CustomerRoleService {
  constructor(
    @InjectRepository(CustomerRoleEntity)
    private customerRoleRepo: Repository<CustomerRoleEntity>,
  ) {}

  async getAll(company: string): Promise<CustomerRoleDto[]> {
    return await this.customerRoleRepo.find({
      where: { company },
      relations: ['customerUsers', 'customerInvites'],
    });
  }

  async getById(id: number, company: string): Promise<CustomerRoleDto> {
    const customerRole = await this.customerRoleRepo.findOne({
      where: { id, company },
      relations: ['customerUsers', 'customerInvites'],
    });

    if (!customerRole) {
      throw new HttpException('Customer role not found', HttpStatus.NOT_FOUND);
    }

    return customerRole;
  }

  async createOne(
    payload: CustomerRoleInputDto,
    company: string,
  ): Promise<CustomerRoleDto> {
    try {
      // Check if role name already exists for this company
      const existingRole = await this.customerRoleRepo.findOne({
        where: { name: payload.name, company },
      });

      if (existingRole) {
        throw new HttpException(
          'Role name already exists',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Create new customer role
      const result = await this.customerRoleRepo.save({
        name: payload.name,
        company,
      });

      return result;
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
      console.error(e);
      throw new HttpException(
        'Failed to create customer role',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateOne(
    payload: CustomerRoleUpdateDto,
    company: string,
  ): Promise<CustomerRoleDto> {
    try {
      // Check if customer role exists
      const existingRole = await this.customerRoleRepo.findOne({
        where: { id: payload.id, company },
      });

      if (!existingRole) {
        throw new HttpException(
          'Customer role not found',
          HttpStatus.NOT_FOUND,
        );
      }

      // Check if role name already exists (excluding current role) for this company
      const duplicateRole = await this.customerRoleRepo.findOne({
        where: {
          name: payload.name,
          company,
          id: { not: payload.id } as any,
        },
      });

      if (duplicateRole) {
        throw new HttpException(
          'Role name already exists',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Update customer role
      const result = await this.customerRoleRepo.save({
        ...existingRole,
        name: payload.name,
      });

      return result;
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
      console.error(e);
      throw new HttpException(
        'Failed to update customer role',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteOne(
    payload: CustomerRoleDeleteDto,
    company: string,
  ): Promise<boolean> {
    try {
      // Check if customer role exists
      const existingRole = await this.customerRoleRepo.findOne({
        where: { id: payload.id, company },
        relations: ['customerUsers', 'customerInvite'],
      });

      if (!existingRole) {
        throw new HttpException(
          'Customer role not found',
          HttpStatus.NOT_FOUND,
        );
      }

      // Check if role is assigned to any users or invites
      if (
        (existingRole.customerUsers && existingRole.customerUsers.length > 0) ||
        (existingRole.customerInvites &&
          existingRole.customerInvites.length > 0)
      ) {
        throw new HttpException(
          'Cannot delete role that is assigned to users or invites',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Delete customer role
      await this.customerRoleRepo.remove(existingRole);
      return true;
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
      console.error(e);
      throw new HttpException(
        'Failed to delete customer role',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
