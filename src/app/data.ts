import type { Tx } from './types';

export function txMeta(tx: Tx) {
  const map: Record<NonNullable<Tx['type']>, { bg: string; fg: string; icon: string }> = {
    airtime: { bg: '#D9EAF1', fg: '#1A6A8A', icon: '📞' },
    data: { bg: '#FAE0DB', fg: '#A93226', icon: '📡' },
    electricity: { bg: '#EDDAF0', fg: '#7D3C98', icon: '⚡' },
    tv: { bg: '#FFF8D6', fg: '#9A7D0A', icon: '📺' },
    giftcard: { bg: '#D9F1DB', fg: '#1E8449', icon: '🎁' },
    flights: { bg: '#FADBDB', fg: '#B03A2E', icon: '✈️' },
    betting: { bg: '#FAE0DB', fg: '#A04000', icon: '⚽' },
    esim: { bg: '#D9E2F1', fg: '#1A3A8A', icon: '📶' },
    refund: { bg: '#E8F8ED', fg: '#1E8449', icon: '↩' },
    points: { bg: '#EDF1CE', fg: '#919E2D', icon: '🏆' },
  };
  return map[tx.type];
}

export const SAMPLE_TXS: Tx[] = [
  {
    id: '1',
    type: 'airtime',
    title: 'Airtime - MTN',
    amount: '-₦500',
    pts: '+30 pts',
    date: 'Today, 10:23',
    status: 'Successful',
  },
  {
    id: '2',
    type: 'electricity',
    title: 'Electricity - AEDC',
    amount: '-₦5,050',
    pts: '+250 pts',
    date: 'Today, 09:01',
    status: 'Successful',
  },
  {
    id: '3',
    type: 'data',
    title: 'Data - Airtel 1.5GB',
    amount: '-₦700',
    pts: '+40 pts',
    date: 'Yesterday',
    status: 'Pending',
  },
  {
    id: '4',
    type: 'betting',
    title: 'Bet9ja Wallet',
    amount: '-₦2,000',
    pts: '+100 pts',
    date: '2 days ago',
    status: 'Failed',
  },
];

export const SERVICE_ITEMS = [
  { key: 'airtime', label: 'Airtime', color: '#D9EAF1' },
  { key: 'data', label: 'Data', color: '#FAE0DB' },
  { key: 'electricity', label: 'Electricity', color: '#EDDAF0' },
  { key: 'tv', label: 'Cable TV', color: '#FFF8D6' },
  { key: 'giftcards', label: 'Gift Cards', color: '#D9F1DB' },
  { key: 'flights', label: 'Flights', color: '#FADBDB' },
  { key: 'betting', label: 'Betting', color: '#FAE0DB' },
  { key: 'esim', label: 'eSIM', color: '#D9E2F1' },
] as const;

export type ServiceItemKey = (typeof SERVICE_ITEMS)[number]['key'];

/** Services with live purchase flows in the app. */
export const LIVE_SERVICE_KEYS = new Set<ServiceItemKey>(['airtime', 'data', 'electricity', 'tv']);

export function isLiveService(key: string): boolean {
  return LIVE_SERVICE_KEYS.has(key as ServiceItemKey);
}

