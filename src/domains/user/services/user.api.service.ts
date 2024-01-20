import { BadRequestException, Injectable } from '@nestjs/common';
import {
  UserLoginPayload,
  AuthenticatedUser,
  UserRegistrationPayload,
} from './types';
import { PrismaService } from '../../../commons/prisma.service';
import {
  comparePassword,
  encryptPassword,
  generateJwtToken,
} from '../../../commons';
import dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';

const excludePassword = (user: any) => {
  delete user.password;
  return user;
};

@Injectable()
export class UserService {
  constructor(
    private readonly db: PrismaService,
    private readonly configService: ConfigService,
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
}
