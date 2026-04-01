import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { C } from '../constants';
import { SERVICE_ITEMS, txMeta } from '../data';
import { MoreIcon, ServiceIcon, type ServiceItemKey } from '../assets/icons';
import type { AppScreen, Tx } from '../types';

function MarketingCarousel({ goTo }: { goTo: (s: AppScreen) => void }) {
  const [idx, setIdx] = useState(0);
  const promos: Array<{ id: string; bg: string; title: string; sub: string; cta: string; screen: AppScreen }> = [
    { id: 'refer', bg: '#020202', title: 'Refer friends. They get light. You get points.', sub: '₦2,500 points per friend', cta: 'Refer Now', screen: 'refer' },
    { id: 'elec', bg: '#1C3A1C', title: 'Every ₦5,000 electricity token = 500 points', sub: 'Redeemable as free electricity', cta: 'Buy Electricity', screen: 'electricity' },
    { id: 'share', bg: '#1A1A3A', title: 'Share your points with a neighbour', sub: 'Transfer to any Ahzarman user', cta: 'Share Points', screen: 'share_points' },
  ];
  useEffect(() => {
    const id = setInterval(() => setIdx(p => (p + 1) % promos.length), 4000);
    return () => clearInterval(id);
  }, [promos.length]);
  const p = promos[idx];
  return (
    <Pressable onPress={() => goTo(p.screen)} style={[styles.promoCard, { backgroundColor: p.bg }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.promoTitle}>{p.title}</Text>
        <Text style={styles.promoSub}>{p.sub}</Text>
        <View style={styles.promoBtn}>
          <Text style={styles.promoBtnTxt}>{p.cta} →</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function HomeScreen({
  goTo,
  transactions,
}: {
  goTo: (s: AppScreen) => void;
  transactions: Tx[];
}) {
  return (
    <View style={styles.page}>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.avatar} />
          <View style={styles.topTextWrap}>
            <Text style={styles.topHi}>Hi, Mercy!</Text>
            <Text style={styles.topSub}>Welcome back</Text>
          </View>
          <Pressable onPress={() => goTo('notifications')} hitSlop={10} style={styles.iconBtn}>
            <Text style={styles.iconBtnTxt}>🔔</Text>
          </Pressable>
        </View>

        <View style={styles.pointsCard}>
          <Text style={styles.pointsLabel}>AHZARMAN POINTS</Text>
          <Text style={styles.pointsBig}>1,850 pts</Text>
          <Text style={styles.pointsSub}>= ₦1,850 electricity credit · shareable</Text>
          <View style={styles.pointsActions}>
            <Pressable onPress={() => goTo('share_points')} style={styles.pointsPrimaryBtn}><Text style={styles.pointsPrimaryBtnTxt}>Share Points</Text></Pressable>
            <Pressable onPress={() => goTo('redeem_points')} style={styles.pointsGhostBtn}><Text style={styles.pointsGhostBtnTxt}>Redeem</Text></Pressable>
          </View>
        </View>

        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Services</Text>
          <Pressable onPress={() => goTo('services')}>
            <Text style={styles.link}>See all →</Text>
          </Pressable>
        </View>
        <View style={styles.gridCard}>
          <View style={styles.grid}>
            {SERVICE_ITEMS.map(i => (
              <Pressable
                key={i.key}
                onPress={() => goTo(i.key as AppScreen)}
                style={[styles.homeSvcTile, { backgroundColor: i.color }]}
              >
                <ServiceIcon name={i.key as ServiceItemKey} size={24} />
                <Text style={styles.gridLabel}>{i.label}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => goTo('services')} style={[styles.homeSvcTile, styles.moreTile]}>
              <MoreIcon width={22} height={22} />
              <Text style={styles.moreLabel}>More →</Text>
            </Pressable>
          </View>
        </View>
        <MarketingCarousel goTo={goTo} />

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Recent transactions</Text>
            <Pressable onPress={() => goTo('history')} hitSlop={10}>
              <Text style={styles.link}>See all →</Text>
            </Pressable>
          </View>
          <FlatList
            data={transactions.slice(0, 4)}
            keyExtractor={(t: Tx) => t.id}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            renderItem={({ item }) => (
              <View style={styles.txRow}>
                <View style={[styles.txAvatar, { backgroundColor: txMeta(item).bg }]}>
                  <Text style={[styles.txAvatarIcon, { color: txMeta(item).fg }]}>{txMeta(item).icon}</Text>
                </View>
                <View style={styles.txLeft}>
                  <Text style={styles.txTitle}>{item.title}</Text>
                  <Text style={styles.txSub}>{item.date}</Text>
                </View>
                <Text style={styles.txAmt}>{item.amount}</Text>
              </View>
            )}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 90 },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#E0E7AD' },
  topTextWrap: { flex: 1, marginLeft: 8 },
  topHi: { color: C.textColor, fontSize: 15, fontWeight: '500' },
  topSub: { color: C.muted, fontSize: 11 },
  iconBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  iconBtnTxt: { fontSize: 16 },
  pointsCard: { backgroundColor: C.ink, borderRadius: 16, padding: 18, marginBottom: 14 },
  pointsLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '500', marginBottom: 3 },
  pointsBig: { color: C.white, fontSize: 36, fontWeight: '700', marginBottom: 2 },
  pointsSub: { color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 14 },
  pointsActions: { flexDirection: 'row', gap: 10 },
  pointsPrimaryBtn: { flex: 1, height: 36, borderRadius: 8, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  pointsPrimaryBtnTxt: { color: C.ink, fontSize: 12, fontWeight: '700' },
  pointsGhostBtn: { flex: 1, height: 36, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  pointsGhostBtnTxt: { color: C.white, fontSize: 12, fontWeight: '700' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: C.textColor, fontSize: 15, fontWeight: '600' },
  link: { color: C.primary, fontSize: 12, fontWeight: '700' },
  gridCard: {
    marginTop: 10,
    backgroundColor: C.white,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 12,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  homeSvcTile: { width: '31.5%', minHeight: 88, borderRadius: 9, padding: 10, alignItems: 'center', justifyContent: 'center', gap: 7 },
  moreTile: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: C.borderMd,
    gap: 6,
  },
  moreLabel: { fontSize: 12, fontWeight: '500', textAlign: 'center', color: C.olive },
  gridLabel: { fontSize: 12, fontWeight: '500', textAlign: 'center', color: C.muted },
  promoCard: { marginTop: 14, borderRadius: 12, padding: 14, minHeight: 120 },
  promoTitle: { color: '#F8F9F6', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  promoSub: { color: 'rgba(255,255,255,.55)', fontSize: 11, marginBottom: 10 },
  promoBtn: { alignSelf: 'flex-start', backgroundColor: C.white, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 5 },
  promoBtnTxt: { color: C.ink, fontSize: 11, fontWeight: '600' },
  card: { marginTop: 16, backgroundColor: C.white, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14 },
  cardTitle: { color: C.ink, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  sep: { height: 1, backgroundColor: C.border, marginVertical: 10 },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  txAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  txAvatarIcon: { fontSize: 16, fontWeight: '700' },
  txLeft: { flex: 1 },
  txTitle: { color: C.ink, fontSize: 13, fontWeight: '700' },
  txSub: { color: C.muted, fontSize: 10, marginTop: 2 },
  txAmt: { color: C.ink, fontSize: 13, fontWeight: '700' },
});

