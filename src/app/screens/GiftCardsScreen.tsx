import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen } from '../types';

export function GiftCardsScreen({ goTo }: { goTo: (s: AppScreen) => void }) {
  const [country, setCountry] = useState('NG');
  const [card, setCard] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const cards = useMemo(() => ['Netflix', 'iTunes', 'Google Play', 'Steam'], []);
  const canBuy = !!card && !!amount && !!email;

  return (
    <View style={styles.page}>
      <ScreenHeader title="Gift Cards" onBack={() => goTo('services')} />
      <View style={styles.content}>
        <View style={styles.row}>
          {['NG', 'US', 'UK'].map(c => (
            <Pressable key={c} onPress={() => { setCountry(c); setCard(null); }} style={[styles.chip, c === country ? styles.chipActive : null]}>
              <Text style={styles.chipTxt}>{c}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.grid}>
          {cards.map(c => (
            <Pressable key={c} onPress={() => setCard(c)} style={[styles.card, card === c ? styles.cardActive : null]}>
              <Text style={styles.cardTxt}>{c}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput style={styles.input} placeholder="Amount" placeholderTextColor="#C7C7C7" keyboardType="number-pad" value={amount} onChangeText={v => setAmount(v.replace(/\D/g, ''))} />
        <TextInput style={styles.input} placeholder="Recipient Email" placeholderTextColor="#C7C7C7" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <Pressable disabled={!canBuy} onPress={() => goTo('success_simple')} style={[styles.btn, !canBuy ? styles.disabled : null]}>
          <Text style={styles.btnTxt}>{canBuy ? `Buy ${card} - ₦${parseInt(amount || '0', 10).toLocaleString()}` : 'Select card and fill fields'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  content: { flex: 1, padding: 16 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  chip: { height: 38, minWidth: 56, borderRadius: 10, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  chipActive: { borderColor: C.primary, backgroundColor: C.primXlt },
  chipTxt: { color: C.ink, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  card: { width: '48%', height: 56, borderRadius: 10, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center' },
  cardActive: { borderColor: C.primary, backgroundColor: C.primXlt },
  cardTxt: { color: C.ink, fontWeight: '700' },
  input: { height: 52, borderRadius: 10, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.white, paddingHorizontal: 14, color: C.ink, marginBottom: 10 },
  btn: { height: 50, borderRadius: 12, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  btnTxt: { color: C.white, fontSize: 13, fontWeight: '700' },
  disabled: { opacity: 0.5 },
});

