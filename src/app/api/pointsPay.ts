import { apiRequest } from './client';

export type PayWithPointsService = 'airtime' | 'data' | 'electricity' | 'tv';

export type PayWithPointsPayload = {
  service: PayWithPointsService;
  amount: number;
  pin: string;
  phone?: string;
  disco?: string;
  meter?: string;
  name?: string;
  email?: string;
  tariffClass?: string;
  plan_label?: string;
  disco_id?: string;
  paymentType?: string;
  vendType?: string;
};

export type PayWithPointsResult = {
  transaction_id: number;
  reference: string;
  status: string;
  delivery?: string;
  points_spent: number;
  remaining_points: number;
  vend_reference?: string | null;
  meter_token?: string | null;
  can_retry?: boolean;
  buypower_message?: string | null;
};

type PayWithPointsResponse = {
  success: boolean;
  message?: string;
  data: PayWithPointsResult;
};

/** 1 pt = ₦1. Deducts points immediately (hold); restores on permanent fail / exhausted retries. */
export async function payWithPoints(token: string | null, payload: PayWithPointsPayload) {
  const res = await apiRequest<PayWithPointsResponse>('/transactions/points/pay', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
  return res;
}
