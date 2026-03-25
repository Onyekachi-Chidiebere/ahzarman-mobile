import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { PaymentPinModal, ScreenHeader } from '../components';
import { C } from '../constants';
import { TV_PROVIDERS } from '../tvProviders';
import type { AppScreen, Tx } from '../types';

const grey = C.muted;
const PROVIDER_KEYS = Object.keys(TV_PROVIDERS) as Array<keyof typeof TV_PROVIDERS>;

export function TVScreen({
  goTo,
  onAddTx,
  onPurchaseComplete,
}: {
  goTo: (s: AppScreen) => void;
  onAddTx: (tx: Tx) => void;
  onPurchaseComplete: (pts: number) => void;
}) {
  const [provider, setProvider] = useState<(typeof PROVIDER_KEYS)[number]>('DStv');
  const [plan, setPlan] = useState<(typeof TV_PROVIDERS)['DStv']['plans'][0] | null>(null);
  const [decoder, setDecoder] = useState('');
  const [verifyingDec, setVerifyingDec] = useState(false);
  const [verifiedDec, setVerifiedDec] = useState<{ name: string } | null>(null);
  const [showPin, setShowPin] = useState(false);

  const plans = TV_PROVIDERS[provider].plans;

  const handleVerifyDec = () => {
    if (decoder.length < 5) return;
    setVerifyingDec(true);
    setVerifiedDec(null);
    setTimeout(() => {
      setVerifyingDec(false);
      setVerifiedDec({ name: 'MERCY OKAFOR' });
    }, 1800);
  };

  const handleSuccess = () => {
    if (!plan) return;
    onAddTx({
      id: String(Date.now()),
      type: 'tv',
      title: `${provider} ${plan.name}`,
      amount: `-₦${plan.price.toLocaleString()}`,
      pts: `+${plan.pts} pts`,
      date: 'Just now',
      status: 'Successful',
    });
    setShowPin(false);
    onPurchaseComplete(plan.pts);
  };

  return (
    <View style={styles.page}>
      <ScreenHeader title="Cable TV" onBack={() => goTo('services')} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>PROVIDER</Text>
        <View style={styles.prow}>
          {PROVIDER_KEYS.map(p => (
            <Pressable
              key={p}
              onPress={() => {
                setProvider(p);
                setPlan(null);
                setDecoder('');
                setVerifiedDec(null);
              }}
              style={[
                styles.pchip,
                provider === p ? { borderColor: C.primary, backgroundColor: C.primFaint } : null,
              ]}
            >
              <Text style={[styles.pchipTxt, provider === p ? { fontWeight: '700', color: C.olive } : { color: grey }]}>
                {p}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>DECODER / SMART CARD NUMBER</Text>
        <View style={styles.decRow}>
          <View style={[styles.decInputWrap, verifiedDec ? { borderColor: C.successBorder, backgroundColor: C.successBg } : null]}>
            <TextInput
              value={decoder}
              onChangeText={v => {
                setDecoder(v.replace(/\D/g, '').slice(0, 12));
                setVerifiedDec(null);
              }}
              placeholder="Enter decoder / smart card number"
              placeholderTextColor={C.placeholder}
              keyboardType="number-pad"
              style={styles.decInput}
            />
            {verifiedDec ? (
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Circle cx={12} cy={12} r={10} fill={C.success} />
                <Path d="M8 12l3 3 5-5" stroke={C.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            ) : null}
          </View>
          <Pressable
            onPress={handleVerifyDec}
            disabled={decoder.length < 5 || verifyingDec || !!verifiedDec}
            style={[
              styles.vbtn,
              verifiedDec ? { backgroundColor: C.successBg } : decoder.length >= 5 && !verifyingDec ? null : { backgroundColor: C.disabled },
            ]}
          >
            {verifyingDec ? (
              <ActivityIndicator color={grey} />
            ) : verifiedDec ? (
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path d="M5 12l5 5L20 7" stroke={C.success} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            ) : (
              <Text style={[styles.vbtnTxt, decoder.length < 5 && { color: C.disabledTxt }]}>Verify</Text>
            )}
          </Pressable>
        </View>
        {verifiedDec ? (
          <View style={styles.okBox}>
            <Text style={styles.okName}>{verifiedDec.name}</Text>
            <Text style={styles.okSub}>Verified {provider} subscriber</Text>
          </View>
        ) : null}
        {verifyingDec ? (
          <View style={styles.pending}>
            <ActivityIndicator size="small" color={grey} />
            <Text style={styles.pendingTxt}>Verifying decoder…</Text>
          </View>
        ) : null}

        <Text style={styles.label}>{provider} PLANS</Text>
        {plans.map(p => {
          const sel = plan?.name === p.name;
          return (
            <Pressable
              key={p.name}
              disabled={!verifiedDec}
              onPress={() => verifiedDec && setPlan(p)}
              style={[
                styles.planCard,
                sel ? { borderColor: C.primary, backgroundColor: C.primFaint } : null,
                !verifiedDec && { opacity: 0.55 },
              ]}
            >
              <View>
                <Text style={styles.planName}>{p.name}</Text>
                <Text style={styles.planDesc}>
                  {p.desc} · Monthly
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.planPrice}>₦{p.price.toLocaleString()}</Text>
                <View style={styles.ptsPill}>
                  <Text style={styles.ptsTxt}>+{p.pts} pts</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
        {!verifiedDec ? <Text style={styles.warn}>Verify your decoder number first to select a plan</Text> : null}

        <Pressable
          disabled={!plan || !verifiedDec}
          onPress={() => plan && verifiedDec && setShowPin(true)}
          style={[styles.cta, (!plan || !verifiedDec) && styles.ctaDis]}
        >
          <Text style={styles.ctaTxt}>
            {plan && verifiedDec
              ? `Subscribe ${provider} ${plan.name} — ₦${plan.price.toLocaleString()}`
              : 'Verify decoder & select a plan'}
          </Text>
        </Pressable>
      </ScrollView>

      <PaymentPinModal
        visible={showPin}
        amountLabel={plan ? `₦${plan.price.toLocaleString()}` : '₦0'}
        onDismiss={() => setShowPin(false)}
        onConfirm={handleSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32, gap: 8 },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: grey,
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  prow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  pchip: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pchipTxt: { fontSize: 13 },
  decRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  decInputWrap: {
    flex: 1,
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    backgroundColor: C.white,
  },
  decInput: { flex: 1, fontSize: 14, fontWeight: '500', color: C.ink },
  vbtn: {
    width: 80,
    height: 52,
    borderRadius: 10,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vbtnTxt: { fontSize: 13, fontWeight: '600', color: C.ink },
  okBox: {
    backgroundColor: C.successBg,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: C.successBorder,
  },
  okName: { fontSize: 13, fontWeight: '700', color: C.success },
  okSub: { fontSize: 11, color: C.success, opacity: 0.85, marginTop: 4 },
  pending: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pendingTxt: { fontSize: 12, color: grey },
  planCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
    marginBottom: 8,
  },
  planName: { fontSize: 14, fontWeight: '600', color: C.ink },
  planDesc: { fontSize: 11, color: grey, marginTop: 2 },
  planPrice: { fontSize: 15, fontWeight: '700', color: C.ink },
  ptsPill: {
    marginTop: 4,
    backgroundColor: C.primXlt,
    borderRadius: 4,
    paddingVertical: 1,
    paddingHorizontal: 6,
  },
  ptsTxt: { fontSize: 10, fontWeight: '600', color: C.olive },
  warn: { fontSize: 12, color: C.placeholder, marginTop: 4 },
  cta: {
    height: 50,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  ctaDis: { opacity: 0.45 },
  ctaTxt: { fontSize: 15, fontWeight: '700', color: C.ink },
});
