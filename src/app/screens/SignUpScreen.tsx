import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen } from '../types';

export function SignUpScreen({ goTo }: { goTo: (s: AppScreen) => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const canContinue = name.trim().length >= 2 && phone.length === 11;

  return (
    <View style={styles.page}>
      <ScreenHeader title="Create Account" onBack={() => goTo('onboarding')} />
      <View style={styles.content}>
        <Text style={styles.h1}>Welcome to Ahzarman 👋</Text>
        <Text style={styles.sub}>Your one-stop app for bills, airtime, and rewards.</Text>
        <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#C7C7C7" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Phone Number (11 digits)" placeholderTextColor="#C7C7C7" value={phone} onChangeText={v => setPhone(v.replace(/\D/g, '').slice(0, 11))} keyboardType="number-pad" />
        <Pressable disabled={!canContinue} onPress={() => goTo('home')} style={[styles.btn, !canContinue ? styles.btnDisabled : null]}>
          <Text style={styles.btnTxt}>Create Account & Sign In →</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  h1: { color: C.textColor, fontSize: 22, fontWeight: '700' },
  sub: { marginTop: 6, color: C.muted, fontSize: 13, marginBottom: 10 },
  input: { height: 56, borderRadius: 10, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border, marginBottom: 10, paddingHorizontal: 14, color: C.ink },
  btn: { marginTop: 10, height: 50, borderRadius: 12, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  btnTxt: { color: C.ink, fontSize: 15, fontWeight: '800' },
  btnDisabled: { opacity: 0.5 },
});

