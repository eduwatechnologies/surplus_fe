export interface PurchaseDataPayload {
  amount: number;
  phone: number;
  network: string;
}

export interface PurchaseAirtimePayload {
  amount: number;
  phoneNumber: string;
}

export interface PayElectricityPayload {
  meterNumber: string;
  amount: number;
  provider: string;
}

export interface SubscribeCablePayload {
  smartCardNumber: string;
  packageId: string;
  provider: string;
}

export interface PayExamPayload {
  examType: string;
  candidateId: string;
  amount: number;
}

export interface VerifyPayload {
  smartCardNumber: string;
  provider: string;
}
