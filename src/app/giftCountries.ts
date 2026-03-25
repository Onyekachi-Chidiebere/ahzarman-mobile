export type GiftCountry = {
  code: string;
  name: string;
  flag: string;
  currency: string;
  cards: string[];
};

export const GIFT_COUNTRIES: GiftCountry[] = [
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', currency: 'NGN', cards: ['Netflix', 'Spotify', 'iTunes', 'Amazon', 'Google Play'] },
  { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', cards: ['Amazon', 'Apple', 'Google Play', 'Steam', 'Xbox', 'Netflix', 'Spotify'] },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', cards: ['Amazon UK', 'iTunes UK', 'Google Play', 'Netflix', 'ASOS'] },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD', cards: ['Amazon CA', 'iTunes CA', 'Google Play', 'Netflix', 'Steam'] },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'AUD', cards: ['iTunes AU', 'Google Play', 'Netflix', 'Steam'] },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', currency: 'GHS', cards: ['Netflix', 'Spotify', 'Google Play'] },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', currency: 'ZAR', cards: ['Netflix', 'iTunes', 'Google Play', 'Steam'] },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', currency: 'AED', cards: ['Amazon AE', 'iTunes', 'Google Play', 'Netflix', 'Xbox'] },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', currency: 'EUR', cards: ['Amazon DE', 'iTunes', 'Google Play', 'Netflix', 'Steam'] },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', currency: 'JPY', cards: ['Amazon JP', 'iTunes JP', 'Nintendo', 'PlayStation'] },
];

export const CARD_COLORS: Record<string, string> = {
  Netflix: '#E50914',
  Spotify: '#1DB954',
  iTunes: '#FC3C44',
  Apple: '#555',
  Amazon: '#FF9900',
  'Amazon UK': '#FF9900',
  'Amazon CA': '#FF9900',
  'Amazon DE': '#FF9900',
  'Amazon AE': '#FF9900',
  'Amazon JP': '#FF9900',
  'iTunes UK': '#FC3C44',
  'iTunes CA': '#FC3C44',
  'iTunes AU': '#FC3C44',
  'iTunes JP': '#FC3C44',
  Steam: '#1B2838',
  'Google Play': '#34A853',
  Xbox: '#107C10',
  ASOS: '#000',
  Nintendo: '#E60012',
  PlayStation: '#003087',
};
