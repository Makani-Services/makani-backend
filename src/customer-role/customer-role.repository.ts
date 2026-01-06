import { Repository } from 'typeorm';
import { CustomerRoleEntity } from './entities/customer-role.entity';

export class CustomerRoleRepository extends Repository<CustomerRoleEntity> {}
