import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppModule } from './app.module';
import { ExceptionFilterModule, HealthModule } from './commons';

@Module({
  imports: [
    AppModule,
    HealthModule,
    ExceptionFilterModule,
    ConfigModule.forRoot({
      load: [],
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: ['.env.local', '.env.development', '.env.staging', '.env'],
    }),

    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
  ],
})
export class MainModule {}
