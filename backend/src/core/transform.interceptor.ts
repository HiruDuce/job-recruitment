import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE } from '../decorator/customize';

export interface Response<T> {
  statusCode: number;
  message?: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const handler = context.getHandler();
    const message = this.reflector.get<string>(RESPONSE_MESSAGE, handler) ?? '';
    const res = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => ({
        statusCode: res.statusCode,
        message,
        data,
      })),
    );
  }
}
