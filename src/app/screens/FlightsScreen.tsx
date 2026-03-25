import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen } from '../types';

export function FlightsScreen({ goTo }: { goTo: (s: AppScreen) => void }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [adults, setAdults] = useState('1');
  const valid = !!from && !!to && !!date && parseInt(adults || '0', 10) > 0;
  return (
    <View style={styles.page}>
      <ScreenHeader title="Flights" onBack={() => goTo('services')} />
      <View style={styles.content}>
        <TextInput style={styles.input} placeholder="From (city/airport)" placeholderTextColor="#C7C7C7" value={from} onChangeText={setFrom} />
        <TextInput style={styles.input} placeholder="To (city/airport)" placeholderTextColor="#C7C7C7" value={to} onChangeText={setTo} />
        <TextInput style={styles.input} placeholder="Departure Date" placeholderTextColor="#C7C7C7" value={date} onChangeText={setDate} />
        <TextInput style={styles.input} placeholder="Adults" placeholderTextColor="#C7C7C7" value={adults} onChangeText={v => setAdults(v.replace(/\D/g, '').slice(0, 2))} keyboardType="number-pad" />
        <Pressable disabled={!valid} onPress={() => goTo('success_simple')} style={[styles.btn, !valid ? styles.disabled : null]}>
          <Text style={styles.btnTxt}>{valid ? 'Search Flights' : 'Fill all fields'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  content: { flex: 1, padding: 16 },
  input: { height: 52, borderRadius: 10, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.white, paddingHorizontal: 14, color: C.ink, marginBottom: 10 },
  btn: { height: 50, borderRadius: 12, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  btnTxt: { color: C.white, fontSize: 13, fontWeight: '700' },
  disabled: { opacity: 0.5 },
});

