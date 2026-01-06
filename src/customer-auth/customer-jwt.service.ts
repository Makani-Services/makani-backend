import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService as JWT } from '@nestjs/jwt';
import { CustomerUserEntity } from 'src/customer-user/entities/customer-user.entity';
import { Repository } from 'typeorm';
import { default as config } from '../config';
import { SignOptions } from 'jsonwebtoken';

@Injectable()
export class CustomerJWTService {
  constructor(
    @InjectRepository(CustomerUserEntity)
    private readonly customerUserRepository: Repository<CustomerUserEntity>,
    private jwt: JWT,
  ) {}

  async createAccessToken(customerUserId: number) {
    const expiresIn = +config.jwt.accessTokenexpiresIn;
    const userInfo = { id: customerUserId };
    const opts: SignOptions = {
      expiresIn: expiresIn,
    };
    const token = this.jwt.sign(userInfo, opts);
    return {
      expires_in: expiresIn,
      access_token: token,
    };
  }

  async createRefreshToken(customerUserId: number) {
    const expiresIn = +config.jwt.refreshTokenExpiresIn;
    const userInfo = { id: customerUserId };
    const opts: SignOptions = {
      expiresIn: expiresIn,
    };
    const token = this.jwt.sign(userInfo, opts);
    return {
      expires_in: expiresIn,
      refresh_token: token,
    };
  }

  async validateCustomerUser(
    signedUser: CustomerUserEntity,
  ): Promise<CustomerUserEntity> {
    const customerUserFromDb = await this.customerUserRepository.findOneBy({
      email: signedUser.email,
    });
    if (customerUserFromDb) {
      return customerUserFromDb;
    }
    return null;
  }
}
