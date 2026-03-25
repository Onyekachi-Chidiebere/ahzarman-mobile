import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen } from '../types';

export function ProfileScreen({ goTo }: { goTo: (s: AppScreen) => void }) {
  const rows = [
    { label: 'Personal Info', sub: 'Name, email, phone', screen: 'personal_info', icon: '👤' },
    { label: 'Security', sub: 'Change PIN, password', screen: 'security', icon: '🔒' },
    { label: 'Notifications', sub: 'Alerts & prefs', screen: 'notifications', icon: '🔔' },
    { label: 'Payment Settings', sub: 'Methods, limits, receipts', screen: 'payment_settings', icon: '💳' },
    { label: 'Beneficiaries', sub: 'Saved contacts', screen: 'beneficiaries', icon: '👥' },
    { label: 'Contact Us', sub: 'WhatsApp, email, phone', screen: 'contact_us', icon: '💬' },
    { label: 'Terms & Privacy', sub: 'Legal documents', screen: 'terms', icon: '📄' },
  ] as const;

  return (
    <View style={styles.page}>
      <ScreenHeader title="Profile" />
      <View style={styles.content}>
        <View style={styles.topCard}>
          <View style={styles.avatar}><Text style={styles.avatarTxt}>M</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>Mercy James</Text>
            <Text style={styles.email}>mercy@ahzarman.app</Text>
          </View>
          <View style={styles.pill}><Text style={styles.pillTxt}>Silver</Text></View>
        </View>
        <View style={styles.card}>
          {rows.map((r, i) => (
            <View key={r.label}>
              <Pressable onPress={() => goTo(r.screen as AppScreen)} style={styles.row}>
                <View style={styles.iconWrap}><Text>{r.icon}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{r.label}</Text>
                  <Text style={styles.sub}>{r.sub}</Text>
                </View>
                <Text style={styles.chev}>›</Text>
              </Pressable>
              {i < rows.length - 1 ? <View style={styles.sep} /> : null}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  topCard: { backgroundColor: C.white, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.primXlt, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: '#919E2D', fontSize: 20, fontWeight: '700' },
  name: { color: C.ink, fontSize: 14, fontWeight: '700' },
  email: { color: C.muted, fontSize: 12, marginTop: 2 },
  pill: { backgroundColor: '#EDF1CE', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  pillTxt: { color: '#919E2D', fontSize: 11, fontWeight: '700' },
  card: { marginTop: 12, backgroundColor: C.white, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 10 },
  row: { paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconWrap: { width: 34, height: 34, borderRadius: 10, backgroundColor: C.primXlt, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  label: { color: C.ink, fontSize: 13, fontWeight: '600' },
  sub: { color: C.muted, fontSize: 11, marginTop: 2 },
  chev: { color: C.muted, fontSize: 18, fontWeight: '600' },
  sep: { height: 1, backgroundColor: C.border },
});

