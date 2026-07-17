import auth, { type FirebaseAuthTypes } from '@react-native-firebase/auth';
import { sendOtp, verifyFirebaseOtp } from './auth';
import { ApiError } from './client';
import { toE164Ng } from './phone';

let pendingConfirmation: FirebaseAuthTypes.ConfirmationResult | null = null;

/** Build a full error string for display in the app UI. */
export function otpErrorMessage(e: unknown, fallback = 'OTP failed'): string {
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

/** Ask server + trigger Firebase SMS. */
export async function startPhoneVerification(
  phone: string,
  purpose: 'register' | 'reset_pin',
): Promise<void> {
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

    pendingConfirmation = await auth().signInWithPhoneNumber(e164);
  } catch (e) {
    throw toOtpApiError(e, 'Could not send verification code');
  }
}

/** Confirm 6-digit SMS code via Firebase. */
export async function completePhoneVerification(
  phone: string,
  code: string,
  purpose: 'register' | 'reset_pin',
): Promise<void> {
  try {
    if (!pendingConfirmation) {
      throw new ApiError('No verification in progress. Request a new code.', 400);
    }

    await pendingConfirmation.confirm(code);
    const user = auth().currentUser;
    const idToken = await user?.getIdToken();
    if (!idToken) {
      throw new ApiError(
        `Phone verification failed\nuid=${user?.uid ?? 'null'}\nphone=${user?.phoneNumber ?? 'null'}`,
        400,
      );
    }
    try {
      await verifyFirebaseOtp(idToken, phone, purpose);
    } finally {
      await auth().signOut();
      pendingConfirmation = null;
    }
  } catch (e) {
    throw toOtpApiError(e, 'Verification failed');
  }
}

export function clearPhoneVerification() {
  pendingConfirmation = null;
}
