import { Platform } from 'react-native';

/**
 * API base URL. Emulator/simulator:
 * - iOS Simulator: localhost reaches the host machine.
 * - Android Emulator: 10.0.2.2 maps to host localhost.
 * For a physical device, replace with your machine's LAN IP (same Wi‑Fi), e.g. http://192.168.1.5:3010/api
 */
const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const PORT = 3010;

export const API_BASE_URL = __DEV__
  ? `http://${DEV_HOST}:${PORT}/api`
  : 'https://your-production-api.example.com/api';

/** Paystack public key (pk_test_… / pk_live_…). Passed as `paystackKey` on the checkout modal. Secret key stays on the server. */
export const PAYSTACK_PUBLIC_KEY = 'pk_test_ad77c1c2df69ac754ba4d4c64c3a2af6dde13bb2';
