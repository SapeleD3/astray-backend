import { Global, Logger, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import {
  AllExceptionFilter,
  HttpExceptionFilter,
  UTILITY_LOGGER,
} from './exception-handling';

@Global()
@Module({
  providers: [
    /**
     * The order of the filters matter, place the least specific filter
     * first as it will be the last to get triggered by an exception.
     */
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    /**
     * The exception filters are tightly coupled to the `UTILITY_LOGGER` provider,
     * therefore we need to add it as an additional provider in this module.
     */
    {
      provide: UTILITY_LOGGER,
      useClass: Logger,
    },
  ],
})
export class ExceptionFilterModule {}
