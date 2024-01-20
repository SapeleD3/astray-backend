import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Inject,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

import { UTILITY_LOGGER } from './constants';

// We catch any unhandled errors here
@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(@Inject(UTILITY_LOGGER) private logger: Logger) {}

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    this.logger.error({
      request: {
        path: request.path,
        method: request.method,
      },
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      error: exception,
      message: exception.message,
    });

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: exception?.message,
      data: null,
    });
  }
}
