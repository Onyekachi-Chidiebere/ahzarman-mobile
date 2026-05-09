import { apiRequest } from './client';

export type InitializeAirtimePurchaseResponse = {
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

export type CompleteAirtimePurchaseResponse = {
  success: boolean;
  message?: string;
  data: {
    transaction_id: number;
    vend_reference: string | null;
    status: string;
    buypower?: unknown;
  };
};

export async function initializeAirtimePurchase(body: {
  user_id: number;
  phone: string;
  disco: string;
  amount: number;
  name: string;
  email?: string;
  paymentType?: string;
  vendType?: string;
  defer_payment_init?: boolean;
}) {
  return apiRequest<InitializeAirtimePurchaseResponse>('/transactions/airtime/paystack/initialize', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function completeAirtimePurchase(body: { reference: string }) {
  return apiRequest<CompleteAirtimePurchaseResponse>('/transactions/airtime/paystack/complete', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
