import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen } from '../types';

export function SharePointsScreen({ goTo }: { goTo: (s: AppScreen) => void }) {
  const contacts = [
    { name: 'Mum', phone: '08034567890' },
    { name: 'Office', phone: '09012345678' },
  ];
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [pts, setPts] = useState('');
  const [done, setDone] = useState(false);
  const ptsNum = parseInt(pts || '0', 10);
  const valid = phone.length === 11 && ptsNum >= 10 && ptsNum <= 1850;

  if (done) {
    return (
      <View style={styles.page}>
        <View style={styles.center}>
          <Text style={styles.title}>{ptsNum} pts sent!</Text>
          <Text style={styles.sub}>Points transferred to {name || phone}</Text>
          <Pressable onPress={() => goTo('home')} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnTxt}>Back to Home</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <ScreenHeader title="Share Points" onBack={() => goTo('home')} />
      <View style={styles.content}>
        <View style={styles.quickRow}>
          {contacts.map(c => (
            <Pressable key={c.phone} onPress={() => { setPhone(c.phone); setName(c.name); }} style={styles.quickItem}>
              <View style={styles.quickAvatar}><Text style={styles.quickAvatarTxt}>{c.name[0]}</Text></View>
              <Text style={styles.quickLabel}>{c.name}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput style={styles.input} placeholder="Recipient Phone Number" placeholderTextColor="#C7C7C7" value={phone} onChangeText={v => setPhone(v.replace(/\D/g, '').slice(0, 11))} keyboardType="number-pad" />
        <TextInput style={styles.input} placeholder="Points to Send" placeholderTextColor="#C7C7C7" value={pts} onChangeText={v => setPts(v.replace(/\D/g, ''))} keyboardType="number-pad" />
        <Pressable disabled={!valid} onPress={() => setDone(true)} style={[styles.primaryBtn, !valid ? styles.btnDisabled : null]}>
          <Text style={styles.primaryBtnTxt}>{valid ? `Send ${ptsNum} pts →` : 'Enter recipient and amount'}</Text>
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
  quickRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  quickItem: { alignItems: 'center', gap: 4 },
  quickAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  quickAvatarTxt: { color: C.ink, fontWeight: '700', fontSize: 18 },
  quickLabel: { color: C.muted, fontSize: 11, fontWeight: '600' },
  input: { height: 56, borderRadius: 10, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border, marginBottom: 10, paddingHorizontal: 14, color: C.ink },
  primaryBtn: { marginTop: 10, height: 50, borderRadius: 12, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  primaryBtnTxt: { color: C.ink, fontSize: 15, fontWeight: '800' },
  btnDisabled: { opacity: 0.5 },
});

