import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from './client';

export const AUTH_TOKEN_KEY = 'auth_token';
export const POINTS_BALANCE_KEY = 'points_balance';

/** Clears persisted auth (client-side JWT logout). */
export async function clearAuthSession() {
  await Promise.all([
    AsyncStorage.removeItem(AUTH_TOKEN_KEY),
    AsyncStorage.removeItem(POINTS_BALANCE_KEY),
  ]);
}

export type AuthUser = {
  id: number;
  name: string;
  phone: string;
  email: string;
  username?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  wallet_balance?: string | number;
  profile_image?: string | null;
};

export type AuthPayload = { user: AuthUser; token: string };

export type OnboardingSlide = { title: string; sub: string; art?: number };

type Msg = { success: boolean; message?: string };
type OtpSend = Msg & { debug_code?: string };
type AuthResponse = { success: boolean; message?: string; data: AuthPayload };
type MeResponse = { success: boolean; data: AuthUser };
type OnboardingResponse = { success: boolean; data: { slides: OnboardingSlide[] } };

export async function getOnboardingSlides(): Promise<OnboardingSlide[]> {
  const r = await apiRequest<OnboardingResponse>('/auth/onboarding', { method: 'GET' });
  return r.data?.slides ?? [];
}

export async function sendOtp(phone: string, purpose: 'register' | 'reset_pin' = 'register') {
  return apiRequest<OtpSend>('/auth/otp/send', {
    method: 'POST',
    body: JSON.stringify({ phone, purpose }),
  });
}

export async function verifyOtp(
  phone: string,
  code: string,
  purpose: 'register' | 'reset_pin' = 'register',
) {
  return apiRequest<Msg>('/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ phone, code, purpose }),
  });
}

export async function registerAccount(name: string, phone: string, pin: string) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, phone, pin }),
  });
}

export async function login(phone: string, pin: string) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, pin }),
  });
}

export async function resetPin(phone: string, new_pin: string) {
  return apiRequest<AuthResponse>('/auth/pin/reset', {
    method: 'POST',
    body: JSON.stringify({ phone, new_pin }),
  });
}

export async function fetchMe(token: string) {
  const r = await apiRequest<MeResponse>('/auth/me', { method: 'GET', token });
  return r.data;
}
