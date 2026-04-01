import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';
import Airtime from './airtime.svg';
import Data from './data.svg';
import Electricity from './electricity.svg';
import Tv from './tv.svg';
import Giftcards from './giftcards.svg';
import Flights from './flights.svg';
import Betting from './betting.svg';
import Esim from './esim.svg';
import More from './more.svg';

export type ServiceItemKey =
  | 'airtime'
  | 'data'
  | 'electricity'
  | 'tv'
  | 'giftcards'
  | 'flights'
  | 'betting'
  | 'esim';

/** Use as `<AirtimeIcon width={24} height={24} />` or import from this module. */
export const AirtimeIcon = Airtime;
export const DataIcon = Data;
export const ElectricityIcon = Electricity;
export const TvIcon = Tv;
export const GiftcardsIcon = Giftcards;
export const FlightsIcon = Flights;
export const BettingIcon = Betting;
export const EsimIcon = Esim;
export const MoreIcon = More;

export const SERVICE_ICONS: Record<ServiceItemKey, FC<SvgProps>> = {
  airtime: AirtimeIcon,
  data: DataIcon,
  electricity: ElectricityIcon,
  tv: TvIcon,
  giftcards: GiftcardsIcon,
  flights: FlightsIcon,
  betting: BettingIcon,
  esim: EsimIcon,
};

/**
 * Picks the correct asset SVG for a `SERVICE_ITEMS` key (same pattern as named exports).
 */
export function ServiceIcon({
  name,
  size = 24,
  ...rest
}: { name: ServiceItemKey; size?: number } & SvgProps) {
  const Cmp = SERVICE_ICONS[name];
  return <Cmp width={size} height={size} {...rest} />;
}
