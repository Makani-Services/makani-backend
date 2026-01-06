import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Header,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { ResponseError, ResponseSuccess } from '../core/dto/response.dto';
import { UserEntity } from '../user/entities/user.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgottenPasswordEntity } from './entities/forgotten-password.entity';
import { IResponse } from './interfaces/response.interface';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common/decorators';
import { Request } from 'express';

@ApiTags('Auth Management')
@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    @InjectRepository(ForgottenPasswordEntity)
    private readonly forgottenPasswordRepository: Repository<ForgottenPasswordEntity>,
  ) {}

  @Post('register')
  // @HttpCode(HttpStatus.CREATED)
  @ApiOkResponse({ type: () => UserEntity })
  async register(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    try {
      const newUser = await this.userService.createNewUser(createUserDto);
      await this.authService.createEmailToken(newUser.email);

      //await this.authService.saveUserConsent(newUser.email); //[GDPR user content]

      const sent = await this.authService.sendEmailVerification(newUser.email);
      // return new ResponseSuccess('REGISTRATION.USER_REGISTERED_SUCCESSFULLY');
      return newUser;

      // if (sent) {
      //   return new ResponseSuccess('REGISTRATION.USER_REGISTERED_SUCCESSFULLY');
      // } else {
      //   return new ResponseError('REGISTRATION.ERROR.MAIL_NOT_SENT');
      // }
    } catch (error) {
      throw error;
    }
  }

  @Post('refresh_token')
  // @UseGuards(JwtAuthGuard)
  // public async refresh(@Body() user: UserEntity): Promise<IResponse> {
  public async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    try {
      const response = this.authService.refreshToken(req, res);
      return response;
    } catch (error) {
      throw error;
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(
    @Body() login: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    try {
      const response = await this.authService.validateLogin(
        login.email,
        login.password,
        // login.company,
        res,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  @Get('verify/:token')
  public async verifyEmail(@Param() params): Promise<string> {
    try {
      const isEmailVerified = await this.authService.verifyEmail(params.token);
      if (isEmailVerified) {
        return 'Your email address is verified. please try to log in';
      } else {
        return 'Something went wrong';
      }
    } catch (error) {
      return error.message;
      // throw new HttpException(error.message, error.status);
    }
  }

  @Get('resend-verification/:email')
  public async sendEmailVerification(@Param() params): Promise<boolean> {
    try {
      await this.authService.createEmailToken(params.email);
      const isEmailSent = await this.authService.sendEmailVerification(
        params.email,
      );

      return isEmailSent;
      // if (isEmailSent) {
      //   return new ResponseSuccess('LOGIN.EMAIL_RESENT', null);
      // } else {
      //   throw new HttpException(
      //     'LOGIN.ERROR.SEND_EMAIL!',
      //     HttpStatus.INTERNAL_SERVER_ERROR,
      //   );
      // }
    } catch (error) {
      throw new HttpException(
        'LOGIN.ERROR.SEND_EMAIL!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('forgot-password/:email')
  public async sendEmailForgotPassword(@Param() params): Promise<boolean> {
    try {
      const isEmailSent = await this.authService.sendEmailForgotPassword(
        params.email,
      );
      return isEmailSent;
      // if (isEmailSent) {
      //   return new ResponseSuccess('LOGIN.EMAIL_RESENT', null);
      // } else {
      //   throw new HttpException(
      //     'REGISTRATION.ERROR.MAIL_NOT_SENT!',
      //     HttpStatus.INTERNAL_SERVER_ERROR,
      //   );
      // }
    } catch (error) {
      throw error;
    }
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  public async setNewPassord(
    @Body() resetPassword: ResetPasswordDto,
  ): Promise<boolean> {
    try {
      let isNewPasswordChanged = false;
      if (resetPassword.email && resetPassword.currentPassword) {
        const isValidPassword = await this.authService.checkPassword(
          resetPassword.email,
          resetPassword.currentPassword,
        );
        if (isValidPassword) {
          isNewPasswordChanged = await this.userService.setPassword(
            resetPassword.email,
            resetPassword.newPassword,
          );
        } else {
          throw new HttpException(
            'RESET_PASSWORD.WRONG_CURRENT_PASSWORD!',
            HttpStatus.BAD_REQUEST,
          );
        }
      } else if (resetPassword.newPasswordToken) {
        const forgottenPasswordEntity =
          await this.authService.getForgottenPasswordModel(
            resetPassword.newPasswordToken,
          );
        isNewPasswordChanged = await this.userService.setPassword(
          forgottenPasswordEntity.email,
          resetPassword.newPassword,
        );
        if (isNewPasswordChanged)
          await this.forgottenPasswordRepository.remove(
            forgottenPasswordEntity,
          );
      } else {
        throw new HttpException('Bad request!', HttpStatus.BAD_REQUEST);
      }
      return isNewPasswordChanged;
    } catch (error) {
      throw error;
      // throw new HttpException(
      //   'RESET_PASSWORD.CHANGE_PASSWORD_ERROR!',
      //   HttpStatus.INTERNAL_SERVER_ERROR,
      // );
    }
  }
}
