import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { PaymentPinModal, ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen, Tx } from '../types';

const grey = C.muted;

const PLANS = [
  { region: '🌍 Africa', data: '1GB', validity: '7 days', price: 3500, pts: 175 },
  { region: '🌍 Africa', data: '3GB', validity: '30 days', price: 8500, pts: 425, tag: 'Popular' as const },
  { region: '🌎 Americas', data: '1GB', validity: '7 days', price: 5000, pts: 250 },
  { region: '🌎 Americas', data: '5GB', validity: '30 days', price: 18000, pts: 900 },
  { region: '🌏 Europe', data: '1GB', validity: '7 days', price: 5500, pts: 275 },
  { region: '🌏 Europe', data: '5GB', validity: '30 days', price: 20000, pts: 1000, tag: 'Best value' as const },
  { region: '🌏 Asia', data: '2GB', validity: '14 days', price: 9000, pts: 450 },
  { region: '🌏 Asia', data: '10GB', validity: '30 days', price: 30000, pts: 1500 },
];

type Plan = (typeof PLANS)[number];

export function ESIMScreen({
  goTo,
  onAddTx,
  onPurchaseComplete,
}: {
  goTo: (s: AppScreen) => void;
  onAddTx: (tx: Tx) => void;
  onPurchaseComplete: (pts: number) => void;
}) {
  const [sel, setSel] = useState<Plan | null>(null);
  const [showPin, setShowPin] = useState(false);

  const handleSuccess = () => {
    if (!sel) return;
    onAddTx({
      id: String(Date.now()),
      type: 'esim',
      title: `eSIM — ${sel.region} ${sel.data}`,
      amount: `-₦${sel.price.toLocaleString()}`,
      pts: `+${sel.pts} pts`,
      date: 'Just now',
      status: 'Successful',
    });
    setShowPin(false);
    onPurchaseComplete(sel.pts);
  };

  return (
    <View style={styles.page}>
      <ScreenHeader title="eSIM" onBack={() => goTo('services')} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
            <Path
              d="M6 2h9l4 4v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"
              stroke={C.primary}
              strokeWidth={1.8}
              strokeLinejoin="round"
            />
          </Svg>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>International eSIMs</Text>
            <Text style={styles.heroSub}>No physical SIM needed · Activate instantly</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>SELECT A PLAN</Text>
        {PLANS.map((p, i) => {
          const active = sel === p;
          return (
            <Pressable
              key={i}
              onPress={() => setSel(p)}
              style={[styles.planRow, active ? { borderColor: C.primary, backgroundColor: C.primFaint } : null]}
            >
              {p.tag ? (
                <View
                  style={[
                    styles.tag,
                    p.tag === 'Best value' ? { backgroundColor: C.ink } : { backgroundColor: C.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.tagTxt,
                      p.tag === 'Best value' ? { color: C.primary } : { color: C.ink },
                    ]}
                  >
                    {p.tag.toUpperCase()}
                  </Text>
                </View>
              ) : null}
              <View style={{ flex: 1 }}>
                <Text style={styles.reg}>{p.region}</Text>
                <Text style={styles.data}>{p.data}</Text>
                <Text style={styles.val}>{p.validity}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.price}>₦{p.price.toLocaleString()}</Text>
                <View style={styles.ptsPill}>
                  <Text style={styles.ptsTxt}>+{p.pts} pts</Text>
                </View>
              </View>
            </Pressable>
          );
        })}

        <Pressable disabled={!sel} onPress={() => sel && setShowPin(true)} style={[styles.btn, !sel && styles.btnDis]}>
          <Text style={styles.btnTxt}>{sel ? `Buy eSIM — ₦${sel.price.toLocaleString()}` : 'Select a plan'}</Text>
        </Pressable>
      </ScrollView>

      <PaymentPinModal
        visible={showPin}
        amountLabel={sel ? `₦${sel.price.toLocaleString()}` : '₦0'}
        onDismiss={() => setShowPin(false)}
        onConfirm={handleSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32, gap: 10 },
  hero: {
    backgroundColor: C.ink,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  heroTitle: { fontSize: 15, fontWeight: '700', color: C.white, marginBottom: 2 },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,.5)' },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: grey,
    letterSpacing: 0.4,
    marginTop: 4,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
    position: 'relative',
    overflow: 'visible',
  },
  tag: {
    position: 'absolute',
    top: -1,
    right: 10,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  tagTxt: { fontSize: 9, fontWeight: '700', letterSpacing: 0.4 },
  reg: { fontSize: 13, fontWeight: '600', color: C.ink },
  data: { fontSize: 16, fontWeight: '700', color: C.ink, marginTop: 2 },
  val: { fontSize: 11, color: grey, marginTop: 2 },
  price: { fontSize: 16, fontWeight: '700', color: C.ink },
  ptsPill: {
    marginTop: 4,
    backgroundColor: C.primXlt,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  ptsTxt: { fontSize: 10, fontWeight: '600', color: C.olive },
  btn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  btnDis: { opacity: 0.45 },
  btnTxt: { fontSize: 16, fontWeight: '700', color: C.ink },
});
