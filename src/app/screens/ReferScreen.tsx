import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen } from '../types';

export function ReferScreen({ goTo }: { goTo: (s: AppScreen) => void }) {
  const code = 'AHZ-MERCY-2026';
  return (
    <View style={styles.page}>
      <ScreenHeader title="Refer & Earn" onBack={() => goTo('home')} />
      <View style={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.heroBig}>₦2,500 pts</Text>
          <Text style={styles.heroSub}>per friend who joins and makes a purchase</Text>
          <View style={styles.codeRow}>
            <Text style={styles.codeTxt}>{code}</Text>
            <View style={styles.copyPill}>
              <Text style={styles.copyTxt}>Copy</Text>
            </View>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How it works</Text>
          <Text style={styles.item}>- Share your code with friends</Text>
          <Text style={styles.item}>- Friend signs up and makes first purchase</Text>
          <Text style={styles.item}>- You both earn 2,500 pts instantly</Text>
        </View>
        <Pressable onPress={() => goTo('home')} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnTxt}>Back to Home</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  heroCard: { backgroundColor: C.ink, borderRadius: 16, padding: 18, marginBottom: 12 },
  heroBig: { color: C.white, fontSize: 36, fontWeight: '700' },
  heroSub: { color: 'rgba(255,255,255,.45)', fontSize: 12, marginBottom: 12 },
  codeRow: { borderRadius: 10, padding: 12, backgroundColor: 'rgba(255,255,255,.08)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  codeTxt: { color: C.white, fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  copyPill: { backgroundColor: '#EDF1CE', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  copyTxt: { color: '#919E2D', fontSize: 11, fontWeight: '700' },
  card: { marginTop: 4, backgroundColor: C.white, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14 },
  cardTitle: { color: C.ink, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  item: { color: C.textColor, fontSize: 13, marginBottom: 6 },
  primaryBtn: { marginTop: 14, height: 50, borderRadius: 12, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  primaryBtnTxt: { color: C.ink, fontSize: 15, fontWeight: '800' },
});

