import type { DataPlan, DataTab } from './types';

/** Catalog keyed by network (must match UI network chips). */
export const DATA_PLANS: Record<string, Record<DataTab, DataPlan[]>> = {
  '9mobile': {
    hot: [{ id: 'nm-h1', size: '1GB', price: 290, validity: '1 day', pts: 14 }],
    daily: [{ id: 'nm-d1', size: '500MB', price: 150, validity: '1 day', pts: 7 }],
    weekly: [{ id: 'nm-w1', size: '3GB', price: 650, validity: '7 days', pts: 32 }],
    monthly: [
      { id: 'nm-m1', size: '5GB', price: 1500, validity: '30 days', pts: 75 },
      { id: 'nm-m2', size: '10GB', price: 2500, validity: '30 days', pts: 125, tag: 'Best' },
    ],
  },
  MTN: {
    hot: [
      { id: 'm-h1', size: '1GB', price: 305, validity: '1 day', pts: 15 },
      { id: 'm-h2', size: '2GB', price: 550, validity: '2 days', pts: 28 },
    ],
    daily: [
      { id: 'm-d1', size: '100MB', price: 100, validity: '1 day', pts: 5 },
      { id: 'm-d2', size: '1GB', price: 305, validity: '1 day', pts: 15 },
    ],
    weekly: [
      { id: 'm-w1', size: '1.5GB', price: 350, validity: '7 days', pts: 18 },
      { id: 'm-w2', size: '3GB', price: 600, validity: '7 days', pts: 30 },
    ],
    monthly: [
      { id: 'm-m1', size: '3GB', price: 1000, validity: '30 days', pts: 50 },
      { id: 'm-m2', size: '10GB', price: 2500, validity: '30 days', pts: 125, tag: 'Best' },
    ],
  },
  Airtel: {
    hot: [{ id: 'a-h1', size: '1.5GB', price: 320, validity: '1 day', pts: 16 }],
    daily: [{ id: 'a-d1', size: '1GB', price: 300, validity: '1 day', pts: 15 }],
    weekly: [{ id: 'a-w1', size: '4GB', price: 700, validity: '7 days', pts: 35 }],
    monthly: [
      { id: 'a-m1', size: '6GB', price: 1500, validity: '30 days', pts: 75 },
      { id: 'a-m2', size: '12GB', price: 2800, validity: '30 days', pts: 140, tag: 'Best' },
    ],
  },
  Glo: {
    hot: [{ id: 'g-h1', size: '1GB', price: 280, validity: '1 day', pts: 14 }],
    daily: [{ id: 'g-d1', size: '1GB', price: 280, validity: '1 day', pts: 14 }],
    weekly: [{ id: 'g-w1', size: '5GB', price: 900, validity: '7 days', pts: 45 }],
    monthly: [{ id: 'g-m1', size: '10GB', price: 2000, validity: '30 days', pts: 100, tag: 'Best' }],
  },
};
