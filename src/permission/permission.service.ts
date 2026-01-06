import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { PermissionEntity } from './entities/permission.entity';

@Injectable()
export class PermissionService extends TypeOrmCrudService<PermissionEntity> {
  constructor(@InjectRepository(PermissionEntity) repo: Repository<PermissionEntity>) {
    super(repo);
  }
}
