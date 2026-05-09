import { apiRequest } from './client';

export type InitializeDataPurchaseResponse = {
  success: boolean;
  message?: string;
  data: {
    transaction_id: number;
    buypower_order_id: string;
    authorization_url?: string | null;
    access_code?: string | null;
    reference: string;
  };
};

export type CompleteDataPurchaseResponse = {
  success: boolean;
  message?: string;
  data: {
    transaction_id: number;
    data_pin: string | null;
    status: string;
    buypower?: unknown;
  };
};

export async function initializeDataPurchase(body: {
  user_id: number;
  /** MSISDN — stored as meter + phone for BuyPower DATA vend */
  phone: string;
  /** BuyPower network code (e.g. MTN, AIRTEL) */
  disco: string;
  amount: number;
  name: string;
  email?: string;
  tariffClass: string;
  plan_label?: string;
  paymentType?: string;
  vendType?: string;
  defer_payment_init?: boolean;
}) {
  return apiRequest<InitializeDataPurchaseResponse>('/transactions/data/paystack/initialize', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function completeDataPurchase(body: { reference: string }) {
  return apiRequest<CompleteDataPurchaseResponse>('/transactions/data/paystack/complete', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
