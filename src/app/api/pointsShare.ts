import { apiRequest } from './client';

export type SharePointsPayload = {
  recipient_phone: string;
  points: number;
  pin: string;
  note?: string;
};

export type SharePointsResult = {
  points_sent: number;
  remaining_points: number;
  recipient: { id: number; name: string; phone: string };
};

type ShareResponse = {
  success: boolean;
  message?: string;
  data: SharePointsResult;
};

export type RecipientLookup = {
  registered: boolean;
  id?: number;
  name?: string;
  phone?: string;
  self?: boolean;
};

type LookupResponse = {
  success: boolean;
  message?: string;
  data: RecipientLookup;
};

export async function lookupRecipientByPhone(token: string | null, phone: string) {
  const params = new URLSearchParams({ phone });
  return apiRequest<LookupResponse>(`/users/lookup?${params.toString()}`, {
    method: 'GET',
    token,
  });
}

export async function sharePoints(token: string | null, payload: SharePointsPayload) {
  const res = await apiRequest<ShareResponse>('/transactions/points/share', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
  return res.data;
}
