import { PrismaService } from './../../commons/prisma.service';
import { Module } from '@nestjs/common';
import { OrderApiController } from './controllers';
import { OrderApiService } from './services';

@Module({
  imports: [],
  controllers: [OrderApiController],
  providers: [OrderApiService, PrismaService],
  exports: [OrderApiService],
})
export class OrderModule {}
