import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import { ESTATES } from '../data/estates';
import type { Estate } from '../types';

const BASE_POOL = 24810;
const grey = C.muted;

type Tab = 'overview' | 'activity' | 'vote';

const ACTIVITY = [
  { name: 'Mercy O.', pts: '+185', date: 'Today', you: true },
  { name: 'Tunde A.', pts: '+620', date: 'Today', you: false },
  { name: 'Ngozi F.', pts: '+340', date: 'Yesterday', you: false },
  { name: 'Emeka K.', pts: '+200', date: 'Yesterday', you: false },
];

const VOTES: Array<{
  id: number;
  title: string;
  yes: number;
  no: number;
  total: number;
  deadline: string;
  status: 'active' | 'closed';
}> = [
  {
    id: 1,
    title: 'Install CCTV at main gate',
    yes: 68,
    no: 12,
    total: 80,
    deadline: '3 days left',
    status: 'active',
  },
  {
    id: 2,
    title: 'Buy backup generator for block C',
    yes: 42,
    no: 28,
    total: 70,
    deadline: '1 week left',
    status: 'active',
  },
  {
    id: 3,
    title: 'Repaint perimeter fence',
    yes: 91,
    no: 9,
    total: 100,
    deadline: 'Closed',
    status: 'closed',
  },
];

