import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen } from '../types';

export function BettingScreen({ goTo }: { goTo: (s: AppScreen) => void }) {
  const [provider, setProvider] = useState<string | null>(null);
  const [account, setAccount] = useState('');
  const [amount, setAmount] = useState('');
  const providers = ['Bet9ja', 'SportyBet', '1xBet', 'BetKing'];
  const valid = !!provider && account.length >= 5 && parseInt(amount || '0', 10) >= 100;
  return (
    <View style={styles.page}>
      <ScreenHeader title="Betting" onBack={() => goTo('services')} />
      <View style={styles.content}>
        <View style={styles.row}>
          {providers.map(p => (
            <Pressable key={p} onPress={() => setProvider(p)} style={[styles.chip, provider === p ? styles.chipActive : null]}>
              <Text style={styles.chipTxt}>{p}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput style={styles.input} placeholder="Betting User ID / Phone" placeholderTextColor="#C7C7C7" value={account} onChangeText={setAccount} />
        <TextInput style={styles.input} placeholder="Amount" placeholderTextColor="#C7C7C7" keyboardType="number-pad" value={amount} onChangeText={v => setAmount(v.replace(/\D/g, ''))} />
        <Pressable disabled={!valid} onPress={() => goTo('success_simple')} style={[styles.btn, !valid ? styles.disabled : null]}>
          <Text style={styles.btnTxt}>{valid ? `Fund Wallet - ₦${parseInt(amount || '0', 10).toLocaleString()}` : 'Select provider and fill fields'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  content: { flex: 1, padding: 16 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  chip: { height: 38, borderRadius: 10, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  chipActive: { borderColor: C.primary, backgroundColor: C.primXlt },
  chipTxt: { color: C.ink, fontWeight: '700', fontSize: 12 },
  input: { height: 52, borderRadius: 10, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.white, paddingHorizontal: 14, color: C.ink, marginBottom: 10 },
  btn: { height: 50, borderRadius: 12, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  btnTxt: { color: C.white, fontSize: 13, fontWeight: '700' },
  disabled: { opacity: 0.5 },
});

