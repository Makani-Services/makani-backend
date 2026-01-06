import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResponseError, ResponseSuccess } from '../core/dto/response.dto';
import { CustomerUserEntity } from '../customer-user/entities/customer-user.entity';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerLoginDto } from './dto/customer-login.dto';
import { CustomerResetPasswordDto } from './dto/customer-reset-password.dto';
import { CustomerSignupDto } from './dto/customer-signup.dto';
import { CustomerForgottenPasswordEntity } from './entities/customer-forgotten-password.entity';
import { Request } from 'express';
import { CustomerUserService } from 'src/customer-user/customer-user.service';

@ApiTags('Customer Auth Management')
@Controller('api/customer-auth')
export class CustomerAuthController {
  constructor(
    private readonly customerAuthService: CustomerAuthService,
    private readonly customerUserService: CustomerUserService,
    @InjectRepository(CustomerForgottenPasswordEntity)
    private readonly customerForgottenPasswordRepository: Repository<CustomerForgottenPasswordEntity>,
  ) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponse({ type: () => CustomerUserEntity })
  async signup(
    @Body() signupDto: CustomerSignupDto,
  ): Promise<CustomerUserEntity> {
    try {
      const newCustomerUser =
        await this.customerUserService.createNewCustomerUser(
          signupDto.name,
          signupDto.email,
          signupDto.password,
          signupDto.company,
          signupDto.customerId,
        );
      return newCustomerUser;
    } catch (error) {
      throw error;
    }
  }

  @Post('refresh_token')
  public async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    try {
      const response = this.customerAuthService.refreshToken(req, res);
      return response;
    } catch (error) {
      throw error;
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(
    @Body() login: CustomerLoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    try {
      const response = await this.customerAuthService.validateLogin(
        login.email,
        login.password,
        login.company,
        res,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  @Get('forgot-password/:email')
  public async sendEmailForgotPassword(@Param() params): Promise<boolean> {
    try {
      const isEmailSent =
        await this.customerAuthService.sendEmailForgotPassword(params.email);
      return isEmailSent;
    } catch (error) {
      throw error;
    }
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  public async setNewPassword(
    @Body() resetPassword: CustomerResetPasswordDto,
  ): Promise<boolean> {
    try {
      let isNewPasswordChanged = false;
      if (resetPassword.email && resetPassword.currentPassword) {
        const isValidPassword = await this.customerAuthService.checkPassword(
          resetPassword.email,
          resetPassword.currentPassword,
        );
        if (isValidPassword) {
          isNewPasswordChanged = await this.customerUserService.setPassword(
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
          await this.customerAuthService.getForgottenPasswordModel(
            resetPassword.newPasswordToken,
          );
        isNewPasswordChanged = await this.customerUserService.setPassword(
          forgottenPasswordEntity.email,
          resetPassword.newPassword,
        );
        if (isNewPasswordChanged)
          await this.customerForgottenPasswordRepository.remove(
            forgottenPasswordEntity,
          );
      } else {
        throw new HttpException('Bad request!', HttpStatus.BAD_REQUEST);
      }
      return isNewPasswordChanged;
    } catch (error) {
      throw error;
    }
  }
}
