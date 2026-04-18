import { apiRequest } from './client';

export type CheckMeterApiResponse = {
  success: boolean;
  data: Record<string, unknown>;
  meta?: { buypowerSignatureVerified?: boolean | null };
};

export async function checkElectricityMeter(params: {
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
