import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen, Estate } from '../types';

const grey = C.muted;

const TIERS = [
  {
    name: 'Bronze',
    pts: '0–999',
    col: '#CD7F32',
    active: false,
    benefits: ['5% points bonus', 'Basic services', 'Monthly statement'],
  },
  {
    name: 'Silver',
    pts: '1,000–4,999',
    col: '#A8A9AD',
    active: true,
    benefits: [
      '10% points bonus',
      'Priority support',
      'Electricity token in 5s',
      'Points gifting enabled',
    ],
  },
  {
    name: 'Gold',
    pts: '5,000–14,999',
    col: '#D4AF37',
    active: false,
    benefits: ['20% points bonus', 'Account manager', 'Zero service fees', 'Exclusive promos'],
  },
  {
    name: 'Platinum',
    pts: '15,000+',
    col: '#2E8B57',
    active: false,
    benefits: ['30% points bonus', 'Free monthly airtime', 'Zero fees forever', 'VIP support'],
  },
] as const;

const POINTS_HIST = [
  { type: 'electricity' as const, action: 'Electricity payment', pts: '+250 pts', date: 'Today' },
  { type: 'airtime' as const, action: 'Referred Tunde', pts: '+500 pts', date: 'Yesterday' },
  { type: 'airtime' as const, action: 'Airtime purchase', pts: '+30 pts', date: '2 days ago' },
];

const HIST_ICON: Record<(typeof POINTS_HIST)[number]['type'], string> = {
  electricity: '⚡',
  airtime: '📞',
};

