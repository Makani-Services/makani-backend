import {
  Controller,
  NotFoundException,
  Post,
  Query,
  Bind,
  Body,
  Get,
  UploadedFile,
  ParseFilePipeBuilder,
  Headers,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { diskStorage } from 'multer';
import { Param, UseGuards, UseInterceptors } from '@nestjs/common/decorators';
import { ApiTags } from '@nestjs/swagger';
// import {
//   Crud,
//   CrudRequest,
//   Override,
//   ParsedBody,
//   ParsedRequest,
// } from '@nestjsx/crud';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { UniqueConstraintInterceptor } from 'src/core/interceptors/unique-constraint.interceptor';
import { UserRoleUpdateDto } from './dto/user-role-update.dto';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';
import { ResponseError, ResponseSuccess } from '../core/dto/response.dto';
import { IResponse } from '../auth/interfaces/response.interface';
import { Permissions } from 'src/core/decorators/permissions.decorator';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors';
import { Not, In } from 'typeorm';
import { PusherService } from '../pusher/pusher.service';

// @Permissions('Administrator')
@UseGuards(JwtAuthGuard, PermissionsGuard)
// @Crud({
//   model: {
//     type: UserEntity,
//   },
//   routes: {
//     only: ['deleteOneBase', 'getManyBase', 'updateOneBase'],
//   },
//   query: {
//     join: {
//       roles: { allow: [] },
//     },
//   },
// })
@ApiTags('User Management')
@Controller('api/user')
@UseInterceptors(UniqueConstraintInterceptor)
export class UserController {
  // constructor parameter variable name MUST be "service" when using @nestjsx/crud
  constructor(
    public service: UserService,
    private pusherService: PusherService,
  ) { }

  @Get('getAll')
  // @Permissions(['USER:READ'])
  async getAll(@Query() query: any, @Headers() headers: any) {
    if (query.role) {
      return await this.service.getAllUsers(
        query.branchId,
        query.role,
        headers.company,
      );
    } else {
      return await this.service.getAllUsers(
        query.branchId,
        null,
        headers.company,
      );
    }
  }

  @Get('getusersbyrole')
  async getUsersWithRole(@Query() query: any, @Headers() headers: any) {
    if (query.role) {
      return await this.service.getUsersWithRole(
        query.role,
        query.branchId,
        headers.company,
      );
    }
  }

  @Post('get_users')
  @Permissions(['USER:READ'])
  async getUsers(@Body() body: any) {
    var ids = [];
    for (let user of body.ids) {
      ids.push(user.userId);
    }
    return await this.service.getUsers(ids);
  }

  // @Override('updateOneBase')
  // @Permissions('Administrator')
  @Post('update_user')
  async updateOne(@Body() body: any) {
    const result = await this.service.updateUser(body.user);
    if (result) {
      try {
        this.pusherService.sendPushNotification(
          [result.email],
          '',
          'User updated',
          { type: 'USER_UPDATED' },
        );
      } catch (error) {
        console.log('Error sending push notification for user update:', error);
      }
    }
    return result;
  }

  @Get('get-a-user-by-id')
  async getUserById(@Query() query: any) {
    if (query.userId) {
      return await this.service.getUserById(query.userId);
    }
  }

  // @Override('deleteOneBase')
  @Post('delete')
  // @Permissions(['USER:CREATE'])
  async deleteOne(@Body() body: any) {
    return await this.service.deleteOneUser(body.userId);
  }

  @Post('restore')
  async RestoreOne(@Body() body: any) {
    return await this.service.restoreOneUser(body.userId);
  }

  @Post('update_users')
  // @Permissions(['USER:CREATE'])
  async updates(@Body() body: any) {
    return await this.service.updateUsers(body.user_data);
  }

  @Get('check-has-logged-hours-today')
  async checkHasLoggedHoursToday(@Query() query: any) {
    return await this.service.checkHasLoggedHoursToday(query.userId);
  }

  @Post('confirm-logged-hours')
  async confirmLoggedHours(@Body() body: any) {
    return await this.service.confirmLoggedHours(body.userId);
  }

  @Get('generate_excel_for_team_manage')
  async generateExcelForTeamManage(
    @Query() query: any,
    @Headers() headers: any,
  ) {
    const branch = query.branch;
    return await this.service.generateExcelForTeamManage(
      Number(branch),
      headers.company,
    );
  }

  // @UseInterceptors(FileInterceptor('file'))
  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        // destination: 'public/avatars',
        destination: (req, file, cb) => {
          const company = req.headers['company'];
          const destinationPath = `public/${company}/avatars`;
          cb(null, destinationPath);
        },
        filename: (req, file, cb) => {
          file.originalname = Buffer.from(file.originalname, 'latin1').toString(
            'utf8',
          );
          // Generate a custom filename here
          const customFileName = new Date().getTime().toString();
          cb(null, customFileName + '.png');
        },
      }),
    }),
  )
  uploadFile(
    @Body() body: { id: string },
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          // fileType: /(jpg|jpeg|png|gif|jfif)$/,
          fileType: '.(png|jpeg|jpg)',
        })
        .addMaxSizeValidator({
          maxSize: 1024 * 1024 * 2,
        })
        .build({
          fileIsRequired: true,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.service.uploadFile(file.filename, Number(body.id));

    // if (file.mimetype == 'image/png' || file.mimetype == 'image/jpeg') {
    //   const base64String = file.buffer.toString();
    // } else {
    //   throw new BadRequestException();
    // }
  }
}
