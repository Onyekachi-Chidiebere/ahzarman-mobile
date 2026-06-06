import { apiRequest } from './client';

export type RedeemElectricityPayload = {
  meter: string;
  disco: string;
  disco_id?: string;
  points: number;
  pin: string;
};

export type RedeemElectricityResult = {
  transaction_id: number;
  meter_token: string | null;
  points_spent: number;
  amount_ngn: number;
  remaining_points: number;
  meter: string;
};

type RedeemResponse = {
  success: boolean;
  message?: string;
  data: RedeemElectricityResult;
};

export async function redeemPointsForElectricity(token: string | null, payload: RedeemElectricityPayload) {
  const res = await apiRequest<RedeemResponse>('/transactions/points/redeem-electricity', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
  return res.data;
}
