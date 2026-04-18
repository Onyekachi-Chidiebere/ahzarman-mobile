import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { getOnboardingSlides } from '../api/auth';
import { C } from '../constants';
import type { AppScreen } from '../types';

function OnboardingArt({ idx }: { idx: number }) {
  if (idx === 1) {
    return (
      <Svg width={220} height={200} viewBox="0 0 220 200">
        <Circle cx={110} cy={100} r={90} fill={C.primXlt} />
        <Rect x={74} y={38} width={72} height={128} rx={12} fill="#fff" stroke="#D9EF82" strokeWidth={2} />
        <Rect x={88} y={54} width={44} height={8} rx={4} fill="#EDF1CE" />
        <Path d="M110 72v60M90 100h40" stroke="#A3B708" strokeWidth={4} strokeLinecap="round" />
      </Svg>
    );
  }
  return (
    <Svg width={220} height={200} viewBox="0 0 220 200">
      <Circle cx={110} cy={100} r={90} fill={C.primXlt} />
      <Rect x={70} y={40} width={80} height={130} rx={12} fill="#fff" stroke="#D9EF82" strokeWidth={2} />
      <Rect x={80} y={55} width={60} height={8} rx={4} fill="#EDF1CE" />
      <Circle cx={110} cy={155} r={6} fill="#EDF1CE" />
    </Svg>
  );
}

const DEFAULT_SLIDES = [
  { title: 'Airtime & Data', sub: 'Buy airtime and data for any network instantly.' },
  { title: 'Pay for Electricity', sub: 'Your prepaid electricity token delivered quickly.' },
  { title: 'Earn Points', sub: 'Every purchase earns points you can share or redeem.' },
  { title: 'Gift Cards & More', sub: 'Flights, betting, gift cards, cable TV — all in one app.' },
];

export function OnboardingScreen({ goTo }: { goTo: (s: AppScreen) => void }) {
  const [idx, setIdx] = useState(0);
  const [slides, setSlides] = useState(DEFAULT_SLIDES);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const remote = await getOnboardingSlides();
        if (!cancelled && remote.length > 0) {
          setSlides(remote.map(r => ({ title: r.title, sub: r.sub })));
        }
      } catch {
        /* keep defaults if server unreachable */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const artIdx = useMemo(() => (slides[idx]?.title?.length ?? 0) % 2, [slides, idx]);
  const s = slides[idx];

  return (
    <View style={styles.page}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <OnboardingArt idx={artIdx} />
        </View>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <Pressable key={`dot-${i}`} onPress={() => setIdx(i)} style={i === idx ? styles.dotActive : styles.dot} />
          ))}
        </View>
        <Text style={styles.title}>{s.title}</Text>
        <Text style={styles.body}>{s.sub}</Text>
        <View style={styles.actions}>
          <Pressable onPress={() => (idx === 3 ? goTo('sign_up') : setIdx(idx + 1))} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnTxt}>{idx === 3 ? 'Create Account →' : 'Next'}</Text>
          </Pressable>
          {idx === 3 ? (
            <Pressable onPress={() => goTo('sign_in')} style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnTxt}>I already have an account →</Text>
            </Pressable>
          ) : (
            <Pressable onPress={() => goTo('sign_up')} style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnTxt}>Skip</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 30 },
  hero: { height: 280, alignItems: 'center', justifyContent: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 7, marginBottom: 16 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#C8D080' },
  dotActive: { width: 20, height: 6, borderRadius: 3, backgroundColor: C.primary },
  title: { textAlign: 'center', color: C.textColor, fontSize: 22, fontWeight: '700', marginBottom: 8 },
  body: { textAlign: 'center', color: C.muted, fontSize: 15, lineHeight: 24, marginBottom: 22 },
  actions: { gap: 10 },
  primaryBtn: { marginTop: 10, height: 50, borderRadius: 12, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  primaryBtnTxt: { color: C.ink, fontSize: 15, fontWeight: '800' },
  secondaryBtn: { marginTop: 10, height: 50, borderRadius: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  secondaryBtnTxt: { color: C.ink, fontSize: 14, fontWeight: '700' },
});

