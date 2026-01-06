import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { GetUser } from 'src/core/decorators/getUser.decorator';
import { RoleEntity } from 'src/role/entities/role.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { PERMISSIONS_KEY } from '../../core/decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(
      PERMISSIONS_KEY,
      context.getHandler(),
    );
    // console.log(' ~ requiredPermissions:', requiredPermissions);
    if (!requiredPermissions) {
      return true;
    }
    const { user: userPayload } = context.switchToHttp().getRequest();

    // console.log('User:', userPayload);

    const user = await this.userRepository.findOne({
      where: {
        id: userPayload.id,
      },
      relations: ['roles', 'roles.permissions'],
    });
    const roleId = user.roles.at(0)?.id || 0;
    if (!roleId) return false;

    const userPermissionDescriptions = (
      await this.roleRepository.findOne({
        where: {
          id: roleId,
        },
        relations: ['permissions'],
      })
    ).permissions.map((permission) => permission.description);

    // console.log('userPermissionDescriptions:', userPermissionDescriptions);

    const unauthorized =
      requiredPermissions.filter(
        (requiredPermission) =>
          !userPermissionDescriptions.includes(requiredPermission),
      ).length > 0;

    return !unauthorized;
  }
}
