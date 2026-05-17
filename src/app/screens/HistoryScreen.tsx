import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '../components';
import { txMeta } from '../data';
import { C } from '../constants';
import type { AppScreen, Tx } from '../types';

const FILTERS: Array<'All' | 'Successful' | 'Pending' | 'Failed'> = ['All', 'Successful', 'Pending', 'Failed'];

export function HistoryScreen({
  goTo,
  transactions,
  txLoading,
}: {
  goTo: (s: AppScreen) => void;
  transactions: Tx[];
  txLoading?: boolean;
}) {
  const [active, setActive] = useState<(typeof FILTERS)[number]>('All');

  const filtered = useMemo(() => {
    if (active === 'All') return transactions;
    return transactions.filter(tx => tx.status === active);
  }, [transactions, active]);

  return (
    <View style={styles.page}>
      <ScreenHeader title="Transaction History" onBack={() => goTo('home')} />
      <View style={styles.filterBar}>
        {FILTERS.map(f => (
          <Pressable key={f} onPress={() => setActive(f)} style={[styles.filterChip, active === f ? styles.filterChipOn : null]}>
            <Text style={[styles.filterTxt, active === f ? styles.filterTxtOn : null]}>{f}</Text>
          </Pressable>
        ))}
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {txLoading && filtered.length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={C.primary} />
            <Text style={styles.loadingTxt}>Loading transactions…</Text>
          </View>
        ) : filtered.length > 0 ? (
          <View style={styles.card}>
            {filtered.map((tx, i) => {
              const m = txMeta(tx);
              const last = i === filtered.length - 1;
              return (
                <View key={tx.id} style={[styles.row, last ? { borderBottomWidth: 0 } : null]}>
                  <View style={[styles.avatar, { backgroundColor: m.bg }]}>
                    <Text style={[styles.avatarIcon, { color: m.fg }]}>{m.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{tx.title}</Text>
                    <Text style={styles.sub}>{tx.date}</Text>
                  </View>
                  <Text style={styles.amount}>{tx.amount}</Text>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              {active === 'All' ? 'No transactions yet' : `No ${active.toLowerCase()} transactions`}
            </Text>
            <Text style={styles.emptySub}>
              {active === 'All' ? 'Make your first purchase' : 'Try a different filter'}
            </Text>
            {active !== 'All' ? (
              <Pressable onPress={() => setActive('All')} style={styles.emptyCta}>
                <Text style={styles.emptyCtaTxt}>View All</Text>
              </Pressable>
            ) : (
              <Pressable onPress={() => goTo('services')} style={styles.emptyCta}>
                <Text style={styles.emptyCtaTxt}>Browse Services</Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  filterBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: C.disabled,
  },
  filterChipOn: { backgroundColor: C.primary },
  filterTxt: { fontSize: 12, color: C.muted, fontWeight: '400' },
  filterTxtOn: { color: C.ink, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: C.white,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: C.border,
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarIcon: { fontSize: 16, fontWeight: '700' },
  title: { color: C.ink, fontSize: 13, fontWeight: '700' },
  sub: { color: C.muted, fontSize: 11, marginTop: 2 },
  amount: { color: C.ink, fontSize: 13, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: C.ink, textAlign: 'center' },
  emptySub: { fontSize: 13, color: C.muted, marginTop: 8, textAlign: 'center' },
  emptyCta: {
    marginTop: 16,
    height: 44,
    paddingHorizontal: 20,
    backgroundColor: C.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCtaTxt: { fontSize: 14, fontWeight: '700', color: C.ink },
  loadingBox: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  loadingTxt: { fontSize: 14, color: C.muted },
});
