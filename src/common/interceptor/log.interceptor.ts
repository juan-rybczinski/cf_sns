import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const startTime = new Date();

    const route = context.switchToHttp().getRequest().originalUrl;
    console.log(
      `[REQ] ${route} Start Time : ${startTime.toLocaleString('kr')}`,
    );

    return next
      .handle()
      .pipe(
        tap(() =>
          console.log(
            `[RES] ${route} End Time : ${new Date().toLocaleString(
              'kr',
            )} End Time : ${
              new Date().getMilliseconds() - startTime.getMilliseconds()
            }ms`,
          ),
        ),
      );
  }
}
