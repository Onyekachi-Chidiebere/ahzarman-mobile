import AsyncStorage from '@react-native-async-storage/async-storage';
import auth, { type FirebaseAuthTypes } from '@react-native-firebase/auth';
import { sendOtp, verifyFirebaseOtp } from './auth';
import { ApiError } from './client';
import { toE164Ng } from './phone';

const OTP_SESSION_KEY = '@ahzarman/phone_otp_session';
/** Firebase phone sessions typically expire within ~3–5 minutes; keep a safety window. */
const OTP_SESSION_TTL_MS = 10 * 60 * 1000;

type OtpSession = {
  verificationId: string;
  phone: string;
  purpose: 'register' | 'reset_pin';
  e164: string;
  createdAt: number;
};

let pendingConfirmation: FirebaseAuthTypes.ConfirmationResult | null = null;
let sendInFlight = false;

function otpCodeFromError(e: unknown): string | null {
  const err = e as { code?: string; nativeErrorCode?: string | null };
  return err?.code || err?.nativeErrorCode || null;
}

/** Prefer clear copy for the usual “invalid code” cases users report. */
function friendlyFirebaseOtpMessage(e: unknown): string | null {
  const code = otpCodeFromError(e);
  switch (code) {
    case 'auth/invalid-verification-code':
      return 'That code is incorrect or no longer valid. Enter the latest SMS only — Resend invalidates older codes.';
    case 'auth/code-expired':
    case 'auth/session-expired':
      return 'This code has expired. Tap Resend to get a new one.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a few minutes, then request a new code.';
    case 'auth/invalid-verification-id':
      return 'Verification expired on this device. Tap Resend to get a new code.';
    default:
      return null;
  }
}

/** Build a full error string for display in the app UI. */
export function otpErrorMessage(e: unknown, fallback = 'OTP failed'): string {
  const friendly = friendlyFirebaseOtpMessage(e);
  if (friendly) return friendly;

  if (e instanceof ApiError) {
    const parts = [e.message];
    if (e.status) parts.push(`status=${e.status}`);
    if (e.body != null) {
      try {
        parts.push(typeof e.body === 'string' ? e.body : JSON.stringify(e.body));
      } catch {
        /* ignore */
      }
    }
    return parts.filter(Boolean).join('\n');
  }

  const err = e as {
    code?: string;
    message?: string;
    nativeErrorCode?: string | null;
    nativeErrorMessage?: string | null;
    userInfo?: unknown;
  };

  const parts: string[] = [];
  if (err?.code) parts.push(`code: ${err.code}`);
  if (err?.message) parts.push(err.message);
  if (err?.nativeErrorCode) parts.push(`nativeCode: ${err.nativeErrorCode}`);
  if (err?.nativeErrorMessage) parts.push(`native: ${err.nativeErrorMessage}`);
  if (err?.userInfo != null) {
    try {
      parts.push(`userInfo: ${JSON.stringify(err.userInfo)}`);
    } catch {
      /* ignore */
    }
  }

  return parts.length ? parts.join('\n') : fallback;
}

function toOtpApiError(e: unknown, fallback: string): ApiError {
  if (e instanceof ApiError) return e;
  const err = e as {
    code?: string;
    message?: string;
    nativeErrorCode?: string | null;
    nativeErrorMessage?: string | null;
    userInfo?: unknown;
  };
  return new ApiError(otpErrorMessage(e, fallback), 400, {
    code: err?.code ?? null,
    message: err?.message ?? null,
    nativeErrorCode: err?.nativeErrorCode ?? null,
    nativeErrorMessage: err?.nativeErrorMessage ?? null,
    userInfo: err?.userInfo ?? null,
  });
}

function digitsOnlyOtp(code: string): string {
  return String(code ?? '').replace(/\D/g, '').slice(0, 6);
}

async function saveOtpSession(session: OtpSession): Promise<void> {
  await AsyncStorage.setItem(OTP_SESSION_KEY, JSON.stringify(session));
}

async function loadOtpSession(): Promise<OtpSession | null> {
  try {
    const raw = await AsyncStorage.getItem(OTP_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as OtpSession;
    if (!session?.verificationId || !session?.createdAt) return null;
    if (Date.now() - session.createdAt > OTP_SESSION_TTL_MS) {
      await clearOtpSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

async function clearOtpSession(): Promise<void> {
  pendingConfirmation = null;
  try {
    await AsyncStorage.removeItem(OTP_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function clearPhoneVerification() {
  void clearOtpSession();
}

/** Ask server + trigger Firebase SMS. */
export async function startPhoneVerification(
  phone: string,
  purpose: 'register' | 'reset_pin',
  opts?: { forceResend?: boolean },
): Promise<void> {
  if (sendInFlight) {
    throw new ApiError('A code is already being sent. Please wait a moment.', 429);
  }
  sendInFlight = true;
  try {
    const r = await sendOtp(phone, purpose);

    if (r.delivery !== 'firebase') {
      throw new ApiError(
        `Firebase OTP is not configured on the server\n${JSON.stringify(r)}`,
        503,
        r,
      );
    }

    const e164 = toE164Ng(phone);
    if (!e164) {
      throw new ApiError(`Invalid phone number: "${phone}"`, 400);
    }

    // forceResend=true when user taps Resend so Firebase issues a fresh SMS/session
    pendingConfirmation = await auth().signInWithPhoneNumber(e164, !!opts?.forceResend);
    const verificationId = pendingConfirmation.verificationId;
    if (!verificationId) {
      throw new ApiError('Could not start phone verification. Try again.', 500);
    }

    await saveOtpSession({
      verificationId,
      phone,
      purpose,
      e164,
      createdAt: Date.now(),
    });
  } catch (e) {
    throw toOtpApiError(e, 'Could not send verification code');
  } finally {
    sendInFlight = false;
  }
}

async function signInWithSmsCode(code: string): Promise<void> {
  const digits = digitsOnlyOtp(code);
  if (digits.length !== 6) {
    throw new ApiError('Enter the 6-digit code from your SMS.', 400);
  }

  if (pendingConfirmation) {
    await pendingConfirmation.confirm(digits);
    return;
  }

  // App was killed/backgrounded after SMS (common on Samsung) — recover session
  const session = await loadOtpSession();
  if (!session?.verificationId) {
    throw new ApiError('No verification in progress. Request a new code.', 400);
  }

  const credential = auth.PhoneAuthProvider.credential(session.verificationId, digits);
  await auth().signInWithCredential(credential);
}

/** Confirm 6-digit SMS code via Firebase. */
export async function completePhoneVerification(
  phone: string,
  code: string,
  purpose: 'register' | 'reset_pin',
): Promise<void> {
  try {
    const session = await loadOtpSession();
    if (session && (session.phone !== phone || session.purpose !== purpose)) {
      // Phone changed mid-flow — do not accept an old SMS session
      await clearOtpSession();
      throw new ApiError('Phone number changed. Request a new code.', 400);
    }

    await signInWithSmsCode(code);
    const user = auth().currentUser;
    const idToken = await user?.getIdToken(true);
    if (!idToken) {
      throw new ApiError(
        `Phone verification failed\nuid=${user?.uid ?? 'null'}\nphone=${user?.phoneNumber ?? 'null'}`,
        400,
      );
    }
    try {
      await verifyFirebaseOtp(idToken, phone, purpose);
    } finally {
      try {
        await auth().signOut();
      } catch {
        /* ignore */
      }
      await clearOtpSession();
    }
  } catch (e) {
    throw toOtpApiError(e, 'Verification failed');
  }
}
