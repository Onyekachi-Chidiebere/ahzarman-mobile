import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { C } from '../constants';
import type { AppScreen } from '../types';

const grey = C.muted;

export function SuccessSimpleScreen({
  goTo,
  pts = 30,
  userPoints = 0,
}: {
  goTo: (s: AppScreen) => void;
  pts?: number;
  userPoints?: number;
}) {
  const [count, setCount] = useState(4);
  const goToRef = useRef(goTo);
  goToRef.current = goTo;

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          clearInterval(id);
          goToRef.current('home');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.page}>
      <View style={styles.iconWrap}>
        <View style={styles.iconRing} />
        <View style={styles.iconInner}>
          <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
            <Path
              d="M5 12l5 5L20 7"
              stroke={C.ink}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      </View>
      <Text style={styles.title}>Payment Successful!</Text>
      <Text style={styles.sub}>Your transaction was processed instantly.</Text>
      <View style={styles.ptsCard}>
        <Text style={styles.ptsBig}>+{pts} pts</Text>
        <Text style={styles.ptsLabel}>Points earned</Text>
        <Text style={styles.ptsBalance}>New balance: {userPoints.toLocaleString()} pts</Text>
      </View>
      <Pressable onPress={() => goTo('home')} style={styles.btn}>
        <Text style={styles.btnTxt}>Back to Home</Text>
      </Pressable>
      <Text style={styles.countdown}>Returning in {count}s…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: C.white,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  iconWrap: { width: 88, height: 88, alignItems: 'center', justifyContent: 'center' },
  iconRing: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: C.primXlt,
  },
  iconInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '700', color: C.ink, textAlign: 'center' },
  sub: { fontSize: 14, color: grey, textAlign: 'center' },
  ptsCard: {
    backgroundColor: C.primFaint,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: C.primXlt,
    alignItems: 'center',
  },
  ptsBig: { fontSize: 28, fontWeight: '700', color: C.olive },
  ptsLabel: { fontSize: 12, color: C.olive, marginTop: 4 },
  ptsBalance: { fontSize: 13, fontWeight: '600', color: C.ink, marginTop: 10 },
  btn: {
    width: '100%',
    height: 50,
    backgroundColor: C.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  btnTxt: { fontSize: 16, fontWeight: '700', color: C.ink },
  countdown: { fontSize: 12, color: C.placeholder },
});
