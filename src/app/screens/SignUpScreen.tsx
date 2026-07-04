import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { AuthUser } from '../api/auth';
import { registerAccount } from '../api/auth';
import { completePhoneVerification, startPhoneVerification } from '../api/phoneOtp';
import { ApiError } from '../api/client';
import Svg, { Path } from 'react-native-svg';
import { NumPad } from '../NumPad';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen } from '../types';

const grey = C.muted;

function Progress({ step }: { step: number }) {
  return (
    <View style={styles.progressRow}>
      {[1, 2, 3].map((n, idx) => (
        <View key={n} style={styles.progressFrag}>
          <View style={[styles.progressDot, n <= step ? { backgroundColor: C.primary } : { backgroundColor: C.disabled }]}>
            {n < step ? (
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path d="M5 12l5 5L20 7" stroke={C.ink} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            ) : (
              <Text style={{ fontSize: 12, fontWeight: '700', color: n <= step ? C.ink : grey }}>{n}</Text>
            )}
          </View>
          {idx < 2 ? (
            <View style={[styles.progressLine, { backgroundColor: n < step ? C.primary : C.border }]} />
          ) : null}
        </View>
      ))}
    </View>
  );
}

function PinDots({ val, n = 4 }: { val: string; n?: number }) {
  return (
    <View style={styles.pinDots}>
      {Array.from({ length: n }).map((_, i) => (
        <View key={i} style={[styles.pinDot, i < val.length ? { backgroundColor: C.primary } : { backgroundColor: C.border }]} />
      ))}
    </View>
  );
}

