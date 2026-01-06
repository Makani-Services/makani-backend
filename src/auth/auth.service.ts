import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import * as nodemailer from 'nodemailer';
import { Repository } from 'typeorm';
// import * as jwt from 'jsonwebtoken';
import { JwtService as JWT } from '@nestjs/jwt';

import { default as config } from '../config';
import { UserEntity } from '../user/entities/user.entity';
import { EmailVerificationEntity } from './entities/email-verification.entity';
import { ForgottenPasswordEntity } from './entities/forgotten-password.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JWTService } from './jwt.service';
import { API_URL, FRONTEND_URL } from 'src/core/common/common';
import { RefreshSessionEntity } from 'src/auth/entities/refreshSession.entity';
import { UserService } from 'src/user/user.service';
import { EmailService } from 'src/email/email.service';
import { CompanyService } from 'src/company/company.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JWTService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(EmailVerificationEntity)
    private emailVerificationRepository: Repository<EmailVerificationEntity>,
    @InjectRepository(ForgottenPasswordEntity)
    private forgottenPasswordRepository: Repository<ForgottenPasswordEntity>,
    @InjectRepository(RefreshSessionEntity)
    private sessionRepository: Repository<RefreshSessionEntity>,
    private jwt: JWT,
    private userService: UserService,
    private emailService: EmailService,
    private companyService: CompanyService,
  ) {}

  async login(email: string, password: string): Promise<UserEntity> {
    let user: UserEntity;

    try {
      user = await this.userRepository.findOne({
        where: { email },
        // relations: ['roles'],
      });
      if (!user.emailVerified) {
        throw new UnauthorizedException(`Email ${email} is not verified.`);
      }
    } catch (err) {
      throw new UnauthorizedException(
        `There isn't any user with email: ${email}`,
      );
    }

    if (!(await user.checkPassword(password))) {
      throw new UnauthorizedException(
        `Wrong password for user with email: ${email}`,
      );
    }
    delete user.password;
    delete user.emailVerified;

    return user;
  }

  public async refreshToken(req, res): Promise<any> {
    const cookies = req.cookies;
    const refreshToken = cookies.refreshToken;
    if (!refreshToken) {
      throw new HttpException('NO REFRESH TOKEN', HttpStatus.FORBIDDEN);
    }
    try {
      var decodedRefreshToken = await this.jwt.verify(refreshToken);
    } catch (err) {
      throw new UnauthorizedException();
    }

    let user: UserEntity = await this.userRepository.findOneBy({
      id: decodedRefreshToken.id,
    });

    let session: RefreshSessionEntity = await this.sessionRepository.findOne({
      where: { refreshToken: refreshToken },
    });
    if (!session) throw new UnauthorizedException();

    const accessToken = await this.jwtService.createAccessToken(user.id);
    const newRefreshToken = await this.jwtService.createRefreshToken(user.id);
    const decodeNewToken: any = this.jwt.decode(newRefreshToken.refresh_token);
    session.createdAt = decodeNewToken.iat;
    session.expiresIn = decodeNewToken.exp;
    session.refreshToken = newRefreshToken.refresh_token;

    res.cookie('refreshToken', newRefreshToken.refresh_token, {
      httpOnly: true,
      secure: true,
    });

    await this.sessionRepository.save(session);

    return {
      user,
      accessToken,
      refreshToken,
    };

    // const decoded = verifyJwt<{ sub: string }>(
    //   refresh_token,
    //   'refreshTokenPublicKey',
    // );

    return this.jwtService.createRefreshToken(req.email);
  }

  async verifyPayload(payload: JwtPayload): Promise<UserEntity> {
    let user: UserEntity;

    try {
      user = await this.userRepository.findOne({
        where: { email: payload.sub },
        relations: ['roles'],
      });
      if (!user.emailVerified) {
        throw new UnauthorizedException(
          `Email ${payload.sub} is not verified.`,
        );
      }
    } catch (error) {
      throw new UnauthorizedException(
        `There isn't any user with email: ${payload.sub}`,
      );
    }
    delete user.password;
    delete user.emailVerified;

    return user;
  }

  async validateLogin(
    email: string,
    password: string,
    // company: string,
    res: Response,
  ) {
    // Validate that email and company are not undefined
    if (!email || email === undefined) {
      throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
    }

    // if (!company || company === undefined) {
    //   throw new HttpException('Company is required', HttpStatus.BAD_REQUEST);
    // }

    const userFromDb = await this.userRepository.findOne({
      where: { email: email },
      relations: ['roles', 'roles.permissions', 'branches'],
    });

    if (!userFromDb)
      throw new HttpException(
        'Invalid Email or Password',
        HttpStatus.NOT_FOUND,
      );
    if (!userFromDb.emailVerified) {
      try {
        await this.createEmailToken(userFromDb.email);
      } catch (e) {
        throw e;
      }

      const sent = await this.sendEmailVerification(userFromDb.email);
      if (sent) {
        throw new HttpException(
          'Email address is not verified. Verification email sent!',
          HttpStatus.FORBIDDEN,
        );
      } else {
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    const isValidPass = await userFromDb.checkPassword(password);
    if (isValidPass) {
      // const accessToken = await this.jwtService.createToken(
      //   email,
      //   userFromDb.roles,
      // );

      if (!userFromDb.isEnabled) {
        throw new HttpException(
          'Your account is archived',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const accessToken = await this.jwtService.createAccessToken(
        userFromDb.id,
      );
      const refreshToken = await this.jwtService.createRefreshToken(
        userFromDb.id,
      );

      //get business
      // const businessItem = await this.userbusinessService.getBusinessByEmail(
      //   email,
      // );
      // userFromDb['business'] = businessItem.business;

      //get company info if user has company field
      // if (userFromDb.company) {
      //   const companyItem = await this.companyService.getOneCompany(
      //     userFromDb.company,
      //   );
      //   userFromDb['companyInfo'] = companyItem;
      // }

      await this.createRefreshSession(
        userFromDb.id,
        refreshToken.refresh_token,
      );

      res.cookie('refreshToken', refreshToken.refresh_token, {
        httpOnly: true,
        secure: true,
      });

      return {
        user: userFromDb,
        accessToken: accessToken.access_token,
      };

      // return { token: accessToken, user: userFromDb };
    } else {
      throw new HttpException(
        'Invalid Email or Password',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async createRefreshSession(userId: any, refreshToken: string) {
    const session = new RefreshSessionEntity();

    const decodeToken: any = this.jwt.decode(refreshToken);

    session.user = userId;
    session.refreshToken = refreshToken;
    session.expiresIn = decodeToken.exp;
    session.createdAt = decodeToken.iat;

    return await this.sessionRepository.save(session);
  }

  async createEmailToken(email: string): Promise<boolean> {
    const emailVerification = await this.emailVerificationRepository.findOneBy({
      email: email,
    });
    if (emailVerification) {
      const passedMinutes =
        (new Date().getTime() - emailVerification.timestamp.getTime()) / 60000;
      if (passedMinutes < 15) {
        throw new HttpException(
          'Verification email sent recently',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } else {
      const newEmailVerification = new EmailVerificationEntity();
      newEmailVerification.email = email;
      newEmailVerification.emailToken = (
        Math.floor(Math.random() * 9000000) + 1000000
      ).toString(); //Generate 7 digits number
      newEmailVerification.timestamp = new Date();
      try {
        await this.emailVerificationRepository.save(newEmailVerification);
        return true;
      } catch (e) {
        throw new HttpException(
          'Verification email sent recently',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return false;
    }
  }

  async verifyEmail(token: string): Promise<boolean> {
    const emailVerif = await this.emailVerificationRepository.findOneBy({
      emailToken: token,
    });
    if (emailVerif && emailVerif.email) {
      const userFromDb = await this.userRepository.findOne({
        where: { email: emailVerif.email },
      });
      if (userFromDb) {
        userFromDb.emailVerified = true;
        const savedUser = await this.userRepository.save(userFromDb);
        await this.emailVerificationRepository.remove(emailVerif);
        return !!savedUser;
      }
    } else {
      throw new HttpException(
        'This link is expired',
        // 'LOGIN.EMAIL_CODE_NOT_VALID',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async createForgottenPasswordToken(
    email: string,
  ): Promise<ForgottenPasswordEntity> {
    const forgottenPassword = await this.forgottenPasswordRepository.findOneBy({
      email: email,
    });
    if (
      forgottenPassword &&
      (new Date().getTime() - forgottenPassword.timestamp.getTime()) / 60000 <
        15
    ) {
      throw new HttpException(
        // 'RESET_PASSWORD.EMAIL_SENT_RECENTLY',
        'Reset password email sent recently',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } else {
      const newEntity = new ForgottenPasswordEntity();
      newEntity.email = email;
      (newEntity.newPasswordToken = (
        Math.floor(Math.random() * 9000000) + 1000000
      ).toString()), //Generate 7 digits number;
        (newEntity.timestamp = new Date());
      await this.forgottenPasswordRepository.upsert(newEntity, {
        conflictPaths: { email: true },
      });
      if (newEntity) {
        return newEntity;
      } else {
        throw new HttpException(
          'LOGIN.ERROR.GENERIC_ERROR',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async getForgottenPasswordModel(
    newPasswordToken: string,
  ): Promise<ForgottenPasswordEntity> {
    return await this.forgottenPasswordRepository.findOneBy({
      newPasswordToken: newPasswordToken,
    });
  }

  async sendEmailVerification(email: string): Promise<boolean> {
    const model = await this.emailVerificationRepository.findOneBy({
      email: email,
    });

    if (model && model.emailToken) {
      const mailOptions = {
        from: config.mail.supportEmail,
        to: email, // list of receivers (separated by ,)
        subject: 'Verify Email',
        text: 'Verify Email',
        html:
          'Hi! <br><br> Thanks for your registration<br><br>' +
          '<a href="' +
          API_URL +
          '/api/auth/verify/' +
          model.emailToken +
          '">Click here to activate your account</a>', // html body
      };

      let result = false;
      try {
        result = await this.emailService.sendEmail(mailOptions);
      } catch (error) {
        console.log('Email Sending Error: ', error);
      }
      return result;
    } else {
      throw new HttpException(
        'REGISTER.USER_NOT_REGISTERED',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async checkPassword(email: string, password: string) {
    const userFromDb = await this.userRepository.findOneBy({ email: email });
    if (!userFromDb)
      throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    return userFromDb.checkPassword(password);
  }

  async sendEmailForgotPassword(email: string): Promise<boolean> {
    const userFromDb = await this.userRepository.findOneBy({ email: email });
    if (!userFromDb)
      throw new HttpException('Invalid email address', HttpStatus.NOT_FOUND);

    const tokenModel = await this.createForgottenPasswordToken(email);

    if (tokenModel && tokenModel.newPasswordToken) {
      const mailOptions = {
        from: config.mail.supportEmail,
        to: email, // list of receivers (separated by ,)
        subject: 'Fogotten Password',
        text: 'Forgot Password',
        html:
          'Hi! <br><br> If you requested to reset your password<br><br>' +
          '<a href="' +
          FRONTEND_URL +
          '/resetpassword/' +
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
