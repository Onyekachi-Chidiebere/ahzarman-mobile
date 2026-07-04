import auth, { type FirebaseAuthTypes } from '@react-native-firebase/auth';
import { sendOtp, verifyFirebaseOtp } from './auth';
import { ApiError } from './client';
import { toE164Ng } from './phone';

let pendingConfirmation: FirebaseAuthTypes.ConfirmationResult | null = null;

/** Ask server + trigger Firebase SMS. */
export async function startPhoneVerification(
  phone: string,
  purpose: 'register' | 'reset_pin',
): Promise<void> {
  const r = await sendOtp(phone, purpose);

  if (r.delivery !== 'firebase') {
    throw new ApiError('Firebase OTP is not configured on the server', 503);
  }

  const e164 = toE164Ng(phone);
  if (!e164) {
    throw new ApiError('Invalid phone number', 400);
  }

  pendingConfirmation = await auth().signInWithPhoneNumber(e164);
}

/** Confirm 6-digit SMS code via Firebase. */
export async function completePhoneVerification(
  phone: string,
  code: string,
  purpose: 'register' | 'reset_pin',
): Promise<void> {
  if (!pendingConfirmation) {
    throw new ApiError('No verification in progress. Request a new code.', 400);
  }

  await pendingConfirmation.confirm(code);
  const user = auth().currentUser;
  const idToken = await user?.getIdToken();
  if (!idToken) {
    throw new ApiError('Phone verification failed', 400);
  }
  try {
    await verifyFirebaseOtp(idToken, phone, purpose);
  } finally {
    await auth().signOut();
    pendingConfirmation = null;
  }
}

export function clearPhoneVerification() {
  pendingConfirmation = null;
}
