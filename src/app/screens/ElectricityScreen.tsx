import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen } from '../types';

export function ElectricityScreen({ goTo }: { goTo: (s: AppScreen) => void }) {
  const discos = [
    { id: 'AEDC', name: 'Abuja Electricity' },
    { id: 'IKEDC', name: 'Ikeja Electric' },
    { id: 'EKEDC', name: 'Eko Electricity' },
  ];
  const [disco, setDisco] = useState<typeof discos[number] | null>(null);
  const [meter, setMeter] = useState('');
  const [amount, setAmount] = useState('');
  const [verified, setVerified] = useState(false);

  return (
    <View style={styles.page}>
      <ScreenHeader title="Buy Electricity" onBack={() => goTo('services')} />
      <View style={styles.content}>
        <Text style={styles.label}>Distribution Company (DisCo)</Text>
        <View style={styles.row}>
          {discos.map(d => (
            <Pressable key={d.id} onPress={() => setDisco(d)} style={[styles.chip, disco?.id === d.id ? styles.chipActive : null]}>
              <Text style={styles.chipTxt}>{d.id}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          style={styles.input}
          placeholder="Meter Number"
          keyboardType="number-pad"
          value={meter}
          onChangeText={v => {
            setMeter(v.replace(/\D/g, '').slice(0, 13));
            setVerified(false);
          }}
          placeholderTextColor="#C7C7C7"
        />
        <Pressable disabled={!disco || meter.length < 11} onPress={() => setVerified(true)} style={styles.verifyBtn}>
          <Text style={styles.verifyTxt}>{verified ? 'Verified ✓' : 'Verify Meter'}</Text>
        </Pressable>
        <TextInput
          style={styles.input}
          placeholder="Amount (₦500 minimum)"
          keyboardType="number-pad"
          value={amount}
          onChangeText={v => setAmount(v.replace(/\D/g, ''))}
          placeholderTextColor="#C7C7C7"
        />
        <Pressable
          disabled={!verified || parseInt(amount || '0', 10) < 500}
          onPress={() => goTo('elec_success')}
          style={styles.payBtn}
        >
          <Text style={styles.payTxt}>Pay Now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  label: { color: C.muted, fontSize: 11, fontWeight: '600', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  chip: { paddingHorizontal: 12, height: 34, borderRadius: 10, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  chipActive: { borderColor: C.primary, backgroundColor: C.primXlt },
  chipTxt: { color: C.ink, fontSize: 12, fontWeight: '700' },
  input: {
    height: 52,
    borderRadius: 10,
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 14,
    color: C.ink,
    marginBottom: 10,
  },
  verifyBtn: { height: 46, borderRadius: 10, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  verifyTxt: { color: C.ink, fontWeight: '700' },
  payBtn: { height: 50, borderRadius: 12, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  payTxt: { color: '#fff', fontWeight: '700' },
});

