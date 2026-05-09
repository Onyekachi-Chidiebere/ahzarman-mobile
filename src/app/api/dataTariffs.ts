import { apiRequest } from './client';
import type { DataPlan, DataTab } from '../types';

type TariffEnvelope = {
  success?: boolean;
  data?: unknown;
  meta?: unknown;
};

export async function getDataTariffPriceList(vertical: string, provider: string) {
  const q = new URLSearchParams({ vertical, provider }).toString();
  return apiRequest<TariffEnvelope>(`/services/tariff?${q}`, { method: 'GET' });
}

function pickString(obj: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  }
  return '';
}

function pickNumber(obj: Record<string, unknown>, keys: string[]): number | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string' && v.trim()) {
      const n = Number(v.replace(/,/g, ''));
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

function normalizeTimeUnit(raw: string): DataPlan['timeUnit'] | null {
  const u = raw.toLowerCase().trim();
  if (u === 'day' || u === 'days') return 'day';
  if (u === 'week' || u === 'weeks') return 'week';
  if (u === 'month' || u === 'months') return 'month';
  if (u === 'year' || u === 'years') return 'year';
  return null;
}

function formatValidity(duration: number, unit: NonNullable<DataPlan['timeUnit']>): string {
  const d = Math.max(1, Math.round(duration));
  const plural = d === 1 ? '' : 's';
  switch (unit) {
    case 'day':
      return `${d} day${plural}`;
    case 'week':
      return `${d} week${plural}`;
    case 'month':
      return `${d} month${plural}`;
    case 'year':
      return `${d} year${plural}`;
    default:
      return '—';
  }
}

function tabForTimeUnit(unit: NonNullable<DataPlan['timeUnit']>): DataTab {
  switch (unit) {
    case 'day':
      return 'daily';
    case 'week':
      return 'weekly';
    case 'month':
      return 'monthly';
    case 'year':
      return 'yearly';
    default:
      return 'monthly';
  }
}

function extractTariffRows(root: unknown): unknown[] {
  if (Array.isArray(root)) return root;
  if (!root || typeof root !== 'object') return [];
  const o = root as Record<string, unknown>;
  const directKeys = ['data', 'tariffs', 'plans', 'products', 'items', 'result', 'rows', 'list'];
  for (const k of directKeys) {
    const v = o[k];
    if (Array.isArray(v)) return v;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const inner = extractTariffRows(v);
      if (inner.length) return inner;
    }
  }
  for (const v of Object.values(o)) {
    if (Array.isArray(v) && v.length > 0 && v.every(x => x && typeof x === 'object')) {
      return v;
    }
  }
  return [];
}

/**
 * BuyPower tariff row: { price, desc, code, timeUnit, duration }
 */
function tariffRowToPlan(item: unknown, index: number): DataPlan | null {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
  const r = item as Record<string, unknown>;

  const price = pickNumber(r, ['price', 'amount', 'Amount']);
  const code = pickString(r, ['code', 'tariffClass', 'tariff_class', 'planCode']);
  const desc = pickString(r, ['desc', 'description', 'name', 'title', 'label']);
  const timeUnitRaw = pickString(r, ['timeUnit', 'time_unit']);
  const durationNum = pickNumber(r, ['duration', 'Duration']);
  const duration = durationNum != null && durationNum > 0 ? Math.round(durationNum) : 1;

  const timeUnit = timeUnitRaw ? normalizeTimeUnit(timeUnitRaw) : null;

  if (price == null || !Number.isFinite(price) || price < 0) return null;

  const id = code || `tariff-${index}-${price}`;
  const size = desc || code || 'Data bundle';
  const validity = timeUnit ? formatValidity(duration, timeUnit) : pickString(r, ['validity']) || '—';
  const pts = Math.max(5, Math.round(price / 20));

  const plan: DataPlan = {
    id,
    size,
    price,
    validity,
    pts,
    tariffClass: code || undefined,
    timeUnit: timeUnit ?? undefined,
    duration: timeUnit ? duration : undefined,
  };
  const tag = pickString(r, ['tag', 'badge']);
  if (tag) plan.tag = tag;
  return plan;
}

/** Legacy rows without timeUnit — heuristic bucket (no "hot"). */
export function bucketPlansByValidityText(plans: DataPlan[]): Record<DataTab, DataPlan[]> {
  const empty: Record<DataTab, DataPlan[]> = { daily: [], weekly: [], monthly: [], yearly: [] };
  for (const p of plans) {
    const v = p.validity.toLowerCase();
    if (/\b(year|annual|365\s*days?)\b|\b12\s*month/i.test(v)) {
      empty.yearly.push(p);
    } else if (/\b(month|\d+\s*months?)\b|\b30\s*days?\b|\b28\s*days?\b/i.test(v)) {
      empty.monthly.push(p);
    } else if (/\bweek|\d+\s*weeks?|7\s*days?/i.test(v)) {
      empty.weekly.push(p);
    } else if (/day|\b24\s*h|\d+\s*days?/i.test(v)) {
      empty.daily.push(p);
    } else {
      empty.monthly.push(p);
    }
  }
  const byPrice = (a: DataPlan, b: DataPlan) => a.price - b.price;
  empty.daily.sort(byPrice);
  empty.weekly.sort(byPrice);
  empty.monthly.sort(byPrice);
  empty.yearly.sort(byPrice);
  return empty;
}

function bucketPlansByTimeUnit(plans: DataPlan[]): Record<DataTab, DataPlan[]> {
  const empty: Record<DataTab, DataPlan[]> = { daily: [], weekly: [], monthly: [], yearly: [] };
  const noUnit: DataPlan[] = [];

  for (const p of plans) {
    if (p.timeUnit) {
      empty[tabForTimeUnit(p.timeUnit)].push(p);
    } else {
      noUnit.push(p);
    }
  }

  if (noUnit.length) {
    const legacy = bucketPlansByValidityText(noUnit);
    for (const k of Object.keys(empty) as DataTab[]) {
      empty[k].push(...legacy[k]);
    }
  }

  const byPrice = (a: DataPlan, b: DataPlan) => a.price - b.price;
  empty.daily.sort(byPrice);
  empty.weekly.sort(byPrice);
  empty.monthly.sort(byPrice);
  empty.yearly.sort(byPrice);
  return empty;
}

/**
 * Parses BuyPower `GET /v2/tariff` JSON into Daily / Weekly / Monthly / Yearly only (no hot).
 * Expects rows like `{ price, desc, code, timeUnit, duration }`.
 */
export function parseTariffResponseToCatalog(raw: unknown): Record<DataTab, DataPlan[]> {
  const envelope = raw && typeof raw === 'object' ? (raw as TariffEnvelope) : null;
  const payload = envelope?.data !== undefined ? envelope.data : raw;
  const nested =
    payload && typeof payload === 'object' && !Array.isArray(payload)
      ? (payload as Record<string, unknown>).data ?? payload
      : payload;

  const rows = extractTariffRows(nested);
  const plans: DataPlan[] = [];
  rows.forEach((row, i) => {
    const plan = tariffRowToPlan(row, i);
    if (plan) plans.push(plan);
  });

  const tabbed = bucketPlansByTimeUnit(plans);
  const hasBuckets =
    tabbed.daily.length + tabbed.weekly.length + tabbed.monthly.length + tabbed.yearly.length > 0;
  if (!hasBuckets && plans.length > 0) {
    tabbed.monthly.push(...plans);
    tabbed.monthly.sort((a, b) => a.price - b.price);
  }
  return tabbed;
}
