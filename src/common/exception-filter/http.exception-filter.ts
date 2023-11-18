import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): any {
    const context = host.switchToHttp();
    const request = context.getRequest();
    const response = context.getResponse();
    // Crashlytics, Sentry등 호출

    response.status(exception.getStatus()).json({
      statusCode: exception.getStatus(),
      message: exception.message,
      timestamp: new Date().toLocaleString('kr'),
      path: request.url,
    });
  }
}
