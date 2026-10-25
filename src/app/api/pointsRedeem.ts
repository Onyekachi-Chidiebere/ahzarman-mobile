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
  status?: string;
  delivery?: string;
};

type RedeemResponse = {
  success: boolean;
  message?: string;
  data: RedeemElectricityResult;
};

export async function redeemPointsForElectricity(token: string | null, payload: RedeemElectricityPayload) {
  const res = await apiRequest<PayWithPointsCompatResponse>('/transactions/points/redeem-electricity', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
  const d = res.data;
  return {
    transaction_id: d.transaction_id,
    meter_token: d.meter_token ?? d.vend_reference ?? null,
    points_spent: d.points_spent,
    amount_ngn: d.points_spent,
    remaining_points: d.remaining_points,
    meter: payload.meter,
    status: d.status,
    delivery: d.delivery,
  };
}

type PayWithPointsCompatResponse = {
  success: boolean;
  message?: string;
  data: RedeemElectricityResult & {
    vend_reference?: string | null;
    status?: string;
    delivery?: string;
  };
};
