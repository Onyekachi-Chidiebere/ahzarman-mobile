import { apiRequest } from './client';
import { formatPointsEarned, pointsForAmount } from '../points';
import type { Tx } from '../types';

export type ServerTransaction = {
  id: number;
  user_id: number;
  transaction_type: string;
  service_provider?: string;
  amount: number | string;
  currency?: string;
  status: string;
  provider_transaction_id?: string | null;
  transaction_data?: Record<string, unknown> | null;
  meter_token?: string | null;
  date_created?: string;
  date_completed?: string | null;
};

type UserTransactionsResponse = {
  success: boolean;
  data: ServerTransaction[];
  pagination?: { page: number; limit: number; total: number; pages: number };
};

function pickString(obj: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

function mapStatus(status: string): Tx['status'] {
  const s = String(status || '').toLowerCase();
  if (s === 'success') return 'Successful';
  if (s === 'failed' || s === 'cancelled') return 'Failed';
  return 'Pending';
}

function mapType(transactionType: string): Tx['type'] {
  const t = String(transactionType || '').toLowerCase();
  if (t === 'points_redeem' || t === 'points_share') return 'points';
  if (t === 'gift_card' || t === 'gift_card_sale') return 'giftcard';
  if (t === 'betting_funding' || t === 'betting') return 'betting';
  const allowed: Tx['type'][] = [
    'airtime',
    'data',
    'electricity',
    'tv',
    'giftcard',
    'flights',
    'betting',
    'esim',
    'refund',
    'points',
  ];
  if (allowed.includes(t as Tx['type'])) return t as Tx['type'];
  return 'airtime';
}

function formatAmountNgn(amount: number | string): string {
  const n = typeof amount === 'string' ? Number(amount.replace(/,/g, '')) : Number(amount);
  if (!Number.isFinite(n)) return '—';
  return `-₦${Math.round(n).toLocaleString()}`;
}

function formatTxDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const t = d.getTime();
  if (t >= startOfToday.getTime()) {
    return `Today, ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (t >= startOfYesterday.getTime()) {
    return `Yesterday, ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
  }
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function buildTitle(row: ServerTransaction): string {
  const td = (row.transaction_data && typeof row.transaction_data === 'object'
    ? row.transaction_data
    : {}) as Record<string, unknown>;
  const type = String(row.transaction_type || '').toLowerCase();

  switch (type) {
    case 'airtime': {
      const disco = pickString(td, ['disco', 'network']);
      return disco ? `Airtime — ${disco}` : 'Airtime';
    }
    case 'data': {
      const label = pickString(td, ['plan_label', 'tariffClass']);
      const disco = pickString(td, ['disco', 'network']);
      if (label && disco) return `Data — ${disco} ${label}`;
      if (label) return `Data — ${label}`;
      return disco ? `Data — ${disco}` : 'Data bundle';
    }
    case 'electricity': {
      const disco = pickString(td, ['disco', 'meter_type']);
      return disco ? `Electricity — ${disco}` : 'Electricity';
    }
    case 'tv': {
      const provider = pickString(td, ['provider_label', 'disco']);
      const plan = pickString(td, ['plan_label', 'tariffClass']);
      if (provider && plan) return `${provider} ${plan}`;
      if (provider) return `${provider} subscription`;
      return plan ? `TV — ${plan}` : 'Cable TV';
    }
    case 'gift_card':
    case 'gift_card_sale':
      return pickString(td, ['product_name', 'title']) || 'Gift card';
    case 'betting_funding':
      return pickString(td, ['description', 'account']) || 'Betting';
    case 'points_redeem': {
      const m = pickString(td, ['meter']);
      return m ? `Redeemed for electricity — ${m}` : 'Points redeemed for electricity';
    }
    case 'points_share':
      return pickString(td, ['title']) || 'Shared points';
    default:
      return type ? type.replace(/_/g, ' ') : 'Transaction';
  }
}

export function mapServerTransactionToTx(row: ServerTransaction): Tx {
  const status = mapStatus(row.status);
  const amountNum =
    typeof row.amount === 'string' ? Number(row.amount.replace(/,/g, '')) : Number(row.amount);
  const td = (row.transaction_data && typeof row.transaction_data === 'object'
    ? row.transaction_data
    : {}) as Record<string, unknown>;
  const txType = String(row.transaction_type || '').toLowerCase();

  let pts: string | undefined;
  if (status === 'Successful') {
    if (txType === 'points_redeem') {
      const spent = Number(td.points_spent);
      if (row.meter_token && Number.isFinite(spent) && spent > 0) {
        pts = `-${Math.round(spent)} pts`;
      }
    } else if (txType === 'points_share') {
      const spent = Number(td.points_spent);
      if (Number.isFinite(spent) && spent > 0) {
        pts = `-${Math.round(spent)} pts`;
      }
    } else if (Number.isFinite(amountNum) && amountNum > 0) {
      pts = formatPointsEarned(pointsForAmount(amountNum));
    }
  }

  return {
    id: String(row.id),
    type: mapType(row.transaction_type),
    title: buildTitle(row),
    amount: formatAmountNgn(row.amount),
    date: formatTxDate(row.date_completed || row.date_created),
    pts,
    status,
  };
}

export async function getUserTransactions(
  userId: number,
  token: string | null,
  opts?: { type?: string; status?: string; page?: number; limit?: number },
) {
  const params = new URLSearchParams();
  params.set('page', String(opts?.page ?? 1));
  params.set('limit', String(opts?.limit ?? 50));
  if (opts?.type) params.set('type', opts.type);
  if (opts?.status) params.set('status', opts.status);

  const res = await apiRequest<UserTransactionsResponse>(
    `/transactions/user/${userId}?${params.toString()}`,
    { method: 'GET', token },
  );

  const rows = Array.isArray(res.data) ? res.data : [];
  return rows.map(mapServerTransactionToTx);
}
