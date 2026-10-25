import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen } from '../types';

const grey = C.muted;

const SERVICES: Array<{
  screen: AppScreen;
  icon: string;
  title: string;
  sub: string;
  bg: string;
  fg: string;
}> = [
  {
    screen: 'airtime',
    icon: '📞',
    title: 'Airtime',
    sub: 'Top up any network with points',
    bg: '#D9EAF1',
    fg: '#1A6A8A',
  },
  {
    screen: 'data',
    icon: '📡',
    title: 'Data',
    sub: 'Buy data bundles with points',
    bg: '#FAE0DB',
    fg: '#A93226',
  },
  {
    screen: 'electricity',
    icon: '⚡',
    title: 'Electricity',
    sub: 'Pay for prepaid tokens with points',
    bg: '#EDDAF0',
    fg: '#7D3C98',
  },
  {
    screen: 'tv',
    icon: '📺',
    title: 'Cable TV',
    sub: 'DStv, GOtv & more with points',
    bg: '#FFF8D6',
    fg: '#9A7D0A',
  },
];

export function RedeemPointsScreen({
  goTo,
  userPoints,
}: {
  goTo: (s: AppScreen) => void;
  userPoints: number;
  authUser?: unknown;
  authToken?: string | null;
  onRedeemSuccess?: () => void | Promise<void>;
}) {
  return (
    <View style={styles.page}>
      <ScreenHeader title="Redeem Points" onBack={() => goTo('home')} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroLbl}>AVAILABLE TO SPEND</Text>
          <Text style={styles.heroBig}>
            {userPoints.toLocaleString()} <Text style={styles.heroPts}>pts</Text>
          </Text>
          <Text style={styles.heroSub}>1 pt = ₦1 · choose a service, then pay with Points</Text>
        </View>

        <Text style={styles.section}>USE POINTS FOR</Text>
        {SERVICES.map(s => (
          <Pressable
            key={s.screen}
            onPress={() => goTo(s.screen)}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
          >
            <View style={[styles.icon, { backgroundColor: s.bg }]}>
              <Text style={[styles.iconTxt, { color: s.fg }]}>{s.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{s.title}</Text>
              <Text style={styles.rowSub}>{s.sub}</Text>
            </View>
            <Text style={styles.chev}>›</Text>
          </Pressable>
        ))}

        <Text style={styles.footerHint}>
          On each service screen, select <Text style={styles.footerStrong}>Pay with Points</Text> and confirm with
          your PIN. You will not earn bonus points on points payments.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.white },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  hero: {
    backgroundColor: C.ink,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  heroLbl: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.5)', letterSpacing: 0.4 },
  heroBig: { fontSize: 32, fontWeight: '800', color: C.white, marginTop: 6 },
  heroPts: { fontSize: 18, fontWeight: '600', color: C.primary },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 8, lineHeight: 17 },
  section: {
    fontSize: 11,
    fontWeight: '500',
    color: grey,
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
    marginBottom: 10,
  },
  icon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTxt: { fontSize: 20 },
  rowTitle: { fontSize: 15, fontWeight: '700', color: C.ink },
  rowSub: { fontSize: 12, color: grey, marginTop: 2 },
  chev: { fontSize: 22, color: C.muted, fontWeight: '600' },
  footerHint: {
    marginTop: 12,
    fontSize: 12,
    color: grey,
    lineHeight: 18,
  },
  footerStrong: { fontWeight: '700', color: C.olive },
});
