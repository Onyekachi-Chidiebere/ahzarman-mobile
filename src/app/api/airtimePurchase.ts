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
  buypower_message?: string;
  data: {
    transaction_id: number;
    vend_reference: string | null;
    status: string;
    delivery?: string;
    can_retry?: boolean;
    next_retry_at?: string | null;
    attempts?: number | null;
    buypower_message?: string | null;
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

export type RetryDeliveryResponse = {
  success: boolean;
  message?: string;
  data: {
    transaction_id: number;
    status: string;
    vend_reference?: string | null;
    delivery?: string;
    can_retry?: boolean;
    buypower_message?: string | null;
    attempts?: number | null;
  };
};

/** Re-attempt BuyPower vend for a paid/processing tx (no new card charge). */
export async function retryTransactionDelivery(transactionId: number | string, token: string | null) {
  return apiRequest<RetryDeliveryResponse>(`/transactions/${transactionId}/retry-delivery`, {
    method: 'POST',
    token,
    body: JSON.stringify({}),
  });
}