export function SignUpScreen({
  goTo,
  onAuthSuccess,
}: {
  goTo: (s: AppScreen) => void;
  onAuthSuccess: (token: string, user: AuthUser) => void | Promise<void>;
}) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinStage, setPinStage] = useState<'create' | 'confirm'>('create');
  const [pinErr, setPinErr] = useState('');
  const [resendKey, setResendKey] = useState(0);
  const [apiErr, setApiErr] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (step !== 2) return;
    setTimer(60);
    setCanResend(false);
    const iv = setInterval(
      () =>
        setTimer(t => {
          if (t <= 1) {
            clearInterval(iv);
            setCanResend(true);
            return 0;
          }
          return t - 1;
        }),
      1000,
    );
    return () => clearInterval(iv);
  }, [step, resendKey]);

  const canStep1 = name.trim().length >= 2 && phone.replace(/\D/g, '').length === 11;

  const handlePinContinue = async () => {
    setPinErr('');
    if (pinStage === 'create') {
      if (pin.length < 4) return;
      setPinStage('confirm');
      return;
    }
    if (pin !== confirmPin) {
      setPinErr('PINs do not match. Try again.');
      setConfirmPin('');
      return;
    }
    setRegistering(true);
    setApiErr('');
    try {
      const res = await registerAccount(name.trim(), phone, pin);
      if (res.data?.token && res.data?.user) {
        await onAuthSuccess(res.data.token, res.data.user);
      }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not create account';
      setApiErr(msg);
    } finally {
      setRegistering(false);
    }
  };

  const handleBack = () => {
    if (step === 3 && pinStage === 'confirm') {
      setPinStage('create');
      setConfirmPin('');
      return;
    }
    if (step > 1) setStep(s => s - 1);
    else goTo('onboarding');
  };

  return (
    <View style={styles.page}>
      <ScreenHeader title="Create Account" onBack={handleBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollInner} keyboardShouldPersistTaps="handled">
        <Progress step={step} />

        {step === 1 ? (
          <>
            <Text style={styles.h1}>Welcome to Ahzarman 👋</Text>
            <Text style={styles.lead}>Your one-stop app for bills, airtime, and rewards.</Text>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Mercy Okafor"
              placeholderTextColor={C.placeholder}
              value={name}
              onChangeText={setName}
            />
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.phoneRow}>
              <Text style={styles.prefix}>🇳🇬 +234</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="080 xxx xxxx"
                placeholderTextColor={C.placeholder}
                value={phone}
                onChangeText={v => setPhone(v.replace(/\D/g, '').slice(0, 11))}
                keyboardType="phone-pad"
              />
            </View>
            {apiErr ? (
              <View style={styles.errBox}>
                <Text style={styles.errTxt}>{apiErr}</Text>
              </View>
            ) : null}
            <Pressable
              disabled={!canStep1 || sending}
              onPress={async () => {
                if (!canStep1 || sending) return;
                setApiErr('');
                setSending(true);
                try {
                  await startPhoneVerification(phone, 'register');
                  setStep(2);
                } catch (e) {
                  setApiErr(e instanceof ApiError ? e.message : 'Could not send code');
                } finally {
                  setSending(false);
                }
              }}
              style={[styles.btn, (!canStep1 || sending) && styles.btnDis]}
            >
              {sending ? (
                <ActivityIndicator color={C.ink} />
              ) : (
                <Text style={styles.btnTxt}>Send Verification Code →</Text>
              )}
            </Pressable>
            <View style={styles.footerRow}>
              <Text style={styles.footerMuted}>Already have an account? </Text>
              <Pressable onPress={() => goTo('sign_in')}>
                <Text style={styles.link}>Sign in →</Text>
              </Pressable>
            </View>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <Text style={styles.h1}>Verify your number</Text>
            <Text style={styles.lead}>
              Enter the 6-digit code sent to <Text style={{ fontWeight: '600', color: C.ink }}>+234{phone}</Text>
            </Text>
            <View style={styles.otpRow}>
              {Array.from({ length: 6 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.otpBox,
                    otp.length === i ? { borderColor: C.primary } : otp.length > i ? { borderColor: '#C8D080' } : null,
                    otp.length > i ? { backgroundColor: C.primFaint } : null,
                  ]}
                >
                  <Text style={styles.otpChar}>{otp[i] || ''}</Text>
                </View>
              ))}
            </View>
            <NumPad
              onDigit={d => {
                if (otp.length < 6) setOtp(v => v + d);
              }}
              onDelete={() => setOtp(v => v.slice(0, -1))}
            />
            {apiErr ? (
              <View style={styles.errBox}>
                <Text style={styles.errTxt}>{apiErr}</Text>
              </View>
            ) : null}
            <Pressable
              disabled={otp.length < 6 || verifying}
              onPress={async () => {
                if (otp.length < 6 || verifying) return;
                setApiErr('');
                setVerifying(true);
                try {
                  await completePhoneVerification(phone, otp, 'register');
                  setStep(3);
                } catch (e) {
                  setApiErr(e instanceof ApiError ? e.message : 'Verification failed');
                } finally {
                  setVerifying(false);
                }
              }}
              style={[styles.btn, (otp.length < 6 || verifying) && styles.btnDis]}
            >
              {verifying ? (
                <ActivityIndicator color={C.ink} />
              ) : (
                <Text style={styles.btnTxt}>Verify & Continue →</Text>
              )}
            </Pressable>
            <Text style={styles.centerTxt}>
              {canResend ? (
                <Text
                  onPress={() => {
                    setOtp('');
                    setResendKey(k => k + 1);
                    void (async () => {
                      try {
                        await startPhoneVerification(phone, 'register');
                      } catch (e) {
                        setApiErr(e instanceof ApiError ? e.message : 'Could not resend');
                      }
                    })();
                  }}
                  style={styles.link}
                >
                  Resend code →
                </Text>
              ) : (
                <>
                  <Text style={styles.footerMuted}>Resend in </Text>
                  <Text style={{ fontWeight: '600' }}>
                    {`${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')}`}
                  </Text>
                </>
              )}
            </Text>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <Text style={styles.h1}>{pinStage === 'create' ? 'Create your PIN' : 'Confirm your PIN'}</Text>
            <Text style={styles.lead}>
              {pinStage === 'create'
                ? 'Set a 4-digit PIN to secure your account.'
                : 'Re-enter your PIN to confirm.'}
            </Text>
            <PinDots val={pinStage === 'create' ? pin : confirmPin} />
            {pinErr || apiErr ? (
              <View style={styles.errBox}>
                <Text style={styles.errTxt}>{pinErr || apiErr}</Text>
              </View>
            ) : null}
            <NumPad
              onDigit={d => {
                const cur = pinStage === 'create' ? pin : confirmPin;
                const setter = pinStage === 'create' ? setPin : setConfirmPin;
                if (cur.length < 4) setter(v => v + d);
              }}
              onDelete={() => {
                if (pinStage === 'create') setPin(v => v.slice(0, -1));
                else setConfirmPin(v => v.slice(0, -1));
              }}
            />
            <Pressable
              disabled={(pinStage === 'create' ? pin : confirmPin).length < 4 || registering}
              onPress={() => void handlePinContinue()}
              style={[
                styles.btn,
                ((pinStage === 'create' ? pin : confirmPin).length < 4 || registering) && styles.btnDis,
              ]}
            >
              {registering ? (
                <ActivityIndicator color={C.ink} />
              ) : (
                <Text style={styles.btnTxt}>
                  {pinStage === 'create' ? 'Continue →' : 'Create Account & Sign In →'}
                </Text>
              )}
            </Pressable>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.white },
  scroll: { flex: 1 },
  scrollInner: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32, gap: 4 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  progressFrag: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  progressLine: { flex: 1, height: 2, marginHorizontal: -4 },
  h1: { fontSize: 20, fontWeight: '700', color: C.ink, marginBottom: 4 },
  lead: { fontSize: 14, color: grey, lineHeight: 21, marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '500', color: grey, marginBottom: 6 },
  input: {
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 14,
    fontSize: 15,
    color: C.ink,
    marginBottom: 12,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  prefix: { fontSize: 14, marginRight: 8 },
  phoneInput: { flex: 1, fontSize: 15, color: C.ink },
  btn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  btnDis: { opacity: 0.45 },
  btnTxt: { fontSize: 16, fontWeight: '700', color: C.ink },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' },
  footerMuted: { fontSize: 13, color: grey },
  link: { fontSize: 13, fontWeight: '600', color: C.olive },
  otpRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', paddingVertical: 8 },
  otpBox: {
    width: 46,
    height: 52,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: C.border,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpChar: { fontSize: 20, fontWeight: '700', color: C.ink },
  centerTxt: { textAlign: 'center', marginTop: 8, flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
  demo: { textAlign: 'center', fontSize: 11, color: C.placeholder, marginTop: 8 },
  pinDots: { flexDirection: 'row', gap: 16, justifyContent: 'center', marginVertical: 8 },
  pinDot: { width: 14, height: 14, borderRadius: 7 },
  errBox: {
    backgroundColor: C.errorBg,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: C.errorBorder,
    marginBottom: 8,
  },
  errTxt: { fontSize: 13, fontWeight: '500', color: C.error, textAlign: 'center' },
});
