import { apiRequest } from './client';

export type InitializeElectricityResponse = {
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

export type CompleteElectricityResponse = {
  success: boolean;
  message?: string;
  data: {
    transaction_id: number;
    meter_token: string | null;
    status: string;
    buypower?: unknown;
  };
};

export async function initializeElectricityPurchase(body: {
  user_id: number;
  meter: string;
  disco: string;
  amount: number;
  phone: string;
  name: string;
  email?: string;
  vendType?: string;
  paymentType?: string;
  /** Reserve reference on server only; Paystack charge is created by react-native-paystack-webview with the same reference. */
  defer_payment_init?: boolean;
}) {
  return apiRequest<InitializeElectricityResponse>('/transactions/electricity/paystack/initialize', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function completeElectricityPurchase(body: { reference: string }) {
  return apiRequest<CompleteElectricityResponse>('/transactions/electricity/paystack/complete', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
