export interface User {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isVerified: boolean;
  balance: number;
  bonus: number;
  referralCode: string;
  pinStatus: boolean;
  account?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    virtualAccountId: string;
  };
}

export interface SignupPayload {
  firstName: string;
  lastName: string;
  email: string;
  state: string;
  phone: string;
  password: string;
  pinCode: string;
  referralCode?: string;
  tenantSlug?: string;
}
