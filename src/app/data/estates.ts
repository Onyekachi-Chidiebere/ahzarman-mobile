import type { Estate } from '../types';

export const ESTATES: Estate[] = [
  {
    id: 'sunrise',
    name: 'Sunrise Estate',
    city: 'Lekki Phase 1, Lagos',
    members: 412,
    code: 'SUN-2847',
    color: '#E8A020',
    colorLight: '#FEF5E7',
    emoji: '🌅',
    description:
      'A gated community of 412 households in Lekki Phase 1. Community points fund shared amenities and estate maintenance.',
  },
  {
    id: 'greenview',
    name: 'Greenview Gardens',
    city: 'Wuse 2, Abuja',
    members: 287,
    code: 'GRN-1193',
    color: '#27AE60',
    colorLight: '#EAFAF1',
    emoji: '🌿',
    description:
      '287 homes in the heart of Wuse 2. Pooled estate points subsidise communal electricity and water bills.',
  },
  {
    id: 'horizon',
    name: 'Horizon Court',
    city: 'GRA, Port Harcourt',
    members: 165,
    code: 'HRZ-5521',
    color: '#2980B9',
    colorLight: '#EBF5FB',
    emoji: '🏙️',
    description:
      '165-unit high-rise community in Port Harcourt GRA. Estate points vote on security upgrades and facility repairs.',
  },
];
