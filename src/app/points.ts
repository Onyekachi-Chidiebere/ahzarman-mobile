import type { Tx } from './types';

/** 1 point per ₦20 spent (minimum 5 points per successful purchase). */
export function pointsForAmount(amountNgn: number): number {
  if (!Number.isFinite(amountNgn) || amountNgn <= 0) return 0;
  return Math.max(5, Math.round(amountNgn / 20));
}

export function formatPointsEarned(pts: number): string {
  return `+${pts} pts`;
}

export function formatPointsDelta(pts: number): string {
  if (pts >= 0) return formatPointsEarned(pts);
  return `${pts} pts`;
}

/** Parse "+180 pts", "-100 pts", etc. */
export function parsePtsFromTx(pts?: string): number {
  if (!pts) return 0;
  const m = pts.match(/([+-]?\d[\d,]*)/);
  if (!m) return 0;
  const n = parseInt(m[1].replace(/,/g, ''), 10);
  if (!Number.isFinite(n)) return 0;
  if (pts.trim().startsWith('-') || m[1].startsWith('-')) return -Math.abs(n);
  return Math.abs(n);
}

/** Balance = sum of pts from successful transactions only. */
export function computeBalanceFromTransactions(transactions: Tx[]): number {
  let balance = 0;
  for (const tx of transactions) {
    if (tx.status !== 'Successful') continue;
    balance += parsePtsFromTx(tx.pts);
  }
  return Math.max(0, balance);
}

export type PointsTier = {
  name: string;
  min: number;
  max: number | null;
  color: string;
  benefits: readonly string[];
};

export const POINTS_TIERS: readonly PointsTier[] = [
  {
    name: 'Bronze',
    min: 0,
    max: 999,
    color: '#CD7F32',
    benefits: ['5% points bonus', 'Basic services', 'Monthly statement'],
  },
  {
    name: 'Silver',
    min: 1000,
    max: 4999,
    color: '#A8A9AD',
    benefits: [
      '10% points bonus',
      'Priority support',
      'Electricity token in 5s',
      'Points gifting enabled',
    ],
  },
  {
    name: 'Gold',
    min: 5000,
    max: 14999,
    color: '#D4AF37',
    benefits: ['20% points bonus', 'Account manager', 'Zero service fees', 'Exclusive promos'],
  },
  {
    name: 'Platinum',
    min: 15000,
    max: null,
    color: '#2E8B57',
    benefits: ['30% points bonus', 'Free monthly airtime', 'Zero fees forever', 'VIP support'],
  },
] as const;

export function getTierForBalance(balance: number): {
  tier: PointsTier;
  tierIndex: number;
  pointsToNextTier: number | null;
  progressInTier: number;
} {
  const b = Math.max(0, Math.floor(balance));
  let tierIndex = 0;
  for (let i = POINTS_TIERS.length - 1; i >= 0; i--) {
    if (b >= POINTS_TIERS[i].min) {
      tierIndex = i;
      break;
    }
  }
  const tier = POINTS_TIERS[tierIndex];
  const next = POINTS_TIERS[tierIndex + 1];
  const pointsToNextTier = next ? Math.max(0, next.min - b) : null;
  const span = tier.max != null ? tier.max - tier.min + 1 : 1;
  const progressInTier =
    tier.max != null ? Math.min(1, Math.max(0, (b - tier.min) / span)) : 1;
  return { tier, tierIndex, pointsToNextTier, progressInTier };
}

/** Recent successful earns for rewards history (newest first). */
export function pointsHistoryFromTransactions(transactions: Tx[], limit = 10) {
  return transactions
    .filter(tx => tx.status === 'Successful' && tx.pts && parsePtsFromTx(tx.pts) !== 0)
    .slice(0, limit)
    .map(tx => ({
      type: tx.type,
      action: tx.title,
      pts: formatPointsDelta(parsePtsFromTx(tx.pts)),
      date: tx.date || '—',
    }));
}
