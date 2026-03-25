export const FLIGHT_CITIES: Record<string, string> = {
  ABV: 'Abuja',
  LOS: 'Lagos',
  KAN: 'Kano',
  PHC: 'Port Harcourt',
  ENU: 'Enugu',
  CBQ: 'Calabar',
};

export type Airport = { city: string; name: string; code: string };

export const AIRPORTS: Airport[] = [
  { city: 'Port Harcourt, Nigeria', name: 'Port Harcourt International Airport', code: 'PHC' },
  { city: 'Lagos, Nigeria', name: 'Murtala Muhammed International Airport', code: 'LOS' },
  { city: 'Abuja, Nigeria', name: 'Nnamdi Azikwe International Airport', code: 'ABV' },
  { city: 'Kano, Nigeria', name: 'Mallam Aminu Kano International Airport', code: 'KAN' },
  { city: 'Enugu, Nigeria', name: 'Akanu Ibiam International Airport', code: 'ENU' },
  { city: 'Calabar, Nigeria', name: 'Margaret Ekpo International Airport', code: 'CBQ' },
];

export type FlightResult = {
  airline: string;
  dep: string;
  arr: string;
  dur: string;
  stops: string;
  price: number;
  pts: number;
  cheapest?: boolean;
  quickest?: boolean;
};

export const SAMPLE_FLIGHTS: FlightResult[] = [
  { airline: 'United Nigeria', dep: '05:30 PM', arr: '06:30 PM', dur: '1hrs', stops: 'Direct', price: 497336, pts: 990, cheapest: true, quickest: true },
  { airline: 'Air Peace', dep: '07:45 PM', arr: '07:05 AM', dur: '11h 20m', stops: '1 Stop', price: 814053, pts: 1628 },
  { airline: 'Air Peace', dep: '09:00 PM', arr: '10:15 PM', dur: '1h 15m', stops: 'Direct', price: 765000, pts: 1530 },
  { airline: 'Air Peace', dep: '11:30 PM', arr: '12:50 AM', dur: '1h 20m', stops: 'Direct', price: 720000, pts: 1440 },
  { airline: 'Arik Air', dep: '06:00 AM', arr: '07:20 AM', dur: '1h 20m', stops: 'Direct', price: 620000, pts: 1240 },
];

export function airportName(code: string): string {
  return AIRPORTS.find(a => a.code === code)?.name ?? 'International Airport';
}
