export type PaystackBankList = {
  name: string;
  slug: string;
  code: string;
  longCode: string;
  currency: string;
};

export type GetNipAccountDetailsPayload = {
  bankCode: string;
  accountNumber: string;
};

export type GetNipAccountDetailsResponse = {
  accountNumber: string;
  accountName: string;
};

export type SaveAccountDetailsResponse = {
  subAccountNumber: string;
};
