import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// import * as jwt from 'jsonwebtoken';
import { JwtService as JWT } from '@nestjs/jwt';
import { RoleEntity } from 'src/role/entities/role.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { default as config } from '../config';
import { SignOptions } from 'jsonwebtoken';

@Injectable()
export class JWTService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private jwt: JWT,
  ) {}

  // async createToken(email: string, roles: RoleEntity[]) {
  async createAccessToken(userId: number) {
    const expiresIn = +config.jwt.accessTokenexpiresIn;
    // const secretOrKey = config.jwt.secretOrKey;
    const userInfo = { id: userId };
    const opts: SignOptions = {
      expiresIn: expiresIn,
    };
    const token = this.jwt.sign(userInfo, opts);
    return {
      expires_in: expiresIn,
      access_token: token,
    };
  }

  // async createToken(email: string, roles: RoleEntity[]) {
  async createRefreshToken(userId: number) {
    const expiresIn = +config.jwt.refreshTokenExpiresIn;
    // const secretOrKey = config.jwt.secretOrKey;
    const userInfo = { id: userId };
    const opts: SignOptions = {
      expiresIn: expiresIn,
      // subject: String(userId),
    };
    const token = this.jwt.sign(userInfo, opts);
    return {
      expires_in: expiresIn,
      refresh_token: token,
    };
  }

  async validateUser(signedUser: UserEntity): Promise<UserEntity> {
    const userFromDb = await this.userRepository.findOneBy({
      email: signedUser.email,
    });
    if (userFromDb) {
      return userFromDb;
    }
    return null;
  }
}
