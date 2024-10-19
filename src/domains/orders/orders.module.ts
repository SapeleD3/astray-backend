import { PrismaService } from './../../commons/prisma.service';
import { Module } from '@nestjs/common';
import { OrderApiController, AuthOrderApiController } from './controllers';
import { OrderApiService } from './services';
import { Paystack } from '../../providers';

@Module({
  imports: [],
  controllers: [OrderApiController, AuthOrderApiController],
  providers: [Paystack, OrderApiService, PrismaService],
  exports: [OrderApiService],
})
export class OrderModule {}
