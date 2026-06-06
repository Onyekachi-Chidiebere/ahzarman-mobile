import { apiRequest } from './client';

export type SavedMeter = {
  id: string;
  meter: string;
  disco: string;
  disco_id: string;
  customer_name: string;
  address: string;
  min_amount: string;
  last_verified_at: string;
};

type MetersListResponse = { success: boolean; data: SavedMeter[] };
type MeterUpsertResponse = { success: boolean; message?: string; data: SavedMeter };

export type SaveMeterPayload = {
  meter: string;
  disco: string;
  disco_id: string;
  customer_name: string;
  address: string;
  min_amount: string;
};

export function maskMeterNumber(meter: string): string {
  const d = meter.replace(/\D/g, '');
  if (d.length <= 4) return d;
  return `•••• ${d.slice(-4)}`;
}

export async function getSavedMeters(userId: number, token: string | null) {
  const res = await apiRequest<MetersListResponse>(`/users/${userId}/meters`, {
    method: 'GET',
    token,
  });
  return res.data ?? [];
}

export async function saveVerifiedMeter(userId: number, token: string | null, payload: SaveMeterPayload) {
  const res = await apiRequest<MeterUpsertResponse>(`/users/${userId}/meters`, {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteSavedMeter(userId: number, token: string | null, meterId: string) {
  await apiRequest<{ success: boolean; message?: string }>(`/users/${userId}/meters/${encodeURIComponent(meterId)}`, {
    method: 'DELETE',
    token,
  });
}
