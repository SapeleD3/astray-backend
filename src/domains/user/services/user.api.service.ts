import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  UserLoginPayload,
  AuthenticatedUser,
  UserRegistrationPayload,
  AuthUser,
  GetNipAccountDetailsPayload,
  SaveAccountDetailsPayload,
  EditUserPayload,
} from './types';
import { PrismaService } from '../../../commons/prisma.service';
import {
  comparePassword,
  encryptPassword,
  generateJwtToken,
} from '../../../commons';
import dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';
import {
  GetNipAccountDetailsResponse,
  Paystack,
  PaystackBankList,
} from '../../../providers';
import { User, VirtualAccount } from '@prisma/client';

const excludePassword = (user: any) => {
  delete user.password;
  return user;
};

@Injectable()
export class UserService {
  constructor(
    private readonly db: PrismaService,
    private readonly configService: ConfigService,
    private readonly paystack: Paystack,
  ) {}

  async userLogin(payload: UserLoginPayload): Promise<AuthenticatedUser> {
    const { email, password } = payload;

    const existingUser = await this.db.user.findFirst({ where: { email } });

    if (!existingUser) {
      throw new BadRequestException('User not found');
    }

    const isMatchingPassword = comparePassword({
      password,
      hash: existingUser.password,
    });

    if (!isMatchingPassword) {
      throw new Error('Invalid login details');
    }

    const secret = this.configService.get('SECRET');
    const algorithm = this.configService.get('ALGO');

    const token = generateJwtToken({
      id: existingUser.id,
      secret,
      algorithm,
    });

    return { token, user: excludePassword(existingUser) };
  }

  async userRegistration(
    payload: UserRegistrationPayload,
  ): Promise<AuthenticatedUser> {
    const { email, password, phoneNumber, fullName, hostName } = payload;

    const existingUser = await this.db.user.findFirst({ where: { email } });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hash = encryptPassword(password);

    const newUser = await this.db.user.create({
      data: {
        email,
        password: hash,
        phoneNumber,
        fullName,
        hostName,
        createdAt: dayjs().unix(),
        updatedAt: dayjs().unix(),
      },
    });

    const secret = this.configService.get('SECRET');
    const algorithm = this.configService.get('ALGO');

    const token = generateJwtToken({
      id: newUser.id,
      secret,
      algorithm,
    });

    return { token, user: excludePassword(newUser) };
  }

  async fetchAuthUser(userId: string): Promise<AuthUser> {
    const [user, virtualAccount] = await Promise.all([
      this.db.user.findFirst({ where: { id: userId } }),
      this.db.virtualAccount.findFirst({ where: { userId } }),
    ]);

    if (!user) {
      throw new UnauthorizedException('invalid token');
    }

    return {
      user: excludePassword(user),
      account: virtualAccount,
    };
  }

  async fetchValidBankList(): Promise<PaystackBankList[]> {
    const banklist = await this.paystack.getBankList();
    return banklist;
  }

  async getNipBankDetails(
    payload: GetNipAccountDetailsPayload,
  ): Promise<GetNipAccountDetailsResponse> {
    const bankDetails = await this.paystack.getNipBankDetails(payload);

    if (!bankDetails) {
      throw new BadRequestException('Invalid account number');
    }

    return bankDetails;
  }

  async editUser(
    userId: string,
    payload: EditUserPayload,
  ): Promise<Partial<User>> {
    const user = await this.db.user.findFirst({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('invalid token');
    }

    const edittedUser = await this.db.user.update({
      where: { id: userId },
      data: payload,
    });

    return excludePassword(edittedUser);
  }

  async saveAccountDetails(
    userId: string,
    payload: SaveAccountDetailsPayload,
  ): Promise<Partial<VirtualAccount>> {
    const { bankCode, bankName, accountName, accountNumber } = payload;

    const subAccountDetails = await this.paystack.createSubAccount(payload);

    if (!subAccountDetails) {
      throw new BadRequestException('Invalid account number');
    }

    const newVirtualAccount = await this.db.virtualAccount.create({
      data: {
        bankCode,
        bankName,
        accountFullName: accountName,
        accountNumber,
        userId,
        subAccountNumber: subAccountDetails.subAccountNumber,
        createdAt: dayjs().unix(),
        updatedAt: dayjs().unix(),
      },
    });

    return newVirtualAccount;
  }
}