export function RewardsScreen({
  goTo,
  userEstate,
  estatePoints,
}: {
  goTo: (s: AppScreen) => void;
  userEstate: Estate | null;
  estatePoints: number;
}) {
  const [selTier, setSelTier] = useState<number | null>(null);
  const displayed = selTier !== null ? TIERS[selTier] : null;
  const myShare = estatePoints > 0 ? estatePoints : 185;
  const poolDisplay = 24810 + estatePoints;

  return (
    <View style={styles.page}>
      <ScreenHeader title="Rewards" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.rewCard}>
          <Text style={styles.rewLabel}>YOUR POINTS</Text>
          <Text style={styles.rewBig}>1,850 pts</Text>
          <Text style={styles.rewSub}>Silver tier · 3,150 pts to Gold</Text>
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

        <Pressable onPress={() => goTo('refer')} style={styles.referBanner}>
          <View style={styles.referIconWrap}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"
                stroke={C.primary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.referTitle}>Refer & Earn</Text>
            <Text style={styles.referSub}>
              Get <Text style={styles.referHighlight}>₦2,500 pts</Text> for every friend you invite
            </Text>
          </View>
          <View style={styles.referBadge}>
            <Text style={styles.referBadgeTxt}>2 referred</Text>
          </View>
          <Text style={styles.referChev}>›</Text>
        </Pressable>

        {userEstate ? (
          <Pressable
            onPress={() => goTo('estate_account')}
            style={[styles.estateCard, { borderColor: `${userEstate.color}28` }]}
          >
            <View style={[styles.estateInner, { backgroundColor: userEstate.colorLight }]}>
              <View style={styles.estateTop}>
                <View style={[styles.estateIconBox, { backgroundColor: userEstate.color }]}>
                  <Text style={styles.estateIconEmoji}>{userEstate.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.estateCardName}>{userEstate.name}</Text>
                  <Text style={styles.estateCardSub}>Estate Community Pool</Text>
                </View>
                <Text style={styles.estateChev}>›</Text>
              </View>
              <View style={styles.estateStats}>
                <View style={[styles.estateStatBox, { borderColor: `${userEstate.color}30` }]}>
                  <Text style={styles.estateStatLabel}>Community Pool</Text>
                  <Text style={[styles.estateStatVal, { color: userEstate.color }]}>
                    {poolDisplay.toLocaleString()} <Text style={styles.estateStatUnit}>pts</Text>
                  </Text>
                </View>
                <View style={[styles.estateStatBox, { borderColor: `${userEstate.color}30` }]}>
                  <Text style={styles.estateStatLabel}>Your Share</Text>
                  <Text style={[styles.estateStatVal, { color: C.olive }]}>
                    {myShare} <Text style={styles.estateStatUnit}>pts</Text>
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        ) : null}

        <View style={styles.tierSection}>
          <Text style={styles.tierHint}>Tap a tier to see benefits</Text>
          <View style={styles.tierRow}>
            {TIERS.map((t, i) => {
              const on = t.active || selTier === i;
              return (
                <Pressable
                  key={t.name}
                  onPress={() => setSelTier(selTier === i ? null : i)}
                  style={[
                    styles.tierChip,
                    {
                      backgroundColor: t.active ? C.white : selTier === i ? '#F5F8E8' : '#F5F6F1',
                      borderColor: selTier === i || t.active ? C.primary : 'transparent',
                    },
                  ]}
                >
                  <View style={[styles.tierDot, { backgroundColor: t.col, opacity: on ? 1 : 0.5 }]} />
                  <Text style={[styles.tierName, { color: on ? C.ink : grey, fontWeight: on ? '700' : '400' }]}>
                    {t.name}
                  </Text>
                  <Text style={styles.tierPts}>{t.pts}</Text>
                  {t.active ? (
                    <Text style={styles.tierCurrent}>CURRENT</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
          {displayed ? (
            <View style={styles.benefitsPanel}>
              <Text style={styles.benefitsTitle}>{displayed.name} Benefits</Text>
              {displayed.benefits.map(b => (
                <View key={b} style={styles.benefitRow}>
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Circle cx={12} cy={12} r={10} fill={C.primary} />
                    <Path
                      d="M8 12l3 3 5-5"
                      stroke={C.ink}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                  <Text style={styles.benefitTxt}>{b}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.histCard}>
          <Text style={styles.histTitle}>Points History</Text>
          {POINTS_HIST.map((h, i) => (
            <View
              key={h.action}
              style={[styles.histRow, i < POINTS_HIST.length - 1 && styles.histRowSep]}
            >
              <View style={styles.histAv}>
                <Text style={styles.histAvTxt}>{HIST_ICON[h.type]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.histAction}>{h.action}</Text>
                <Text style={styles.histDate}>{h.date}</Text>
              </View>
              <Text style={styles.histPts}>{h.pts}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 90, gap: 14 },
  rewCard: { backgroundColor: C.ink, borderRadius: 16, padding: 18 },
  rewLabel: { color: 'rgba(255,255,255,.5)', fontSize: 11, fontWeight: '600', marginBottom: 4 },
  rewBig: { color: C.white, fontSize: 36, fontWeight: '700', marginBottom: 2 },
  rewSub: { color: 'rgba(255,255,255,.45)', fontSize: 11, marginBottom: 10 },
  rewBar: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,.12)', marginBottom: 12 },
  rewBarFill: { width: '37%', height: '100%', borderRadius: 3, backgroundColor: C.primary },
  actions: { flexDirection: 'row', gap: 10 },
  primaryBtn: { flex: 1, height: 38, borderRadius: 8, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  primaryTxt: { color: C.ink, fontSize: 13, fontWeight: '700' },
  ghostBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostTxt: { color: C.white, fontSize: 13, fontWeight: '700' },

  referBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.ink,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(163,183,8,.2)',
  },
  referIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(163,183,8,.15)',
    borderWidth: 1,
    borderColor: 'rgba(163,183,8,.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  referTitle: { fontSize: 14, fontWeight: '700', color: C.white },
  referSub: { fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 2 },
  referHighlight: { color: C.primary, fontWeight: '700' },
  referBadge: { backgroundColor: C.primary, borderRadius: 6, paddingVertical: 4, paddingHorizontal: 10 },
  referBadgeTxt: { fontSize: 10, fontWeight: '700', color: C.ink },
  referChev: { fontSize: 16, color: 'rgba(255,255,255,.4)', fontWeight: '600' },

  estateCard: { borderRadius: 14, borderWidth: 1.5, overflow: 'hidden' },
  estateInner: { padding: 14 },
  estateTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  estateIconBox: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  estateIconEmoji: { fontSize: 18 },
  estateCardName: { fontSize: 13, fontWeight: '700', color: C.ink },
  estateCardSub: { fontSize: 11, color: grey, marginTop: 2 },
  estateChev: { fontSize: 16, color: grey, fontWeight: '600' },
  estateStats: { flexDirection: 'row', gap: 10 },
  estateStatBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,.7)',
    borderRadius: 9,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  estateStatLabel: {
    fontSize: 10,
    color: grey,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  estateStatVal: { fontSize: 18, fontWeight: '700' },
  estateStatUnit: { fontSize: 12, fontWeight: '400', color: grey },

  tierSection: { gap: 10 },
  tierHint: { fontSize: 14, fontWeight: '600', color: C.textColor },
  tierRow: { flexDirection: 'row', gap: 8 },
  tierChip: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  tierDot: { width: 28, height: 28, borderRadius: 14, marginBottom: 6 },
  tierName: { fontSize: 11, textAlign: 'center' },
  tierPts: { fontSize: 9, color: grey, marginTop: 2, textAlign: 'center' },
  tierCurrent: {
    fontSize: 8,
    fontWeight: '700',
    color: C.primary,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  benefitsPanel: {
    marginTop: 10,
    backgroundColor: C.white,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  benefitsTitle: { fontSize: 13, fontWeight: '600', color: C.ink, marginBottom: 10 },
  benefitRow: { flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'flex-start' },
  benefitTxt: { flex: 1, fontSize: 13, color: C.body },

  histCard: {
    backgroundColor: C.white,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  histTitle: { fontSize: 14, fontWeight: '600', color: C.textColor, marginBottom: 14 },
  histRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  histRowSep: { paddingBottom: 14, marginBottom: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  histAv: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.primXlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  histAvTxt: { fontSize: 16 },
  histAction: { fontSize: 13, fontWeight: '500', color: C.ink },
  histDate: { fontSize: 11, color: grey, marginTop: 2 },
  histPts: { fontSize: 14, fontWeight: '700', color: C.olive },
});
