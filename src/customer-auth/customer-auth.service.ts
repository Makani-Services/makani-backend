import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService as JWT } from '@nestjs/jwt';

import { default as config } from '../config';
import { CustomerUserEntity } from '../customer-user/entities/customer-user.entity';
import { CustomerForgottenPasswordEntity } from './entities/customer-forgotten-password.entity';
import { CustomerJWTService } from './customer-jwt.service';
import { CustomerRefreshSessionEntity } from './entities/customer-refresh-session.entity';
import { CustomerUserService } from 'src/customer-user/customer-user.service';
import { EmailService } from 'src/email/email.service';
import {
  API_URL,
  CUSTOMER_FRONTEND_URL,
  FRONTEND_URL,
} from 'src/core/common/common';

@Injectable()
export class CustomerAuthService {
  constructor(
    private readonly customerJwtService: CustomerJWTService,
    @InjectRepository(CustomerUserEntity)
    private readonly customerUserRepository: Repository<CustomerUserEntity>,
    @InjectRepository(CustomerForgottenPasswordEntity)
    private customerForgottenPasswordRepository: Repository<CustomerForgottenPasswordEntity>,
    @InjectRepository(CustomerRefreshSessionEntity)
    private customerSessionRepository: Repository<CustomerRefreshSessionEntity>,
    private jwt: JWT,
    private customerUserService: CustomerUserService,
    private emailService: EmailService,
  ) {}

  async login(email: string, password: string): Promise<CustomerUserEntity> {
    let customerUser: CustomerUserEntity;

    try {
      customerUser = await this.customerUserRepository.findOne({
        where: { email },
        relations: ['customer'],
      });
    } catch (err) {
      throw new UnauthorizedException(
        `There isn't any customer user with email: ${email}`,
      );
    }

    if (!customerUser) {
      throw new UnauthorizedException(
        `There isn't any customer user with email: ${email}`,
      );
    }

    if (!customerUser.password) {
      throw new UnauthorizedException(
        `Customer user account is not fully set up. Please contact support.`,
      );
    }

    if (!(await customerUser.checkPassword(password))) {
      throw new UnauthorizedException(
        `Wrong password for customer user with email: ${email}`,
      );
    }

    delete customerUser.password;
    return customerUser;
  }

  public async refreshToken(req, res): Promise<any> {
    const cookies = req.cookies;
    const refreshToken = cookies.customerRefreshToken;
    if (!refreshToken) {
      throw new HttpException('NO REFRESH TOKEN', HttpStatus.FORBIDDEN);
    }
    try {
      var decodedRefreshToken = await this.jwt.verify(refreshToken);
    } catch (err) {
      throw new UnauthorizedException();
    }

    let customerUser: CustomerUserEntity =
      await this.customerUserRepository.findOneBy({
        id: decodedRefreshToken.id,
      });

    let session: CustomerRefreshSessionEntity =
      await this.customerSessionRepository.findOne({
        where: { refreshToken: refreshToken },
      });
    if (!session) throw new UnauthorizedException();

    const accessToken = await this.customerJwtService.createAccessToken(
      customerUser.id,
    );
    const newRefreshToken = await this.customerJwtService.createRefreshToken(
      customerUser.id,
    );
    const decodeNewToken: any = this.jwt.decode(newRefreshToken.refresh_token);
    session.createdAt = decodeNewToken.iat;
    session.expiresIn = decodeNewToken.exp;
    session.refreshToken = newRefreshToken.refresh_token;

    res.cookie('customerRefreshToken', newRefreshToken.refresh_token, {
      httpOnly: true,
      secure: true,
    });

    await this.customerSessionRepository.save(session);

    return {
      customerUser,
      accessToken,
      refreshToken,
    };
  }

