import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { copyToClipboard } from '../copyToClipboard';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen } from '../types';

const grey = C.muted;
const CODE = 'AHZ-MERCY-2026';
const FRIENDS = [
  { name: 'Tunde A.', pts: 500, date: '2 days ago' },
  { name: 'Chioma B.', pts: 500, date: 'Last week' },
];

const WA_MSG =
  'Join Ahzarman and earn points on every bill payment! Sign up with my referral link: https://ahzarman.app/ref/MERCY2025';

export function ReferScreen({ goTo }: { goTo: (s: AppScreen) => void }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    const ok = copyToClipboard(CODE);
    setCopied(ok);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(WA_MSG)}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.page}>
      <ScreenHeader title="Refer & Earn" onBack={() => goTo('home')} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroBig}>₦2,500 pts</Text>
          <Text style={styles.heroSub}>per friend who joins and makes a purchase</Text>
          <View style={styles.codeRow}>
            <Text style={styles.codeTxt}>{CODE}</Text>
            <Pressable onPress={copy} style={[styles.copyBtn, copied && { backgroundColor: C.success }]}>
              <Text style={styles.copyTxt}>{copied ? 'Copied!' : 'Copy'}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>How it works</Text>
          {['Share your code with friends', 'Friend signs up and makes first purchase', 'You both earn 2,500 pts instantly'].map(
            (s, i) => (
              <View key={s} style={[styles.stepRow, i < 2 && styles.stepRowSep]}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumTxt}>{i + 1}</Text>
                </View>
                <Text style={styles.stepTxt}>{s}</Text>
              </View>
            ),
          )}
        </View>

        {FRIENDS.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Friends Referred ({FRIENDS.length})</Text>
            {FRIENDS.map((f, i) => (
              <View key={f.name} style={[styles.friendRow, i < FRIENDS.length - 1 && styles.friendBorder]}>
                <View style={styles.friendLeft}>
                  <View style={styles.friendAv}>
                    <Text style={styles.friendAvTxt}>{f.name[0]}</Text>
                  </View>
                  <View>
                    <Text style={styles.friendName}>{f.name}</Text>
                    <Text style={styles.friendDate}>{f.date}</Text>
                  </View>
                </View>
                <Text style={styles.friendPts}>+{f.pts} pts</Text>
              </View>
            ))}
          </View>
        ) : null}

        <Pressable onPress={shareWhatsApp} style={styles.waBtn}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="#fff">
            <Path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <Path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.99.577 3.842 1.574 5.405L2 22l4.724-1.558A9.953 9.953 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 11.999 2zm.001 18.167a8.154 8.154 0 0 1-4.16-1.138l-.299-.177-3.09 1.019 1.038-3.01-.196-.31A8.167 8.167 0 1 1 12 20.167z" />
          </Svg>
          <Text style={styles.waTxt}>Share via WhatsApp</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32, gap: 16 },
  hero: {
    backgroundColor: C.ink,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroBig: { fontSize: 32, fontWeight: '700', color: C.primary, letterSpacing: -0.3, marginBottom: 4 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,.6)', marginBottom: 20, textAlign: 'center' },
  codeRow: {
    width: '100%',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,.08)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeTxt: { fontSize: 16, fontWeight: '600', color: C.white, letterSpacing: 0.5, flex: 1 },
  copyBtn: { backgroundColor: C.primary, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 16 },
  copyTxt: { fontSize: 13, fontWeight: '700', color: C.ink },
  card: {
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardTitle: { fontSize: 14, fontWeight: '600', color: C.ink, marginBottom: 14 },
  stepRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepRowSep: { marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumTxt: { fontSize: 12, fontWeight: '700', color: C.ink },
  stepTxt: { flex: 1, fontSize: 14, color: C.body, lineHeight: 21, paddingTop: 2 },
  friendRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  friendBorder: { borderBottomWidth: 1, borderBottomColor: C.border, marginBottom: 12, paddingBottom: 12 },
  friendLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  friendAv: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.primXlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendAvTxt: { fontSize: 16, fontWeight: '700', color: C.olive },
  friendName: { fontSize: 13, fontWeight: '500', color: C.ink },
  friendDate: { fontSize: 11, color: grey, marginTop: 2 },
  friendPts: { fontSize: 14, fontWeight: '700', color: C.olive },
  waBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  waTxt: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
