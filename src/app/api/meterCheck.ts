import { ApiError, apiRequest } from './client';

export type CheckMeterApiResponse = {
  success: boolean;
  data: Record<string, unknown>;
  meta?: { buypowerSignatureVerified?: boolean | null };
};

/** BuyPower v2 meter / smartcard check via server proxy (electricity, TV decoder, etc.). */
export async function checkBuyPowerMeter(params: {
  meter: string;
  disco: string;
  vendType?: 'PREPAID' | 'POSTPAID';
}) {
  const vendType = params.vendType ?? 'PREPAID';
  const q = new URLSearchParams({
    meter: params.meter.trim(),
    disco: params.disco.trim(),
    vendType,
  });
  return apiRequest<CheckMeterApiResponse>(`/services/electricity/check-meter?${q.toString()}`, {
    method: 'GET',
  });
}

export function mergeMeterPayload(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== 'object') return {};
  const root = data as Record<string, unknown>;
  const nested = root.data ?? root.result ?? root.meterInfo ?? root.payload;
  const out = { ...root };
  if (nested && typeof nested === 'object' && nested !== null) {
    Object.assign(out, nested as Record<string, unknown>);
  }
  return out;
}

function pickString(obj: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

export function mapMeterCheckToCustomerName(data: unknown): string | null {
  const flat = mergeMeterPayload(data);
  const name = pickString(flat, [
    'customerName',
    'customer_name',
    'name',
    'fullName',
    'meterOwner',
    'customer',
    'accountName',
    'AccountName',
  ]);
  return name || null;
}

export function meterVerifyErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof ApiError) {
    const b = e.body as Record<string, unknown> | undefined;
    if (b && typeof b === 'object') {
      if (typeof b.message === 'string' && b.message) return b.message;
      const err = b.error;
      if (typeof err === 'string' && err) return err;
      if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: string }).message === 'string') {
        return (err as { message: string }).message;
      }
    }
    return e.message;
  }
  return fallback;
}
