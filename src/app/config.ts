import { Platform } from 'react-native';

/**
 * API base URL. Emulator/simulator:
 * - iOS Simulator: localhost reaches the host machine.
 * - Android Emulator: 10.0.2.2 maps to host localhost.
 * For a physical device, replace with your machine's LAN IP (same Wi‑Fi), e.g. http://192.168.1.5:3010/api
 */
const DEV_HOST = '192.168.8.148' ;
const PORT = 3000;

/** Physical device + production API while developing: use the live URL in __DEV__ too. */
export const API_BASE_URL = __DEV__
  ? 'https://api.ahzarmanltd.com/api'
  : 'https://api.ahzarmanltd.com/api';

// Local backend instead (same Wi‑Fi):
// export const API_BASE_URL = `http://${DEV_HOST}:${PORT}/api`;

/** Socket.IO server origin (same host as API, without /api path). */
export const SOCKET_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

/**
 * @deprecated Paystack replaced by TransactPay hosted checkout (server returns authorization_url).
 * Kept optional for any leftover references.
 */
export const PAYSTACK_PUBLIC_KEY = '';
