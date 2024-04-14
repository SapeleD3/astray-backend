import { PrismaService } from './../../commons/prisma.service';
import { Module } from '@nestjs/common';
import { OrderApiController, AuthOrderApiController } from './controllers';
import { OrderApiService } from './services';

@Module({
  imports: [],
  controllers: [OrderApiController, AuthOrderApiController],
  providers: [OrderApiService, PrismaService],
  exports: [OrderApiService],
})
export class OrderModule {}
