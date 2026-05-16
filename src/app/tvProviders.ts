export type TvProviderId = 'DStv' | 'GOtv' | 'Startimes';

export type TvPlan = {
  code: string;
  name: string;
  price: number;
  pts: number;
  desc: string;
  validity: string;
};

export const TV_PROVIDERS: Record<TvProviderId, { plans: TvPlan[] }> = {
  DStv: {
    plans: [
      {
        code: 'dstv-premium',
        name: 'Premium',
        price: 29500,
        pts: 1475,
        desc: 'All channels',
        validity: '1 month',
      },
      {
        code: 'dstv-compact-plus',
        name: 'Compact+',
        price: 16600,
        pts: 830,
        desc: 'Top sports & movies',
        validity: '1 month',
      },
      {
        code: 'dstv-compact',
        name: 'Compact',
        price: 9600,
        pts: 480,
        desc: 'Great variety',
        validity: '1 month',
      },
      {
        code: 'dstv-access',
        name: 'Access',
        price: 3600,
        pts: 180,
        desc: 'Family essentials',
        validity: '1 month',
      },
      {
        code: 'dstv-yanga',
        name: 'Yanga',
        price: 2500,
        pts: 125,
        desc: 'Basic entertainment',
        validity: '1 month',
      },
    ],
  },
  GOtv: {
    plans: [
      {
        code: 'gotv-max',
        name: 'Max',
        price: 4150,
        pts: 207,
        desc: 'Best of GOtv',
        validity: '1 month',
      },
      {
        code: 'gotv-jolli',
        name: 'Jolli',
        price: 3280,
        pts: 164,
        desc: 'Sports & movies',
        validity: '1 month',
      },
      {
        code: 'gotv-jinja',
        name: 'Jinja',
        price: 2460,
        pts: 123,
        desc: 'Family fun',
        validity: '1 month',
      },
      {
        code: 'gotv-smallie',
        name: 'Smallie',
        price: 900,
        pts: 45,
        desc: 'Starter pack',
        validity: '1 month',
      },
    ],
  },
  Startimes: {
    plans: [
      {
        code: 'st-super',
        name: 'Super',
        price: 4900,
        pts: 245,
        desc: 'Premium content',
        validity: '1 month',
      },
      {
        code: 'st-classic',
        name: 'Classic',
        price: 2750,
        pts: 137,
        desc: 'Great variety',
        validity: '1 month',
      },
      {
        code: 'st-basic',
        name: 'Basic',
        price: 1850,
        pts: 92,
        desc: 'Family pack',
        validity: '1 month',
      },
      {
        code: 'st-nova',
        name: 'Nova',
        price: 1300,
        pts: 65,
        desc: 'Starter',
        validity: '1 month',
      },
    ],
  },
};

/** BuyPower `provider` query value for GET /services/tariff?vertical=TV&provider=… */
export const TV_TARIFF_PROVIDER: Record<TvProviderId, string> = {
  DStv: 'DSTV',
  GOtv: 'GOTV',
  Startimes: 'STARTIMES',
};
