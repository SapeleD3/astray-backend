import { PrismaService } from './../../commons/prisma.service';
import { Module } from '@nestjs/common';
import { AuthUserController, UserController } from './controllers';
import { UserService } from './services';
import { Paystack } from '../../providers';

@Module({
  imports: [],
  controllers: [UserController, AuthUserController],
  providers: [UserService, PrismaService, Paystack],
  exports: [UserService],
})
export class UserModule {}
