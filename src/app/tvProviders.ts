export type TvPlan = { name: string; price: number; pts: number; desc: string };

export const TV_PROVIDERS: Record<string, { plans: TvPlan[] }> = {
  DStv: {
    plans: [
      { name: 'Premium', price: 29500, pts: 1475, desc: 'All channels' },
      { name: 'Compact+', price: 16600, pts: 830, desc: 'Top sports & movies' },
      { name: 'Compact', price: 9600, pts: 480, desc: 'Great variety' },
      { name: 'Access', price: 3600, pts: 180, desc: 'Family essentials' },
      { name: 'Yanga', price: 2500, pts: 125, desc: 'Basic entertainment' },
    ],
  },
  GOtv: {
    plans: [
      { name: 'Max', price: 4150, pts: 207, desc: 'Best of GOtv' },
      { name: 'Jolli', price: 3280, pts: 164, desc: 'Sports & movies' },
      { name: 'Jinja', price: 2460, pts: 123, desc: 'Family fun' },
      { name: 'Smallie', price: 900, pts: 45, desc: 'Starter pack' },
    ],
  },
  Startimes: {
    plans: [
      { name: 'Super', price: 4900, pts: 245, desc: 'Premium content' },
      { name: 'Classic', price: 2750, pts: 137, desc: 'Great variety' },
      { name: 'Basic', price: 1850, pts: 92, desc: 'Family pack' },
      { name: 'Nova', price: 1300, pts: 65, desc: 'Starter' },
    ],
  },
};
