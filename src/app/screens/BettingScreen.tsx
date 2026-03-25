import { useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { PaymentPinModal, ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen, Tx } from '../types';

const grey = C.muted;

const MATCHES = [
  { home: 'Arsenal', away: 'Chelsea', league: 'Premier League', time: '20:00', odds: { h: '2.10', d: '3.40', a: '3.20' }, live: true, score: '1 - 0' },
  { home: 'Man City', away: 'Liverpool', league: 'Premier League', time: '21:00', odds: { h: '1.85', d: '3.60', a: '4.10' }, live: false, score: null as string | null },
  { home: 'Barcelona', away: 'Real Madrid', league: 'La Liga', time: '21:45', odds: { h: '2.40', d: '3.30', a: '2.80' }, live: false, score: null },
];

const SITES = [
  { name: 'Bet9ja', col: '#00A550', logo: 'B9', minFund: 100 },
  { name: 'Sportybet', col: '#F7941D', logo: 'SP', minFund: 100 },
  { name: '1xBet', col: '#1C5FA8', logo: '1X', minFund: 500 },
  { name: 'BetKing', col: '#8B0000', logo: 'BK', minFund: 200 },
];

export function BettingScreen({
  goTo,
  onAddTx,
  onPurchaseComplete,
}: {
  goTo: (s: AppScreen) => void;
  onAddTx: (tx: Tx) => void;
  onPurchaseComplete: (pts: number) => void;
}) {
  const [selSite, setSelSite] = useState<(typeof SITES)[number] | null>(null);
  const [betId, setBetId] = useState('');
  const [amount, setAmount] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [activeCard, setActiveCard] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement } = e.nativeEvent;
    const w = layoutMeasurement.width * 0.85 + 12;
    setActiveCard(Math.round(contentOffset.x / w));
  };

  const handleSuccess = () => {
    if (!selSite) return;
    onAddTx({
      id: String(Date.now()),
      type: 'betting',
      title: `${selSite.name} Wallet`,
      amount: `-₦${parseInt(amount || '0', 10).toLocaleString()}`,
      pts: '+100 pts',
      date: 'Just now',
      status: 'Successful',
    });
    setShowPin(false);
    setSelSite(null);
    setAmount('');
    setBetId('');
    onPurchaseComplete(100);
  };

  const amt = parseInt(amount || '0', 10);
  const canFund = !!selSite && betId.trim().length > 0 && amt >= (selSite?.minFund ?? 0);

  return (
    <View style={styles.page}>
      <ScreenHeader title="Betting" onBack={() => goTo('services')} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.rowHead}>
          <Text style={styles.sectionTitle}>Featured Matches</Text>
          <Text style={styles.seeAll}>See all →</Text>
        </View>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.hscroll}
        >
          {MATCHES.map(m => (
            <View key={m.home + m.away} style={styles.matchCard}>
              <View style={styles.matchGlow} />
              <View style={styles.matchTop}>
                <Text style={styles.league}>{m.league}</Text>
                <View style={styles.liveRow}>
                  {m.live ? <View style={styles.liveDot} /> : null}
                  <Text style={[styles.liveTxt, m.live && { color: '#E74C3C' }]}>{m.live ? 'LIVE' : m.time}</Text>
                </View>
              </View>
              <View style={styles.teams}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.teamName}>{m.home}</Text>
                  <Text style={styles.teamLbl}>Home</Text>
                </View>
                <View style={styles.vsBox}>
                  <Text style={styles.vsTxt}>{m.live ? m.score : 'VS'}</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={styles.teamName}>{m.away}</Text>
                  <Text style={styles.teamLbl}>Away</Text>
                </View>
              </View>
              <View style={styles.oddsRow}>
                {[
                  { k: '1', v: m.odds.h },
                  { k: 'X', v: m.odds.d },
                  { k: '2', v: m.odds.a },
                ].map(o => (
                  <View key={o.k} style={styles.oddCell}>
                    <Text style={styles.oddK}>{o.k}</Text>
                    <Text style={styles.oddV}>{o.v}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={styles.dots}>
          {MATCHES.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeCard ? styles.dotOn : null]} />
          ))}
        </View>

        <Text style={[styles.fundTitle, { marginTop: 16 }]}>Fund Betting Wallet</Text>
        {SITES.map(s => (
          <Pressable
            key={s.name}
            onPress={() => {
              setSelSite(s);
              setAmount('');
              setBetId('');
            }}
            style={[
              styles.siteRow,
              selSite?.name === s.name ? { borderColor: C.primary, backgroundColor: C.primFaint } : null,
            ]}
          >
            <View style={[styles.siteLogo, { backgroundColor: s.col }]}>
              <Text style={styles.siteLogoTxt}>{s.logo}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.siteName}>{s.name}</Text>
              <Text style={styles.siteSub}>
                Min ₦{s.minFund.toLocaleString()} · Instant · earn pts
              </Text>
            </View>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M9 18l6-6-6-6" stroke={selSite?.name === s.name ? C.primary : grey} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
        ))}

        {selSite ? (
          <View style={styles.fundForm}>
            <Text style={styles.fundFormTitle}>Fund {selSite.name} Wallet</Text>
            <Text style={styles.fieldLbl}>{selSite.name} User ID / Username</Text>
            <TextInput
              style={styles.input}
              placeholder={`Enter your ${selSite.name} account ID`}
              placeholderTextColor={C.placeholder}
              value={betId}
              onChangeText={setBetId}
            />
            <Text style={styles.fieldLbl}>Amount</Text>
            <View style={styles.amtRow}>
              <Text style={styles.naira}>₦</Text>
              <TextInput
                style={styles.inputFlex}
                keyboardType="number-pad"
                value={amount}
                onChangeText={v => setAmount(v.replace(/\D/g, ''))}
                placeholder="0"
                placeholderTextColor={C.placeholder}
              />
            </View>
            <Text style={styles.minHint}>Min ₦{selSite.minFund.toLocaleString()}</Text>
            <Pressable
              disabled={!canFund}
              onPress={() => canFund && setShowPin(true)}
              style={[styles.payBtn, !canFund && styles.payDis]}
            >
              <Text style={styles.payTxt}>
                {canFund ? `Fund ${selSite.name} — ₦${amt.toLocaleString()}` : 'Fill in account ID & amount'}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

      <PaymentPinModal
        visible={showPin}
        amountLabel={`₦${amt.toLocaleString()}`}
        onDismiss={() => setShowPin(false)}
        onConfirm={handleSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  scroll: { flex: 1 },
  content: { paddingBottom: 32 },
  rowHead: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: C.ink },
  seeAll: { fontSize: 12, color: C.primary },
  hscroll: { paddingHorizontal: 16, gap: 12, paddingBottom: 4 },
  matchCard: {
    width: 320,
    backgroundColor: C.ink,
    borderRadius: 14,
    padding: 14,
    overflow: 'hidden',
  },
  matchGlow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${C.primary}14`,
  },
  matchTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  league: { fontSize: 10, color: 'rgba(255,255,255,.45)', letterSpacing: 0.6, textTransform: 'uppercase' },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E74C3C' },
  liveTxt: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,.5)' },
  teams: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  teamName: { fontSize: 15, fontWeight: '700', color: C.white, marginBottom: 2 },
  teamLbl: { fontSize: 12, color: 'rgba(255,255,255,.4)' },
  vsBox: { paddingHorizontal: 14, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,.08)', borderRadius: 8 },
  vsTxt: { fontSize: 16, fontWeight: '700', color: C.white, letterSpacing: 0.5 },
  oddsRow: { flexDirection: 'row', gap: 8 },
  oddCell: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,.07)',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    gap: 2,
  },
  oddK: { fontSize: 10, color: 'rgba(255,255,255,.4)' },
  oddV: { fontSize: 14, fontWeight: '700', color: C.primary },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#C8D080' },
  dotOn: { width: 20, backgroundColor: C.primary },
  fundTitle: { fontSize: 15, fontWeight: '600', color: C.ink, paddingHorizontal: 16, marginBottom: 10 },
  siteRow: {
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
    marginBottom: 10,
  },
  siteLogo: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  siteLogoTxt: { fontSize: 13, fontWeight: '700', color: C.white },
  siteName: { fontSize: 14, fontWeight: '600', color: C.ink },
  siteSub: { fontSize: 11, color: grey, marginTop: 2 },
  fundForm: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  fundFormTitle: { fontSize: 14, fontWeight: '600', color: C.ink, marginBottom: 14 },
  fieldLbl: { fontSize: 11, color: grey, marginBottom: 6 },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 12,
    fontSize: 14,
    color: C.ink,
    marginBottom: 12,
  },
  amtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 12,
  },
  naira: { fontSize: 14, fontWeight: '600', marginRight: 6 },
  inputFlex: { flex: 1, fontSize: 15, color: C.ink },
  minHint: { fontSize: 11, color: grey, marginTop: 4, marginBottom: 8 },
  payBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  payDis: { opacity: 0.45 },
  payTxt: { fontSize: 15, fontWeight: '700', color: C.ink },
});
