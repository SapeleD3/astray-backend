import { PrismaService } from './../../commons/prisma.service';
import { Module } from '@nestjs/common';
import { AuthUserController, UserController } from './controllers';
import { UserService } from './services';
import { Paystack } from '../../providers';

@Module({
  imports: [],
  controllers: [UserController, AuthUserController],
  providers: [Paystack, UserService, PrismaService],
  exports: [UserService],
})
export class UserModule {}
