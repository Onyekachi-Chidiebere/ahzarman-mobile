import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen } from '../types';

export function ESIMScreen({ goTo }: { goTo: (s: AppScreen) => void }) {
  const plans = [
    { id: '1', name: 'Nigeria 2GB / 7 days', price: 3500 },
    { id: '2', name: 'Nigeria 5GB / 30 days', price: 6500 },
    { id: '3', name: 'Global 1GB / 7 days', price: 5500 },
  ];
  const [plan, setPlan] = useState<(typeof plans)[number] | null>(null);
  return (
    <View style={styles.page}>
      <ScreenHeader title="eSIM" onBack={() => goTo('services')} />
      <View style={styles.content}>
        <Text style={styles.title}>Choose a plan</Text>
        <View style={styles.list}>
          {plans.map(p => (
            <Pressable key={p.id} onPress={() => setPlan(p)} style={[styles.row, plan?.id === p.id ? styles.rowActive : null]}>
              <Text style={styles.name}>{p.name}</Text>
              <Text style={styles.price}>₦{p.price.toLocaleString()}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable disabled={!plan} onPress={() => goTo('success_simple')} style={[styles.btn, !plan ? styles.disabled : null]}>
          <Text style={styles.btnTxt}>{plan ? `Buy ${plan.name}` : 'Select plan'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  content: { flex: 1, padding: 16 },
  title: { color: C.ink, fontSize: 16, fontWeight: '700', marginBottom: 10 },
  list: { gap: 8, marginBottom: 12 },
  row: { backgroundColor: C.white, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowActive: { borderColor: C.primary, backgroundColor: C.primXlt },
  name: { color: C.ink, fontSize: 13, fontWeight: '600', flex: 1, paddingRight: 8 },
  price: { color: C.ink, fontSize: 13, fontWeight: '700' },
  btn: { height: 50, borderRadius: 12, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  btnTxt: { color: C.white, fontSize: 13, fontWeight: '700' },
  disabled: { opacity: 0.5 },
});

