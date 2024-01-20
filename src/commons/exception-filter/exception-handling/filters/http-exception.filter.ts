import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Inject,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

import { UTILITY_LOGGER } from './constants';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(@Inject(UTILITY_LOGGER) private logger: Logger) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const statusCode = exception.getStatus();

    this.logger.error({
      request: {
        path: request.path,
        method: request.method,
      },
      code: statusCode,
      error: exception,
      message: exception.message,
    });

    response.status(statusCode).json({
      status: false,
      message: exception?.message,
      data: null,
    });
  }
}