  async validateLogin(
    email: string,
    password: string,
    company: string,
    res: Response,
  ) {
    const customerUserFromDb = await this.customerUserRepository.findOne({
      where: { email: email, company: company },
      relations: [
        'customer',
        'customer.branch',
        'customerRoles',
        'customerLocations',
      ],
    });

    if (!customerUserFromDb)
      throw new HttpException(
        'Invalid Email or Password',
        HttpStatus.NOT_FOUND,
      );

    if (!customerUserFromDb.isEnabled) {
      throw new HttpException(
        'Your account is disabled',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!customerUserFromDb.password) {
      throw new HttpException(
        'Customer user account is not fully set up. Please contact support.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isValidPass = await customerUserFromDb.checkPassword(password);
    if (isValidPass) {
      const accessToken = await this.customerJwtService.createAccessToken(
        customerUserFromDb.id,
      );
      const refreshToken = await this.customerJwtService.createRefreshToken(
        customerUserFromDb.id,
      );

      await this.createRefreshSession(
        customerUserFromDb.id,
        refreshToken.refresh_token,
      );

      res.cookie('customerRefreshToken', refreshToken.refresh_token, {
        httpOnly: true,
        secure: true,
      });

      return {
        customerUser: customerUserFromDb,
        accessToken: accessToken.access_token,
      };
    } else {
      throw new HttpException(
        'Invalid Email or Password',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async createRefreshSession(customerUserId: any, refreshToken: string) {
    const session = new CustomerRefreshSessionEntity();

    const decodeToken: any = this.jwt.decode(refreshToken);

    session.customerUser = customerUserId;
    session.refreshToken = refreshToken;
    session.expiresIn = decodeToken.exp;
    session.createdAt = decodeToken.iat;

    return await this.customerSessionRepository.save(session);
  }

  async createForgottenPasswordToken(
    email: string,
  ): Promise<CustomerForgottenPasswordEntity> {
    const forgottenPassword =
      await this.customerForgottenPasswordRepository.findOneBy({
        email: email,
      });
    if (
      forgottenPassword &&
      (new Date().getTime() - forgottenPassword.timestamp.getTime()) / 60000 <
        15
    ) {
      throw new HttpException(
        'Reset password email sent recently',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } else {
      const newEntity = new CustomerForgottenPasswordEntity();
      newEntity.email = email;
      (newEntity.newPasswordToken = (
        Math.floor(Math.random() * 9000000) + 1000000
      ).toString()), //Generate 7 digits number;
        (newEntity.timestamp = new Date());
      await this.customerForgottenPasswordRepository.upsert(newEntity, {
        conflictPaths: { email: true },
      });
      if (newEntity) {
        return newEntity;
      } else {
        throw new HttpException(
          'GENERIC_ERROR',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async getForgottenPasswordModel(
    newPasswordToken: string,
  ): Promise<CustomerForgottenPasswordEntity> {
    return await this.customerForgottenPasswordRepository.findOneBy({
      newPasswordToken: newPasswordToken,
    });
  }

  async checkPassword(email: string, password: string) {
    const customerUserFromDb = await this.customerUserRepository.findOneBy({
      email: email,
    });
    if (!customerUserFromDb)
      throw new HttpException('CUSTOMER_USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    return customerUserFromDb.checkPassword(password);
  }

  async sendEmailForgotPassword(email: string): Promise<boolean> {
    const customerUserFromDb = await this.customerUserRepository.findOneBy({
      email: email,
    });
    if (!customerUserFromDb)
      throw new HttpException('Invalid email address', HttpStatus.NOT_FOUND);

    const tokenModel = await this.createForgottenPasswordToken(email);

    if (tokenModel && tokenModel.newPasswordToken) {
      const mailOptions = {
        from: config.mail.supportEmail,
        to: email, // list of receivers (separated by ,)
        subject: 'Forgotten Password',
        text: 'Forgot Password',
        html:
          'Hi! <br><br> If you requested to reset your password<br><br>' +
          '<a href="' +
          CUSTOMER_FRONTEND_URL +
          '/reset-password/' +
          tokenModel.newPasswordToken +
          '">Click here</a>', // html body
      };

      let result = false;
      try {
        result = await this.emailService.sendEmail(mailOptions);
      } catch (error) {
        console.log('Email Sending Error: ', error);
      }
      return result;
    } else {
      throw new HttpException('Internal Server Error', HttpStatus.FORBIDDEN);
    }
  }
}
