import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen } from '../types';

export function TVScreen({ goTo }: { goTo: (s: AppScreen) => void }) {
  const providers = ['DStv', 'GOtv', 'Startimes'] as const;
  const plans = useMemo(
    () => ({
      DStv: [{ name: 'Compact', price: 9600 }, { name: 'Access', price: 3600 }],
      GOtv: [{ name: 'Jolli', price: 3280 }, { name: 'Jinja', price: 2460 }],
      Startimes: [{ name: 'Classic', price: 2750 }, { name: 'Basic', price: 1850 }],
    }),
    [],
  );
  const [provider, setProvider] = useState<(typeof providers)[number]>('DStv');
  const [decoder, setDecoder] = useState('');
  const [verified, setVerified] = useState(false);
  const [plan, setPlan] = useState<{ name: string; price: number } | null>(null);
  const canPay = verified && !!plan;

  return (
    <View style={styles.page}>
      <ScreenHeader title="Cable TV" onBack={() => goTo('services')} />
      <View style={styles.content}>
        <View style={styles.providerRow}>
          {providers.map(p => (
            <Pressable key={p} onPress={() => { setProvider(p); setPlan(null); }} style={[styles.providerBtn, p === provider ? styles.providerActive : null]}>
              <Text style={styles.providerTxt}>{p}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          style={styles.input}
          placeholder="Decoder / Smart Card Number"
          placeholderTextColor="#C7C7C7"
          keyboardType="number-pad"
          value={decoder}
          onChangeText={v => { setDecoder(v.replace(/\D/g, '').slice(0, 12)); setVerified(false); }}
        />
        <Pressable disabled={decoder.length < 5} onPress={() => setVerified(true)} style={[styles.verifyBtn, decoder.length < 5 ? styles.disabled : null]}>
          <Text style={styles.verifyTxt}>{verified ? 'Verified ✓' : 'Verify Decoder'}</Text>
        </Pressable>
        <View style={styles.list}>
          {plans[provider].map(p => (
            <Pressable key={p.name} disabled={!verified} onPress={() => setPlan(p)} style={[styles.planRow, plan?.name === p.name ? styles.planActive : null, !verified ? styles.disabled : null]}>
              <View>
                <Text style={styles.planName}>{p.name}</Text>
                <Text style={styles.planSub}>Monthly subscription</Text>
              </View>
              <Text style={styles.planPrice}>₦{p.price.toLocaleString()}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable disabled={!canPay} onPress={() => goTo('success_simple')} style={[styles.payBtn, !canPay ? styles.disabled : null]}>
          <Text style={styles.payTxt}>{canPay ? `Subscribe ${plan?.name} - ₦${plan?.price.toLocaleString()}` : 'Verify decoder & select plan'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  content: { flex: 1, padding: 16 },
  providerRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  providerBtn: { flex: 1, height: 42, borderRadius: 10, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center' },
  providerActive: { borderColor: C.primary, backgroundColor: C.primXlt },
  providerTxt: { color: C.ink, fontSize: 13, fontWeight: '700' },
  input: { height: 52, borderRadius: 10, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.white, paddingHorizontal: 14, color: C.ink, marginBottom: 10 },
  verifyBtn: { height: 46, borderRadius: 10, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  verifyTxt: { color: C.ink, fontWeight: '700' },
  list: { gap: 8 },
  planRow: { backgroundColor: C.white, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planActive: { borderColor: C.primary, backgroundColor: C.primXlt },
  planName: { color: C.ink, fontSize: 14, fontWeight: '700' },
  planSub: { color: C.muted, fontSize: 11, marginTop: 2 },
  planPrice: { color: C.ink, fontSize: 14, fontWeight: '700' },
  payBtn: { marginTop: 12, height: 50, borderRadius: 12, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  payTxt: { color: C.white, fontSize: 13, fontWeight: '700' },
  disabled: { opacity: 0.5 },
});