export function EstateAccountScreen({
  goBack,
  userEstate,
  estatePoints,
  onSetEstate,
}: {
  goBack: () => void;
  userEstate: Estate | null;
  estatePoints: number;
  onSetEstate: (e: Estate | null) => void;
}) {
  const [tab, setTab] = useState<Tab>('overview');
  const [joinCode, setJoinCode] = useState('');
  const [joinMatch, setJoinMatch] = useState<Estate | null>(null);
  const [joinErr, setJoinErr] = useState('');
  const [joining, setJoining] = useState(false);

  const handleJoinCode = (v: string) => {
    const up = v.toUpperCase();
    setJoinCode(up);
    setJoinErr('');
    setJoinMatch(ESTATES.find(e => e.code === up.trim()) ?? null);
  };

  const handleJoin = () => {
    if (!joinMatch) {
      setJoinErr('Estate code not found. Check the code and try again.');
      return;
    }
    setJoining(true);
    setTimeout(() => {
      setJoining(false);
      onSetEstate(joinMatch);
    }, 1600);
  };

  if (!userEstate) {
    return (
      <View style={styles.page}>
        <ScreenHeader title="Join an Estate" onBack={goBack} />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.joinContent}>
          <View style={styles.heroJoin}>
            <Text style={styles.heroJoinTitle}>
              Your estate.{'\n'}Your community.
            </Text>
            <Text style={styles.heroJoinSub}>
              Link your home and 10% of every points earn you make automatically goes to your community pool —
              funding shared electricity, security upgrades, and estate maintenance voted on by residents.
            </Text>
            <View style={styles.heroPills}>
              {[
                { icon: '⚡', label: 'Shared electricity' },
                { icon: '🔒', label: 'Security fund' },
                { icon: '🗳️', label: 'Community vote' },
              ].map(b => (
                <View key={b.label} style={styles.heroPill}>
                  <Text style={styles.heroPillIcon}>{b.icon}</Text>
                  <Text style={styles.heroPillTxt}>{b.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>How the Community Pool works</Text>
            {[
              { n: '10%', label: 'of every points earn goes to the pool automatically' },
              { n: 'Vote', label: 'residents vote on how pool points are spent' },
              { n: 'All', label: 'households benefit from the improvements' },
            ].map((s, i) => (
              <View key={s.n} style={[styles.howRow, i < 2 && styles.howRowSep]}>
                <View style={styles.howBadge}>
                  <Text style={styles.howBadgeTxt}>{s.n}</Text>
                </View>
                <Text style={styles.howTxt}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View>
            <Text style={styles.fieldLabel}>Enter your estate code</Text>
            <TextInput
              value={joinCode}
              onChangeText={handleJoinCode}
              placeholder="Estate Code (e.g. SUN-2847)"
              placeholderTextColor={C.placeholder}
              autoCapitalize="characters"
              style={[
                styles.input,
                joinErr ? styles.inputErr : joinMatch ? styles.inputOk : null,
              ]}
            />
            {joinErr ? <Text style={styles.errTxt}>{joinErr}</Text> : null}
          </View>

          {joinMatch ? (
            <View style={[styles.matchOuter, { borderColor: joinMatch.color }]}>
              <View style={[styles.matchTop, { backgroundColor: joinMatch.color }]}>
                <Text style={styles.matchEmoji}>{joinMatch.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.matchName}>{joinMatch.name}</Text>
                  <Text style={styles.matchCity}>{joinMatch.city}</Text>
                </View>
                <View style={styles.resBadge}>
                  <Text style={styles.resBadgeTxt}>{joinMatch.members} residents</Text>
                </View>
              </View>
              <View style={[styles.matchBot, { backgroundColor: joinMatch.colorLight }]}>
                <Text style={styles.matchDesc}>{joinMatch.description}</Text>
                <Text style={[styles.matchHint, { color: joinMatch.color }]}>
                  10% of your points will go to this estate's pool
                </Text>
              </View>
            </View>
          ) : null}

          {!joinMatch && !joinCode ? (
            <View style={styles.demoBox}>
              <Text style={styles.demoTitle}>Demo estates — tap to autofill</Text>
              {ESTATES.map((e, i) => (
                <Pressable
                  key={e.id}
                  onPress={() => handleJoinCode(e.code)}
                  style={[styles.demoRow, i < ESTATES.length - 1 && styles.demoRowSep]}
                >
                  <Text style={styles.demoEmoji}>{e.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.demoName}>{e.name}</Text>
                    <Text style={styles.demoSub}>
                      {e.city} · {e.members} residents
                    </Text>
                  </View>
                  <View style={styles.codeChip}>
                    <Text style={styles.codeChipTxt}>{e.code}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : null}

          <Pressable
            onPress={handleJoin}
            disabled={!joinMatch || joining}
            style={[styles.primaryBtn, (!joinMatch || joining) && styles.primaryBtnDis]}
          >
            {joining ? (
              <ActivityIndicator color={C.disabledTxt} />
            ) : (
              <Text style={[styles.primaryBtnTxt, (!joinMatch || joining) && styles.primaryBtnTxtDis]}>
                {joinMatch ? `Join ${joinMatch.name} →` : 'Enter code to continue'}
              </Text>
            )}
          </Pressable>

          <Pressable onPress={goBack} style={styles.textLinkWrap}>
            <Text style={styles.textLink}>← Back</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  const e = userEstate;
  const myContrib = estatePoints || 0;
  const poolTotal = BASE_POOL + myContrib;
  const perMember = Math.round(poolTotal / e.members);
  const goalPct = Math.min((poolTotal / 50000) * 100, 100);

  return (
    <View style={styles.page}>
      <ScreenHeader title="Estate Account" onBack={goBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.accountContent}>
        <View style={[styles.accountHero, { backgroundColor: e.color }]}>
          <View style={styles.accountHeroTop}>
            <View style={styles.accountEmojiWrap}>
              <Text style={styles.accountEmoji}>{e.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.accountTitle}>{e.name}</Text>
              <Text style={styles.accountSub}>
                {e.city} · {e.members} residents
              </Text>
            </View>
            <View style={styles.codePill}>
              <Text style={styles.codePillTxt}>{e.code}</Text>
            </View>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Community Pool</Text>
              <Text style={styles.statVal}>
                {poolTotal.toLocaleString()} <Text style={styles.statPts}>pts</Text>
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Your Share</Text>
              <Text style={styles.statVal}>
                {myContrib} <Text style={styles.statPts}>pts</Text>
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Per Resident</Text>
              <Text style={styles.statVal}>
                {perMember} <Text style={styles.statPts}>pts</Text>
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.infoStrip, { backgroundColor: e.colorLight, borderColor: `${e.color}28` }]}>
          <Text style={[styles.infoStripTxt, { color: e.color }]}>
            10% of every points earn you make is auto-contributed to this estate's community pool.
          </Text>
        </View>

        <View style={styles.tabBar}>
          {(
            [
              ['overview', 'Overview'],
              ['activity', 'Activity'],
              ['vote', 'Vote'],
            ] as const
          ).map(([k, l]) => (
            <Pressable
              key={k}
              onPress={() => setTab(k)}
              style={[styles.tabBtn, tab === k && styles.tabBtnOn]}
            >
              <Text style={[styles.tabBtnTxt, tab === k && styles.tabBtnTxtOn]}>{l}</Text>
            </Pressable>
          ))}
        </View>

        {tab === 'overview' ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>About {e.name}</Text>
            <Text style={styles.aboutBody}>{e.description}</Text>
            <View style={styles.divider} />
            <View style={styles.goalBarBg}>
              <View style={[styles.goalBarFill, { width: `${goalPct}%`, backgroundColor: e.color }]} />
            </View>
            <View style={styles.goalRow}>
              <Text style={[styles.goalRaised, { color: e.color }]}>{poolTotal.toLocaleString()} pts raised</Text>
              <Text style={styles.goalTarget}>Goal: 50,000 pts</Text>
            </View>
          </View>
        ) : null}

        {tab === 'activity' ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Recent Contributions</Text>
            {ACTIVITY.map((a, i) => (
              <View
                key={a.name}
                style={[styles.actRow, i < ACTIVITY.length - 1 && styles.actRowSep]}
              >
                <View
                  style={[
                    styles.actAv,
                    { backgroundColor: a.you ? e.color : C.primXlt },
                  ]}
                >
                  <Text style={[styles.actAvTxt, { color: a.you ? C.white : C.olive }]}>{a.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actName}>{a.you ? 'You (Mercy O.)' : a.name}</Text>
                  <Text style={styles.actDate}>{a.date}</Text>
                </View>
                <Text style={[styles.actPts, { color: e.color }]}>{a.pts} pts</Text>
              </View>
            ))}
          </View>
        ) : null}

        {tab === 'vote'
          ? VOTES.map(v => {
              const yPct = Math.round((v.yes / v.total) * 100);
              return (
                <View key={v.id} style={[styles.card, styles.voteCardWrap]}>
                  <View style={styles.voteHead}>
                    <Text style={styles.voteTitle}>{v.title}</Text>
                    <View
                      style={[
                        styles.voteStatus,
                        v.status === 'active' ? { backgroundColor: C.primXlt } : { backgroundColor: C.disabled },
                      ]}
                    >
                      <Text
                        style={[
                          styles.voteStatusTxt,
                          v.status === 'active' ? { color: C.olive } : { color: grey },
                        ]}
                      >
                        {v.status === 'active' ? 'LIVE' : 'CLOSED'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.voteBarBg}>
                    <View style={[styles.voteBarFill, { width: `${yPct}%`, backgroundColor: e.color }]} />
                  </View>
                  <View style={styles.voteMeta}>
                    <Text style={[styles.votePct, { color: e.color }]}>{yPct}% in favour</Text>
                    <Text style={styles.voteDeadline}>{v.deadline}</Text>
                  </View>
                  {v.status === 'active' ? (
                    <View style={styles.voteActions}>
                      <Pressable style={[styles.voteYes, { backgroundColor: e.color }]}>
                        <Text style={styles.voteYesTxt}>Vote Yes</Text>
                      </Pressable>
                      <Pressable style={styles.voteNo}>
                        <Text style={styles.voteNoTxt}>Vote No</Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              );
            })
          : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  scroll: { flex: 1 },
  joinContent: { paddingHorizontal: 16, paddingBottom: 32, gap: 16 },
  accountContent: { paddingBottom: 32, gap: 12 },

  heroJoin: {
    backgroundColor: C.ink,
    borderRadius: 16,
    padding: 22,
    overflow: 'hidden',
  },
  heroJoinTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: C.primary,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  heroJoinSub: { fontSize: 13, color: 'rgba(255,255,255,.55)', lineHeight: 20, marginBottom: 16 },
  heroPills: { flexDirection: 'row', gap: 10 },
  heroPill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,.07)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  heroPillIcon: { fontSize: 18, marginBottom: 4 },
  heroPillTxt: { fontSize: 10, color: 'rgba(255,255,255,.55)', textAlign: 'center', lineHeight: 14 },

  card: {
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginHorizontal: 16,
  },
  cardTitle: { fontSize: 14, fontWeight: '600', color: C.ink, marginBottom: 12 },
  howRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  howRowSep: { marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  howBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.primXlt,
    borderWidth: 1,
    borderColor: `${C.primary}44`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  howBadgeTxt: { fontSize: 11, fontWeight: '700', color: C.olive },
  howTxt: { flex: 1, fontSize: 13, color: C.body, lineHeight: 20, paddingTop: 2 },

  fieldLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: grey,
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 14,
    fontSize: 15,
    color: C.ink,
    backgroundColor: C.white,
  },
  inputErr: { borderColor: C.errorBorder, backgroundColor: C.errorBg },
  inputOk: { borderColor: '#C8D080', backgroundColor: C.successBg },
  errTxt: { fontSize: 11, color: C.error, marginTop: 6, marginLeft: 4 },

  matchOuter: { borderRadius: 14, borderWidth: 1.5, overflow: 'hidden' },
  matchTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  matchEmoji: { fontSize: 24 },
  matchName: { fontSize: 15, fontWeight: '700', color: C.white },
  matchCity: { fontSize: 12, color: 'rgba(255,255,255,.75)', marginTop: 2 },
  resBadge: {
    backgroundColor: 'rgba(255,255,255,.2)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  resBadgeTxt: { fontSize: 11, fontWeight: '700', color: C.white },
  matchBot: { padding: 14 },
  matchDesc: { fontSize: 12, color: C.body, lineHeight: 19, marginBottom: 8 },
  matchHint: { fontSize: 11, fontWeight: '600' },

  demoBox: {
    backgroundColor: C.primFaint,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: C.primXlt,
  },
  demoTitle: { fontSize: 12, fontWeight: '600', color: C.olive, marginBottom: 8 },
  demoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  demoRowSep: { borderBottomWidth: 1, borderBottomColor: C.primXlt },
  demoEmoji: { fontSize: 20 },
  demoName: { fontSize: 13, fontWeight: '500', color: C.ink },
  demoSub: { fontSize: 11, color: grey, marginTop: 2 },
  codeChip: { backgroundColor: C.primXlt, borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8 },
  codeChipTxt: { fontSize: 10, fontWeight: '700', color: C.olive },

  primaryBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDis: { backgroundColor: C.disabled },
  primaryBtnTxt: { fontSize: 16, fontWeight: '700', color: C.ink },
  primaryBtnTxtDis: { color: C.disabledTxt },
  textLinkWrap: { alignItems: 'center', paddingVertical: 8 },
  textLink: { fontSize: 13, fontWeight: '500', color: grey },

  accountHero: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24, marginHorizontal: 0 },
  accountHeroTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  accountEmojiWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountEmoji: { fontSize: 24 },
  accountTitle: { fontSize: 16, fontWeight: '700', color: C.white },
  accountSub: { fontSize: 12, color: 'rgba(255,255,255,.75)', marginTop: 2 },
  codePill: {
    backgroundColor: 'rgba(255,255,255,.18)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  codePillTxt: { fontSize: 11, fontWeight: '700', color: C.white, textAlign: 'center' },
  statRow: { flexDirection: 'row', gap: 10 },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,.18)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  statLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  statVal: { fontSize: 18, fontWeight: '700', color: C.white },
  statPts: { fontSize: 11, fontWeight: '400', opacity: 0.65 },

  infoStrip: {
    marginHorizontal: 16,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  infoStripTxt: { fontSize: 12, fontWeight: '500', lineHeight: 18 },

  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: C.disabled,
    borderRadius: 10,
    padding: 3,
    gap: 3,
  },
  tabBtn: { flex: 1, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  tabBtnOn: { backgroundColor: C.white },
  tabBtnTxt: { fontSize: 12, fontWeight: '400', color: grey },
  tabBtnTxtOn: { fontWeight: '700', color: C.ink },

  aboutBody: { fontSize: 13, color: C.body, lineHeight: 22 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 12 },
  goalBarBg: {
    height: 10,
    backgroundColor: C.disabled,
    borderRadius: 5,
    marginBottom: 6,
    overflow: 'hidden',
  },
  goalBarFill: { height: '100%', borderRadius: 5 },
  goalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  goalRaised: { fontSize: 12, fontWeight: '600' },
  goalTarget: { fontSize: 11, color: grey },

  actRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actRowSep: {
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  actAv: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actAvTxt: { fontSize: 15, fontWeight: '700' },
  actName: { fontSize: 13, fontWeight: '500', color: C.ink },
  actDate: { fontSize: 11, color: grey, marginTop: 2 },
  actPts: { fontSize: 14, fontWeight: '700' },

  voteHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  voteTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: C.ink },
  voteStatus: { borderRadius: 5, paddingVertical: 3, paddingHorizontal: 8 },
  voteStatusTxt: { fontSize: 10, fontWeight: '600' },
  voteBarBg: {
    height: 8,
    backgroundColor: C.disabled,
    borderRadius: 4,
    marginBottom: 6,
    overflow: 'hidden',
  },
  voteBarFill: { height: '100%', borderRadius: 4 },
  voteMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  votePct: { fontSize: 12, fontWeight: '700' },
  voteDeadline: { fontSize: 11, color: grey },
  voteActions: { flexDirection: 'row', gap: 8 },
  voteYes: { flex: 1, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  voteYesTxt: { fontSize: 12, fontWeight: '700', color: C.white },
  voteCardWrap: { marginBottom: 12 },
  voteNo: {
    flex: 1,
    height: 34,
    borderRadius: 8,
    backgroundColor: C.disabled,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voteNoTxt: { fontSize: 12, fontWeight: '600', color: grey },
});
