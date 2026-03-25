import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen } from '../types';

export function ElecSuccessScreen({ goTo }: { goTo: (s: AppScreen) => void }) {
  return (
    <View style={styles.page}>
      <ScreenHeader title="Payment Successful" onBack={() => goTo('home')} />
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Successful</Text>
          <Text style={styles.subtle}>₦5,050 - 49.5 kWh - AEDC</Text>
          <View style={styles.txPtsPill}>
            <Text style={styles.txPtsTxt}>+250 pts</Text>
          </View>
        </View>
        <View style={[styles.card, { backgroundColor: '#1A1A1A' }]}>
          <Text style={[styles.cardTitle, { color: '#fff' }]}>Electricity Token</Text>
          <Text style={styles.tokenTxt}>4582 - 1937 - 6402 - 9857 - 1634</Text>
          <Text style={[styles.subtle, { color: 'rgba(255,255,255,.65)' }]}>Meter: 45123678901 - AEDC</Text>
        </View>
        <Pressable onPress={() => goTo('home')} style={styles.primaryBtnWide}>
          <Text style={styles.primaryBtnTxt}>Back to Home</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },
  card: {
    marginTop: 16,
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
  },
  cardTitle: { color: C.ink, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  subtle: { marginTop: 6, color: C.muted, fontSize: 13 },
  txPtsPill: { marginTop: 8, backgroundColor: '#EDF1CE', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1, alignSelf: 'flex-start' },
  txPtsTxt: { color: '#919E2D', fontSize: 10, fontWeight: '700' },
  tokenTxt: { color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: 1.2, marginBottom: 8 },
  primaryBtnWide: {
    marginTop: 16,
    width: '100%',
    height: 50,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnTxt: { color: C.ink, fontSize: 15, fontWeight: '800' },
});