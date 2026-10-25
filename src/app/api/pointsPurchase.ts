import { apiRequest } from './client';

export type InitializePointsPurchaseResponse = {
  success: boolean;
  message?: string;
  data: {
    transaction_id: number;
    reference: string;
    points_credited: number;
    authorization_url?: string | null;
    access_code?: string | null;
  };
};

export type CompletePointsPurchaseResponse = {
  success: boolean;
  message?: string;
  data: {
    transaction_id: number;
    points_credited: number;
    status: string;
    remaining_points?: number;
  };
};

export async function initializePointsPurchase(body: {
  user_id: number;
  amount: number;
  email?: string;
  name?: string;
}) {
  return apiRequest<InitializePointsPurchaseResponse>('/transactions/points/purchase/initialize', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function completePointsPurchase(body: { reference: string }) {
  return apiRequest<CompletePointsPurchaseResponse>('/transactions/points/purchase/complete', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
