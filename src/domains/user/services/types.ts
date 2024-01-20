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
