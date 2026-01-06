import {
  CallHandler, ExecutionContext, Injectable,
  NestInterceptor, BadRequestException
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class UniqueConstraintInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        if (err.message.includes("duplicate key value violates unique constraint")) {
          return throwError(() => new BadRequestException('Duplicate key error'));
        }
        return throwError(() => err);
      }),
    );
  }
}
