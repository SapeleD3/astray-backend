import { useContainer } from 'class-validator';
import helmet from 'helmet';
import { Server } from 'http';

import {
  INestApplication,
  Logger,
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { MainModule } from './main.module';
import { TransformResponseInterceptor } from './commons/transform-response.interceptor';

export async function getApp(): Promise<INestApplication | undefined> {
  let app: INestApplication | undefined;

  try {
    app = await NestFactory.create(MainModule, { bufferLogs: true });
    const server = app.getHttpServer() as Server;
    server.keepAliveTimeout = 65000; // in milliseconds, 65s

    app.useGlobalInterceptors(new TransformResponseInterceptor());

    // Required to inject dependencies into validation decorators.
    // https://github.com/typestack/class-validator#using-service-container
    useContainer(app.select(MainModule), { fallbackOnErrors: true });

    app.use(helmet());
    app.enableCors();
    app.enableVersioning();

    app.useGlobalPipes(
      new ValidationPipe({
        validationError: {
          target: false,
        },
        disableErrorMessages: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
        transform: true,
        exceptionFactory: (
          errors: ValidationError[],
        ): UnprocessableEntityException => {
          return new UnprocessableEntityException(errors);
        },
      }),
    );
  } catch (error) {
    Logger.error('Error setting up server', error);
  }
  return app;
}
