import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
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

let sendInFlight = false;

function phonesMatch(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  const na = toE164Ng(a) || a.replace(/\D/g, '');
  const nb = toE164Ng(b) || b.replace(/\D/g, '');
  return na === nb;
}

function otpCodeFromError(e: unknown): string | null {
  const err = e as { code?: string; nativeErrorCode?: string | null };
  return err?.code || err?.nativeErrorCode || null;
}

/** Prefer clear copy for the usual “invalid code” cases users report. */
function friendlyFirebaseOtpMessage(e: unknown): string | null {
  const code = otpCodeFromError(e);
  switch (code) {
    case 'auth/invalid-verification-code':
      return 'That code is incorrect. Enter the 6-digit code from the SMS we just sent.';
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
  try {
    await AsyncStorage.removeItem(OTP_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function clearPhoneVerification() {
  void clearOtpSession();
}

/**
 * Manual ownership proof only:
 * 1) Firebase sends SMS
 * 2) User types the 6-digit code
 * 3) We create a credential from that typed code
 *
 * We intentionally do NOT auto-sign-in when Android retrieves the SMS —
 * that would skip the “type the code back” ownership check.
 */
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

    try {
      if (auth().currentUser) await auth().signOut();
    } catch {
      /* ignore */
    }

    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const finishOk = async (verificationId: string) => {
        if (settled || !verificationId) return;
        settled = true;
        await saveOtpSession({
          verificationId,
          phone,
          purpose,
          e164,
          createdAt: Date.now(),
        });
        resolve();
      };
      const finishErr = (e: unknown) => {
        if (settled) return;
        settled = true;
        reject(e);
      };

      // forceResend → boolean second arg (RN Firebase overload)
      const listener = opts?.forceResend
        ? auth().verifyPhoneNumber(e164, true)
        : auth().verifyPhoneNumber(e164);

      listener.on(
        'state_changed',
        snapshot => {
          const state = snapshot.state;
          const verificationId = snapshot.verificationId;

          // CODE_SENT — SMS left Firebase; show OTP UI. Do not auto-sign-in.
          if (state === auth.PhoneAuthState.CODE_SENT || state === 'sent') {
            void finishOk(verificationId).catch(finishErr);
            return;
          }

          // AUTO_VERIFIED — Android may have read the SMS; we still only store
          // verificationId and wait for the user to type the code themselves.
          if (state === auth.PhoneAuthState.AUTO_VERIFIED || state === 'verified') {
            if (verificationId) {
              void finishOk(verificationId).catch(finishErr);
            }
            return;
          }

          if (state === auth.PhoneAuthState.ERROR || state === 'error') {
            finishErr(snapshot.error || new Error('Phone verification failed'));
          }
        },
        (error: unknown) => finishErr(error),
      );
    });
  } catch (e) {
    throw toOtpApiError(e, 'Could not send verification code');
  } finally {
    sendInFlight = false;
  }
}

/** Confirm the 6-digit code the user typed (ownership proof). */
export async function completePhoneVerification(
  phone: string,
  code: string,
  purpose: 'register' | 'reset_pin',
): Promise<void> {
  try {
    const e164 = toE164Ng(phone);
    if (!e164) {
      throw new ApiError(`Invalid phone number: "${phone}"`, 400);
    }

    const digits = digitsOnlyOtp(code);
    if (digits.length !== 6) {
      throw new ApiError('Enter the 6-digit code from your SMS.', 400);
    }

    const session = await loadOtpSession();
    if (!session?.verificationId) {
      throw new ApiError('No verification in progress. Request a new code.', 400);
    }
    if (session.phone !== phone || session.purpose !== purpose) {
      await clearOtpSession();
      throw new ApiError('Phone number changed. Request a new code.', 400);
    }

    const credential = auth.PhoneAuthProvider.credential(session.verificationId, digits);
    await auth().signInWithCredential(credential);

    const user = auth().currentUser;
    if (!phonesMatch(user?.phoneNumber, e164)) {
      throw new ApiError(
        `Phone verification failed\nuid=${user?.uid ?? 'null'}\nphone=${user?.phoneNumber ?? 'null'}`,
        400,
      );
    }
    const idToken = await user.getIdToken(true);
    if (!idToken) {
      throw new ApiError('Could not get verification token. Try again.', 400);
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
