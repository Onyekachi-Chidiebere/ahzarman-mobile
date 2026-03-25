import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NumPad } from '../NumPad';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen } from '../types';

const grey = C.muted;

function PinDots4({ val, err }: { val: string; err?: boolean }) {
  return (
    <View style={styles.dotsRow}>
      {[0, 1, 2, 3].map(i => (
        <View
          key={i}
          style={[
            styles.dot,
            { backgroundColor: i < val.length ? (err ? C.error : C.primary) : C.border },
          ]}
        />
      ))}
    </View>
  );
}

function OtpDots6({ val, err }: { val: string; err?: boolean }) {
  return (
    <View style={[styles.dotsRow, { gap: 10 }]}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <View
          key={i}
          style={[
            styles.otpDot,
            { backgroundColor: i < val.length ? (err ? C.error : C.primary) : C.border },
          ]}
        />
      ))}
    </View>
  );
}

function ForgotPinFlow({
  phone,
  onDone,
}: {
  phone: string;
  onDone: () => void;
}) {
  const [stage, setStage] = useState<'otp' | 'newpin' | 'confirm'>('otp');
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [err, setErr] = useState('');

  const onOtpDigit = (d: string) => {
    if (otp.length >= 6) return;
    const next = otp + d;
    setOtp(next);
    setErr('');
    if (next.length === 6) {
      if (next === '123456') setTimeout(() => setStage('newpin'), 300);
      else {
        setErr('Wrong OTP. Try again.');
        setTimeout(() => setOtp(''), 700);
      }
    }
  };

  const onPinDigit = (d: string) => {
    if (stage === 'newpin') {
      if (newPin.length >= 4) return;
      const next = newPin + d;
      setNewPin(next);
      if (next.length === 4) setTimeout(() => setStage('confirm'), 300);
    } else {
      if (confirmPin.length >= 4) return;
      const next = confirmPin + d;
      setConfirmPin(next);
      setErr('');
      if (next.length === 4) {
        if (next === newPin) setTimeout(() => onDone(), 400);
        else {
          setErr("PINs don't match. Try again.");
          setTimeout(() => setConfirmPin(''), 700);
        }
      }
    }
  };

  return (
    <View style={{ gap: 16 }}>
      {stage === 'otp' ? (
        <>
          <Text style={styles.h1}>Verify your number</Text>
          <Text style={styles.lead}>
            Enter the 6-digit OTP sent to <Text style={{ fontWeight: '700' }}>+234 {phone?.slice(-8)}</Text>
          </Text>
          <OtpDots6 val={otp} err={!!err} />
          {err ? (
            <View style={styles.errBox}>
              <Text style={styles.errTxt}>{err}</Text>
            </View>
          ) : null}
          <NumPad onDigit={onOtpDigit} onDelete={() => { setOtp(v => v.slice(0, -1)); setErr(''); }} />
          <Text style={styles.demo}>Demo OTP: 123456</Text>
        </>
      ) : null}

      {stage === 'newpin' ? (
        <>
          <Text style={styles.h1}>Set new PIN</Text>
          <Text style={styles.lead}>Choose a new 4-digit PIN</Text>
          <PinDots4 val={newPin} />
          <NumPad onDigit={onPinDigit} onDelete={() => setNewPin(v => v.slice(0, -1))} />
        </>
      ) : null}

      {stage === 'confirm' ? (
        <>
          <Text style={styles.h1}>Confirm PIN</Text>
          <Text style={styles.lead}>Enter your new PIN again</Text>
          <PinDots4 val={confirmPin} err={!!err} />
          {err ? (
            <View style={styles.errBox}>
              <Text style={styles.errTxt}>{err}</Text>
            </View>
          ) : null}
          <NumPad
            onDigit={onPinDigit}
            onDelete={() => {
              setConfirmPin(v => v.slice(0, -1));
              setErr('');
            }}
          />
        </>
      ) : null}
    </View>
  );
}

export function SignInScreen({ goTo }: { goTo: (s: AppScreen) => void }) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');

  const validPhone = phone.replace(/\D/g, '').length === 11;

  const onDigit = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setErr('');
    if (next.length === 4) {
      if (next === '1234') setTimeout(() => goTo('home'), 400);
      else {
        setErr('Incorrect PIN. Try again.');
        setTimeout(() => setPin(''), 700);
      }
    }
  };

  const headerBack = () => {
    if (step > 1) {
      setStep(1);
      setPin('');
      setErr('');
    } else goTo('onboarding');
  };

  return (
    <View style={styles.page}>
      <ScreenHeader title="Sign In" onBack={headerBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollInner} keyboardShouldPersistTaps="handled">
        {step === 1 ? (
          <>
            <Text style={styles.h1}>Welcome back 👋</Text>
            <Text style={styles.lead}>Sign in to your Ahzarman account.</Text>
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
            <Pressable disabled={!validPhone} onPress={() => validPhone && setStep(2)} style={[styles.btn, !validPhone && styles.btnDis]}>
              <Text style={styles.btnTxt}>Continue →</Text>
            </Pressable>
            <View style={styles.footerRow}>
              <Text style={styles.footerMuted}>New to Ahzarman? </Text>
              <Pressable onPress={() => goTo('sign_up')}>
                <Text style={styles.link}>Create account →</Text>
              </Pressable>
            </View>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <Text style={styles.h1}>Enter your PIN</Text>
            <Text style={styles.lead}>Use your 4-digit PIN to access your account.</Text>
            <PinDots4 val={pin} err={!!err} />
            {err ? (
              <View style={styles.errBox}>
                <Text style={styles.errTxt}>{err}</Text>
              </View>
            ) : null}
            <NumPad onDigit={onDigit} onDelete={() => { setPin(v => v.slice(0, -1)); setErr(''); }} />
            <Text style={styles.demo}>Demo PIN: 1234</Text>
            <View style={styles.footerRow}>
              <Text style={styles.footerMuted}>Forgot PIN? </Text>
              <Pressable onPress={() => setStep(3)}>
                <Text style={styles.link}>Reset PIN →</Text>
              </Pressable>
            </View>
          </>
        ) : null}

        {step === 3 ? <ForgotPinFlow phone={phone} onDone={() => goTo('home')} /> : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.white },
  scroll: { flex: 1 },
  scrollInner: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32, gap: 8 },
  h1: { fontSize: 20, fontWeight: '700', color: C.ink, marginBottom: 4 },
  lead: { fontSize: 14, color: grey, lineHeight: 21, marginBottom: 8 },
  label: { fontSize: 12, fontWeight: '500', color: grey, marginBottom: 6 },
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
  dotsRow: { flexDirection: 'row', gap: 16, justifyContent: 'center', marginVertical: 8 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  otpDot: { width: 12, height: 12, borderRadius: 6 },
  errBox: {
    backgroundColor: C.errorBg,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: C.errorBorder,
  },
  errTxt: { fontSize: 13, fontWeight: '500', color: C.error, textAlign: 'center' },
  demo: { textAlign: 'center', fontSize: 11, color: C.placeholder, marginTop: 8 },
});
