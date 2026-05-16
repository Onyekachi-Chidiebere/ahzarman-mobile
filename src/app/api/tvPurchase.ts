import { apiRequest, assertApiSuccess } from './client';

export type InitializeTvPurchaseResponse = {
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

export type CompleteTvPurchaseResponse = {
  success: boolean;
  message?: string;
  data: {
    transaction_id: number;
    vend_reference: string | null;
    status: string;
    buypower?: unknown;
  };
};

export async function initializeTvPurchase(body: {
  user_id: number;
  meter: string;
  phone: string;
  disco: string;
  amount: number;
  name: string;
  email?: string;
  tariffClass: string;
  plan_label?: string;
  provider_label?: string;
  paymentType?: string;
  vendType?: string;
  defer_payment_init?: boolean;
}) {
  return apiRequest<InitializeTvPurchaseResponse>('/transactions/tv/paystack/initialize', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function completeTvPurchase(body: { reference: string }) {
  const res = await apiRequest<CompleteTvPurchaseResponse>('/transactions/tv/paystack/complete', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return assertApiSuccess(res);
}
