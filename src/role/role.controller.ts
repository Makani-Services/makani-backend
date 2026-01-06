import { Controller } from '@nestjs/common';
import {
  Body,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
  Query,
} from '@nestjs/common/decorators';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permissions } from 'src/core/decorators/permissions.decorator';
import { UniqueConstraintInterceptor } from 'src/core/interceptors/unique-constraint.interceptor';
import { RoleDeleteDto } from './dto/role.delete';
import { RoleDto } from './dto/role.dto';
import { RoleInputDto } from './dto/role.input';
import { RoleUpdateDto } from './dto/role.update';
import { RoleService } from './role.service';

@ApiTags('Settings - Role Management')
@Controller('/api/settings/role')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@UseInterceptors(UniqueConstraintInterceptor)
export class RoleController {
  constructor(public service: RoleService) {}

  @Get('getAll')
  // @Permissions(['ROLE:READ'])
  @ApiOkResponse({ type: () => Array<RoleDto> })
  async getAll(@Query() query: any): Promise<RoleDto[]> {
    return await this.service.customGetAll();
  }

  // createOne
  @Post('createOne')
  // @Permissions('Administrator')
  @ApiOkResponse({ type: () => RoleInputDto })
  async createOne(@Body() payload: RoleInputDto): Promise<RoleDto> {
    return await this.service.customCreateOne(payload);
  }

  // deleteOne
  @Post('deleteOne')
  // @Permissions('Administrator')
  @ApiOkResponse({ type: () => Boolean })
  async deleteOne(@Body() payload: RoleDeleteDto): Promise<boolean> {
    return await this.service.customDeleteOne(payload);
  }

  // updateOne
  @Post('updateOne')
  // @Permissions('Administrator')
  @ApiOkResponse({ type: () => RoleUpdateDto })
  async updateOne(@Body() payload: RoleUpdateDto): Promise<RoleDto> {
    return await this.service.customUpdateOne(payload);
  }
}
