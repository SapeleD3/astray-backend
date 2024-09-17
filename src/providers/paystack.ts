import axios, { AxiosInstance } from 'axios';
import {
  GetNipAccountDetailsPayload,
  GetNipAccountDetailsResponse,
  PaystackBankList,
  SaveAccountDetailsResponse,
} from './types';
import { SaveAccountDetailsPayload } from '../domains/user/services';
import 'dotenv/config';

export class Paystack {
  private PAYSTACK_BASE_URL = 'https://api.paystack.co';
  private axiosInstance: AxiosInstance;

  constructor() {
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    if (!PAYSTACK_SECRET_KEY) {
      console.log('No paystack key');
    }

    this.axiosInstance = axios.create({
      baseURL: this.PAYSTACK_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });
  }

  async getBankList(): Promise<PaystackBankList[]> {
    let banklist = [];

    try {
      const { data } = await this.axiosInstance.get('/bank');
      if (data?.status === true) {
        const list = data.data;

        banklist = list.map((element: any) => {
          return {
            name: element.name,
            slug: element.slug,
            code: element.code,
            longCode: element.longcode,
            currency: element.currency,
          };
        });
      }
    } catch (error) {
      console.log('error fetch bank list: ', error);
    }

    return banklist;
  }

  async getNipBankDetails(
    payload: GetNipAccountDetailsPayload,
  ): Promise<GetNipAccountDetailsResponse | null> {
    const { accountNumber, bankCode } = payload;
    let bankDetails = null;

    try {
      const { data } = await this.axiosInstance.get(
        `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      );

      if (data?.status === true) {
        const bankDetailsResponse = data.data;
        bankDetails = {
          accountNumber: bankDetailsResponse.account_number,
          accountName: bankDetailsResponse.account_name,
        };
      }
    } catch (error) {
      console.log('error fetch bank details: ', error);
    }

    return bankDetails;
  }

  async createSubAccount(
    payload: SaveAccountDetailsPayload,
  ): Promise<SaveAccountDetailsResponse | null> {
    const { accountName, accountNumber, bankCode } = payload;
    let subAccountDetails = null;

    try {
      const { data } = await this.axiosInstance.post(`/subaccount`, {
        business_name: accountName,
        bank_code: bankCode,
        account_number: accountNumber,
        percentage_charge: 3.5, //Fixed Percentage,
      });

      if (data?.status === true) {
        const subAccountResponse = data.data;
        subAccountDetails = {
          subAccountNumber: subAccountResponse.subaccount_code,
        };
      }
    } catch (error) {
      console.log('error creating subaccount: ', error);
    }

    return subAccountDetails;
  }
}
