import { User, VirtualAccount } from '@prisma/client';

export type UserLoginPayload = {
  email: string;
  password: string;
};

export type UserRegistrationPayload = {
  email: string;
  password: string;
  fullName: string;
  hostName: string;
  phoneNumber: string;
};

export type AuthenticatedUser = {
  token: string;
  user: any;
};

export type AuthUser = {
  user: Partial<User>;
  account: Partial<VirtualAccount> | null;
};

export type GetNipAccountDetailsPayload = {
  bankCode: string;
  accountNumber: string;
};

export type SaveAccountDetailsPayload = {
  bankCode: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
};
