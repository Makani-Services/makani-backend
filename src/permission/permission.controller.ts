import { Controller } from '@nestjs/common';
import { UseGuards, UseInterceptors } from '@nestjs/common/decorators';
import { ApiTags } from '@nestjs/swagger';
import {
  Crud,
  CrudRequest,
  Override,
  ParsedBody,
  ParsedRequest,
} from '@nestjsx/crud';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permissions } from 'src/core/decorators/permissions.decorator';
import { UniqueConstraintInterceptor } from 'src/core/interceptors/unique-constraint.interceptor';
import { PermissionCreateDto } from './dto/permission-create.dto';
import { PermissionEntity } from './entities/permission.entity';
import { PermissionService } from './permission.service';

@Crud({
  model: {
    type: PermissionEntity,
  },
  routes: {
    only: ['getOneBase', 'getManyBase', 'createOneBase'],
  },
  query: {
    join: {
      roles: { allow: [] },
      menus: { allow: [] },
    },
  },
})
@ApiTags('Settings - Permission Management')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('settings/permission')
@UseInterceptors(UniqueConstraintInterceptor)
export class PermissionController {
  constructor(public service: PermissionService) {}

  @Override('createOneBase')
  // @Permissions("Administrator")
  async createOne(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: PermissionCreateDto,
  ) {
    return await this.service.createOne(req, dto);
  }
}
