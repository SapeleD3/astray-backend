import { PrismaService } from './../../commons/prisma.service';
import { Module } from '@nestjs/common';
import { AuthEventApiController, EventApiController } from './controllers';
import { EventApiService } from './services';

@Module({
  imports: [],
  controllers: [EventApiController, AuthEventApiController],
  providers: [EventApiService, PrismaService],
  exports: [EventApiService],
})
export class EventModule {}
