import { PrismaService } from './../../commons/prisma.service';
import { Module } from '@nestjs/common';
import {
  AuthUserController,
  UserController,
  AdminUserController,
} from './controllers';
import { UserService } from './services';
import { Paystack } from '../../providers';

@Module({
  imports: [],
  controllers: [UserController, AuthUserController, AdminUserController],
  providers: [Paystack, UserService, PrismaService],
  exports: [UserService],
})
export class UserModule {}
