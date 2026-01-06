import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService as JWT } from '@nestjs/jwt';
// import * as jwt from "jsonwebtoken";
import { default as config } from '../../config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwt: JWT) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const decodedToken = await this.jwt.verify(token, {
        secret: config.jwt.secretOrKey,
      });
      //check if token is expired
      const isExpired = Date.now() >= decodedToken.exp * 1000;
      if (isExpired) {
        throw new UnauthorizedException();
      } else {
        request['user'] = decodedToken;
      }
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
    } catch (error) {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
