import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen } from '../types';

export function RedeemPointsScreen({ goTo }: { goTo: (s: AppScreen) => void }) {
  const [meter, setMeter] = useState('');
  const [pts, setPts] = useState('');
  const [done, setDone] = useState(false);
  const ptsNum = parseInt(pts || '0', 10);
  const valid = meter.length >= 11 && ptsNum >= 100 && ptsNum <= 1850;

  if (done) {
    return (
      <View style={styles.page}>
        <View style={styles.center}>
          <Text style={styles.title}>Redeemed!</Text>
          <Text style={styles.sub}>₦{ptsNum} electricity credit sent to meter {meter.slice(0, 4)}****</Text>
          <Pressable onPress={() => goTo('home')} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnTxt}>Back to Home</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <ScreenHeader title="Redeem Points" onBack={() => goTo('home')} />
      <View style={styles.content}>
        <TextInput style={styles.input} placeholder="Meter Number" placeholderTextColor="#C7C7C7" value={meter} onChangeText={v => setMeter(v.replace(/\D/g, '').slice(0, 13))} keyboardType="number-pad" />
        <TextInput style={styles.input} placeholder="Points to Redeem" placeholderTextColor="#C7C7C7" value={pts} onChangeText={v => setPts(v.replace(/\D/g, ''))} keyboardType="number-pad" />
        <Pressable disabled={!valid} onPress={() => setDone(true)} style={[styles.primaryBtn, !valid ? styles.btnDisabled : null]}>
          <Text style={styles.primaryBtnTxt}>{valid ? `Redeem ${ptsNum} pts` : 'Complete fields to continue'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  title: { color: C.ink, fontSize: 22, fontWeight: '700', marginBottom: 8 },
  sub: { color: C.muted, fontSize: 13, textAlign: 'center' },
  input: { height: 56, borderRadius: 10, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border, marginBottom: 10, paddingHorizontal: 14, color: C.ink },
  primaryBtn: { marginTop: 10, height: 50, borderRadius: 12, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  primaryBtnTxt: { color: C.ink, fontSize: 15, fontWeight: '800' },
  btnDisabled: { opacity: 0.5 },
});

