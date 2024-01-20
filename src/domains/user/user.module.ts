import { PrismaService } from './../../commons/prisma.service';
import { Module } from '@nestjs/common';
import { UserController } from './controllers';
import { UserService } from './services';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, PrismaService],
  exports: [UserService],
})
export class UserModule {}
