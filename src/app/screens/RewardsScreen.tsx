import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen } from '../types';

export function RewardsScreen({ goTo }: { goTo: (s: AppScreen) => void }) {
  return (
    <View style={styles.page}>
      <ScreenHeader title="Rewards" />
      <View style={styles.content}>
        <View style={styles.rewCard}>
          <Text style={styles.rewLabel}>YOUR POINTS</Text>
          <Text style={styles.rewBig}>1,850 pts</Text>
          <Text style={styles.rewSub}>Silver tier - 3,150 pts to Gold</Text>
          <View style={styles.rewBar}>
            <View style={styles.rewBarFill} />
          </View>
          <View style={styles.actions}>
            <Pressable onPress={() => goTo('share_points')} style={styles.primaryBtn}>
              <Text style={styles.primaryTxt}>Share Points</Text>
            </Pressable>
            <Pressable onPress={() => goTo('redeem_points')} style={styles.ghostBtn}>
              <Text style={styles.ghostTxt}>Redeem</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  rewCard: { backgroundColor: C.ink, borderRadius: 16, padding: 18, marginBottom: 12 },
  rewLabel: { color: 'rgba(255,255,255,.5)', fontSize: 11, fontWeight: '600', marginBottom: 4 },
  rewBig: { color: C.white, fontSize: 36, fontWeight: '700' },
  rewSub: { color: 'rgba(255,255,255,.45)', fontSize: 11, marginBottom: 10 },
  rewBar: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,.12)', marginBottom: 12 },
  rewBarFill: { width: '37%', height: '100%', borderRadius: 3, backgroundColor: C.primary },
  actions: { flexDirection: 'row', gap: 10 },
  primaryBtn: { flex: 1, height: 36, borderRadius: 8, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  primaryTxt: { color: C.ink, fontSize: 12, fontWeight: '700' },
  ghostBtn: { flex: 1, height: 36, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  ghostTxt: { color: C.white, fontSize: 12, fontWeight: '700' },
});

