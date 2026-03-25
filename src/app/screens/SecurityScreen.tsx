import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen } from '../types';

const grey = C.muted;
const PAD_ROWS: (string | null)[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  [null, '0', 'del'],
];

function PinDots({ value }: { value: string }) {
  return (
    <View style={styles.dotsRow}>
      {[0, 1, 2, 3].map(i => (
        <View
          key={i}
          style={[
            styles.dot,
            i < value.length ? styles.dotFilled : null,
            { borderColor: i < value.length ? C.primary : '#D0D0D0' },
          ]}
        />
      ))}
    </View>
  );
}

function PinKeypad({
  value,
  onChange,
}: {
  value: string;
  onChange: (fn: (v: string) => string) => void;
}) {
  return (
    <View style={styles.padWrap}>
      {PAD_ROWS.map((row, ri) => (
        <View key={ri} style={styles.padRow}>
          {row.map((d, di) => {
            if (d === null) return <View key={di} style={styles.padSpacer} />;
            if (d === 'del') {
              return (
                <Pressable
                  key={di}
                  onPress={() => onChange(v => v.slice(0, -1))}
                  style={styles.padKeyGhost}
                >
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"
                      stroke={C.ink}
                      strokeWidth={1.8}
                      strokeLinejoin="round"
                    />
                    <Line x1="18" y1="9" x2="12" y2="15" stroke={C.ink} strokeWidth={1.8} strokeLinecap="round" />
                    <Line x1="12" y1="9" x2="18" y2="15" stroke={C.ink} strokeWidth={1.8} strokeLinecap="round" />
                  </Svg>
                </Pressable>
              );
            }
            return (
              <Pressable
                key={di}
                onPress={() => {
                  if (value.length < 4) onChange(v => v + d);
                }}
                style={styles.padKey}
              >
                <Text style={styles.padKeyTxt}>{d}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function PinInput({
  label,
  hint,
  value,
  onChange,
  err,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (fn: (v: string) => string) => void;
  err?: string;
}) {
  return (
    <View style={styles.pinBlock}>
      <Text style={styles.pinTitle}>{label}</Text>
      {hint ? <Text style={styles.pinHint}>{hint}</Text> : null}
      <PinDots value={value} />
      <PinKeypad value={value} onChange={onChange} />
      {err ? <Text style={styles.err}>{err}</Text> : null}
    </View>
  );
}

export function SecurityScreen({ goTo }: { goTo: (s: AppScreen) => void }) {
  const [step, setStep] = useState(0);
  const [cur, setCur] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pendingNewPin, setPendingNewPin] = useState('');
  const [conf, setConf] = useState('');
  const [err, setErr] = useState('');

  const resetFlow = () => {
    setStep(0);
    setCur('');
    setNewPin('');
    setPendingNewPin('');
    setConf('');
    setErr('');
  };

  const handleBackFromPin = () => {
    setErr('');
    if (step === 1) {
      resetFlow();
      return;
    }
    if (step === 2) {
      setNewPin('');
      setStep(1);
      return;
    }
    if (step === 3) {
      setConf('');
      setPendingNewPin('');
      setStep(2);
    }
  };

  const onContinue = () => {
    setErr('');
    if (step === 1) {
      if (cur === '1234') {
        setStep(2);
        setCur('');
      } else {
        setErr('Incorrect current PIN');
        setCur('');
      }
    } else if (step === 2) {
      if (newPin.length === 4) {
        setPendingNewPin(newPin);
        setStep(3);
        setNewPin('');
      } else setErr('Enter 4 digits');
    } else if (step === 3) {
      if (conf === pendingNewPin) setStep(4);
      else {
        setErr("PINs don't match");
        setConf('');
      }
    }
  };

  const canContinue =
    (step === 1 && cur.length === 4) ||
    (step === 2 && newPin.length === 4) ||
    (step === 3 && conf.length === 4);

  if (step === 4) {
    return (
      <View style={styles.pageWhite}>
        <ScreenHeader title="Security" onBack={() => goTo('profile')} />
        <View style={styles.doneWrap}>
          <View style={styles.doneIcon}>
            <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
              <Path
                d="M5 12l5 5L20 7"
                stroke={C.olive}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <Text style={styles.doneTitle}>PIN Changed!</Text>
          <Text style={styles.doneSub}>Your transaction PIN has been updated successfully.</Text>
          <Pressable
            onPress={() => {
              resetFlow();
              goTo('profile');
            }}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnTxt}>Done</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (step > 0) {
    return (
      <View style={styles.pageWhite}>
        <ScreenHeader title="Change PIN" onBack={handleBackFromPin} />
        <View style={styles.pinPage}>
          {step === 1 ? (
            <PinInput
              label="Current PIN"
              hint="Demo PIN: 1234"
              value={cur}
              onChange={setCur}
              err={err}
            />
          ) : null}
          {step === 2 ? (
            <PinInput label="New PIN" hint="Choose a 4-digit PIN" value={newPin} onChange={setNewPin} err={err} />
          ) : null}
          {step === 3 ? (
            <PinInput
              label="Confirm New PIN"
              hint="Re-enter your new PIN"
              value={conf}
              onChange={setConf}
              err={err}
            />
          ) : null}
          {canContinue ? (
            <View style={styles.continueWrap}>
              <Pressable onPress={onContinue} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnTxt}>{step === 3 ? 'Confirm New PIN' : 'Continue'}</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  const menu = [
    { icon: '🔑', label: 'Change Transaction PIN', sub: 'Update your 4-digit payment PIN', action: () => setStep(1) },
    { icon: '🔐', label: 'Change Password', sub: 'Update your login password', action: null as (() => void) | null },
    { icon: '👁', label: 'Biometric Login', sub: 'Use fingerprint or face ID', action: null },
    { icon: '📱', label: 'Two-Factor Auth', sub: 'Extra security on login', action: null },
  ];

  return (
    <View style={styles.page}>
      <ScreenHeader title="Security" onBack={() => goTo('profile')} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollPad}>
        {menu.map((item, i) => {
          const rowStyle = [
            styles.menuCard,
            i === 0 ? styles.menuTop : null,
            i === menu.length - 1 ? styles.menuBot : null,
            i > 0 ? styles.menuOverlap : null,
          ];
          const inner = (
            <>
              <View style={styles.menuIcon}>
                <Text style={styles.menuIconTxt}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSub}>{item.sub}</Text>
              </View>
              {item.action ? (
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path d="M9 18l6-6-6-6" stroke={grey} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              ) : null}
            </>
          );
          return item.action ? (
            <Pressable key={item.label} onPress={item.action} style={({ pressed }) => [...rowStyle, pressed ? { opacity: 0.92 } : null]}>
              {inner}
            </Pressable>
          ) : (
            <View key={item.label} style={rowStyle}>
              {inner}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  pageWhite: { flex: 1, backgroundColor: C.white },
  scroll: { flex: 1 },
  scrollPad: { paddingHorizontal: 16, paddingTop: 20 },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
  },
  menuTop: { borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  menuBot: { borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  menuOverlap: { marginTop: -1 },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.primFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconTxt: { fontSize: 18 },
  menuLabel: { fontSize: 14, fontWeight: '500', color: C.ink },
  menuSub: { fontSize: 11, color: grey, marginTop: 2 },
  pinPage: { flex: 1, justifyContent: 'center', paddingHorizontal: 16, paddingBottom: 24 },
  pinBlock: { alignItems: 'center' },
  pinTitle: { fontSize: 16, fontWeight: '600', color: C.ink, marginBottom: 6 },
  pinHint: { fontSize: 13, color: grey, marginBottom: 20, textAlign: 'center' },
  dotsRow: { flexDirection: 'row', gap: 14, justifyContent: 'center', marginBottom: 16 },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.border,
    borderWidth: 2,
  },
  dotFilled: { backgroundColor: C.primary },
  padWrap: { gap: 4, paddingHorizontal: 24, width: '100%', alignSelf: 'stretch' },
  padRow: { flexDirection: 'row', gap: 4 },
  padSpacer: { flex: 1, height: 56 },
  padKey: {
    flex: 1,
    height: 56,
    backgroundColor: '#F8F9F6',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  padKeyGhost: { flex: 1, height: 56, alignItems: 'center', justifyContent: 'center' },
  padKeyTxt: { fontSize: 22, fontWeight: '600', color: C.ink },
  err: { fontSize: 12, fontWeight: '500', color: C.error, marginTop: 12 },
  continueWrap: { paddingHorizontal: 24, marginTop: 16 },
  primaryBtn: {
    width: '100%',
    height: 50,
    backgroundColor: C.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnTxt: { fontSize: 16, fontWeight: '700', color: C.ink },
  doneWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  doneIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.primXlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneTitle: { fontSize: 20, fontWeight: '700', color: C.ink, textAlign: 'center' },
  doneSub: { fontSize: 14, color: grey, textAlign: 'center' },
});
