import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { PermissionEntity } from "src/permission/entities/permission.entity";
import { PermissionRepository } from "src/permission/permission.repository";
import { FindOperator, Repository } from 'typeorm';
import { RoleDeleteDto } from "./dto/role.delete";
import { RoleInputDto } from "./dto/role.input";
import { RoleUpdateDto } from "./dto/role.update";
import { RoleEntity } from './entities/role.entity';

@Injectable()
export class RoleService extends TypeOrmCrudService<RoleEntity> {
  constructor(
    @InjectRepository(RoleEntity)
    repo: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    public permissionRepo: PermissionRepository
  ) {
    super(repo);
  }

  async customGetAll() {
    return await this.repo.find({
      relations: ["permissions"]
    });
  }

  async customCreateOne(
    payload: RoleInputDto
  ) {
    try {
      // role name should be unique
      const isRoleNameExists = await this.repo.exist({
        where: {
          name: payload.name
        }
      });
      if (isRoleNameExists) {
        throw new HttpException('Duplicated role name', HttpStatus.BAD_REQUEST);
      }

      // verify permissions of payload
      const permissions: PermissionEntity[] = [];
      for (const permissionId of payload.permissions) {
        const permission = await this.permissionRepo.findOneBy({
          id: permissionId
        });
        if (!permission) {
          throw new HttpException('Wrong permission is contained', HttpStatus.BAD_REQUEST);
        }
        permissions.push(permission);
      };

      // save into table
      const result = await this.repo.save({
        name: payload.name,
        permissions
      });
      return result;
    }
    catch (e) {
      console.error(e);
    }
  }

  async customUpdateOne(
    payload: RoleUpdateDto
  ) {
    try {
      // check existance of role dto
      const isRoleExists = await this.repo.exist({
        where: {
          id: payload.id
        }
      });
      if (!isRoleExists) {
        throw new HttpException('Role not found', HttpStatus.BAD_REQUEST);
      }
      // role name should be unique (don't compare with self role name)
      const isRoleNameExists = await this.repo.exist({
        where: {
          name: payload.name,
          id: new FindOperator("not", payload.id)
        }
      });
      if (isRoleNameExists) {
        throw new HttpException('Duplicated role name', HttpStatus.BAD_REQUEST);
      }

      // verify permissions of payload
      const permissions: PermissionEntity[] = [];
      for (const permissionId of payload.permissions) {
        const permission = await this.permissionRepo.findOneBy({
          id: permissionId
        });
        if (!permission) {
          throw new HttpException('Wrong permission is contained', HttpStatus.BAD_REQUEST);
        }
        permissions.push(permission);
      };

      // save into table
      const result = await this.repo.save({
        ...payload,
        permissions
      });
      return result;
    }
    catch (e) {
      console.error(e);
    }
  }

  async customDeleteOne(
    payload: RoleDeleteDto
  ) {
    try {
      // check existance of role dto
      const isRoleExists = await this.repo.exist({
        where: {
          id: payload.id
        }
      });
      if (!isRoleExists) {
        throw new HttpException('Role not found', HttpStatus.BAD_REQUEST);
      }
      // delete from table
      const result = await this.repo.delete(payload.id);
      return !!result;
    }
    catch (e) {
      console.error(e);
    }
  }
}
