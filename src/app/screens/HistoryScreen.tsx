import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { apiErrorMessage } from '../api/client';
import {
  formatTokenDisplay,
  getTransactionById,
  hasTokenField,
  mapServerTransactionToTx,
  tokenLabelForType,
  type ServerTransaction,
} from '../api/transactions';
import { copyToClipboard } from '../copyToClipboard';
import { ScreenHeader } from '../components';
import { txMeta } from '../data';
import { C } from '../constants';
import type { AppScreen, Tx } from '../types';

const FILTERS: Array<'All' | 'Successful' | 'Pending' | 'Failed'> = ['All', 'Successful', 'Pending', 'Failed'];
const grey = C.muted;

function pickString(obj: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

function detailRows(row: ServerTransaction): { label: string; value: string }[] {
  const td = (row.transaction_data && typeof row.transaction_data === 'object'
    ? row.transaction_data
    : {}) as Record<string, unknown>;
  const type = String(row.transaction_type || '').toLowerCase();
  const mapped = mapServerTransactionToTx(row);
  const rows: { label: string; value: string }[] = [
    { label: 'Status', value: mapped.status || '—' },
    { label: 'Amount', value: mapped.amount },
    { label: 'Date', value: mapped.date || '—' },
  ];

  if (mapped.pts) rows.push({ label: 'Points', value: mapped.pts });

  const meter = pickString(td, ['meter', 'meter_number']);
  if (meter) rows.push({ label: 'Meter', value: meter });

  const disco = pickString(td, ['disco_id', 'disco', 'meter_type']);
  if (disco) rows.push({ label: 'DisCo / Provider', value: disco });

  const phone = pickString(td, ['phone', 'msisdn']);
  if (phone) rows.push({ label: 'Phone', value: phone });

  if (type === 'points_redeem') {
    const spent = td.points_spent;
    if (spent != null) rows.push({ label: 'Points redeemed', value: `${spent} pts` });
  }

  const ref = row.provider_transaction_id;
  if (ref) rows.push({ label: 'Reference', value: String(ref) });

  if (row.status === 'failed' && row.error_message) {
    rows.push({ label: 'Error', value: String(row.error_message) });
  }

  return rows;
}

export function HistoryScreen({
  goTo,
  transactions,
  txLoading,
  authToken,
}: {
  goTo: (s: AppScreen) => void;
  transactions: Tx[];
  txLoading?: boolean;
  authToken: string | null;
}) {
  const [active, setActive] = useState<(typeof FILTERS)[number]>('All');
  const [selectedTx, setSelectedTx] = useState<Tx | null>(null);
  const [detail, setDetail] = useState<ServerTransaction | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailErr, setDetailErr] = useState<string | null>(null);
  const [tokenCopied, setTokenCopied] = useState(false);

  const filtered = useMemo(() => {
    if (active === 'All') return transactions;
    return transactions.filter(tx => tx.status === active);
  }, [transactions, active]);

  const closeDetail = useCallback(() => {
    setSelectedTx(null);
    setDetail(null);
    setDetailErr(null);
    setDetailLoading(false);
    setTokenCopied(false);
  }, []);

  const openDetail = useCallback(
    (tx: Tx) => {
      if (!authToken) {
        setDetailErr('Sign in to view transaction details.');
        setSelectedTx(tx);
        return;
      }
      setSelectedTx(tx);
      setDetail(null);
      setDetailErr(null);
      setDetailLoading(true);
      setTokenCopied(false);
      void (async () => {
        try {
          const row = await getTransactionById(tx.id, authToken);
          setDetail(row);
        } catch (e) {
          setDetailErr(apiErrorMessage(e, 'Could not load transaction'));
        } finally {
          setDetailLoading(false);
        }
      })();
    },
    [authToken],
  );

  const copyToken = () => {
    const raw = detail?.meter_token?.trim();
    if (!raw) return;
    const ok = copyToClipboard(raw.replace(/\s/g, ''));
    if (ok) {
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    }
  };

  const showToken =
    detail &&
    hasTokenField(detail.transaction_type) &&
    detail.meter_token?.trim();

  const detailFields = detail ? detailRows(detail) : [];

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
                <Pressable
                  key={tx.id}
                  onPress={() => openDetail(tx)}
                  style={({ pressed }) => [styles.row, last ? { borderBottomWidth: 0 } : null, pressed && styles.rowPressed]}
                >
                  <View style={[styles.avatar, { backgroundColor: m.bg }]}>
                    <Text style={[styles.avatarIcon, { color: m.fg }]}>{m.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{tx.title}</Text>
                    <Text style={styles.sub}>{tx.date}</Text>
                  </View>
                  <View style={styles.rowRight}>
                    <Text style={styles.amount}>{tx.amount}</Text>
                    <Text style={styles.chev}>›</Text>
                  </View>
                </Pressable>
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

      <Modal visible={!!selectedTx} transparent animationType="slide" onRequestClose={closeDetail}>
        <Pressable style={styles.modalOverlay} onPress={closeDetail}>
          <Pressable style={styles.modalSheet} onPress={e => e.stopPropagation()}>
            <View style={styles.modalGrab} />
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle} numberOfLines={2}>
                {selectedTx?.title ?? 'Transaction'}
              </Text>
              <Pressable onPress={closeDetail} hitSlop={8} style={styles.modalClose}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Path d="M18 6L6 18M6 6l12 12" stroke={grey} strokeWidth={2} strokeLinecap="round" />
                </Svg>
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
              {detailLoading ? (
                <View style={styles.modalLoading}>
                  <ActivityIndicator size="large" color={C.primary} />
                  <Text style={styles.loadingTxt}>Loading details…</Text>
                </View>
              ) : detailErr ? (
                <View style={styles.errBox}>
                  <Text style={styles.errTxt}>{detailErr}</Text>
                </View>
              ) : detail ? (
                <>
                  {showToken ? (
                    <View style={styles.tokenCard}>
                      <Text style={styles.tokenLabel}>{tokenLabelForType(detail.transaction_type)}</Text>
                      <Text style={styles.tokenValue} selectable>
                        {formatTokenDisplay(detail.meter_token)}
                      </Text>
                      <Pressable
                        onPress={copyToken}
                        style={[styles.copyBtn, tokenCopied && { backgroundColor: C.success }]}
                      >
                        <Text style={styles.copyBtnTxt}>{tokenCopied ? 'Copied!' : 'Copy token'}</Text>
                      </Pressable>
                    </View>
                  ) : detail.status === 'success' &&
                    hasTokenField(detail.transaction_type) &&
                    !detail.meter_token ? (
                    <View style={styles.pendingTokenBox}>
                      <Text style={styles.pendingTokenTxt}>
                        Token not available yet. If payment was recent, try again shortly.
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.detailCard}>
                    {detailFields.map((r, idx) => (
                      <View
                        key={r.label}
                        style={[styles.detailRow, idx < detailFields.length - 1 ? styles.detailRowBorder : null]}
                      >
                        <Text style={styles.detailLabel}>{r.label}</Text>
                        <Text style={styles.detailValue} selectable>
                          {r.value}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : null}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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
  rowPressed: { opacity: 0.7 },
  rowRight: { alignItems: 'flex-end', gap: 2 },
  chev: { color: C.muted, fontSize: 16, fontWeight: '600' },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.52)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalGrab: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    marginTop: 10,
  },
  modalHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 12,
  },
  modalTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: C.ink },
  modalClose: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.disabled,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: { flexGrow: 0 },
  modalScrollContent: { padding: 16, paddingBottom: 32 },
  modalLoading: { alignItems: 'center', paddingVertical: 32, gap: 12 },
  tokenCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  tokenLabel: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 8 },
  tokenValue: {
    color: C.white,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 12,
    lineHeight: 28,
  },
  copyBtn: {
    alignSelf: 'flex-start',
    backgroundColor: C.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  copyBtnTxt: { fontSize: 13, fontWeight: '700', color: C.ink },
  pendingTokenBox: {
    backgroundColor: C.primFaint,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.primXlt,
  },
  pendingTokenTxt: { fontSize: 13, color: C.olive, lineHeight: 20 },
  detailCard: {
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  detailRow: { paddingVertical: 12, paddingHorizontal: 14 },
  detailRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  detailLabel: { fontSize: 11, color: grey, marginBottom: 4 },
  detailValue: { fontSize: 14, fontWeight: '600', color: C.ink },
  errBox: {
    backgroundColor: C.errorBg,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: C.errorBorder,
  },
  errTxt: { fontSize: 13, color: C.error, textAlign: 'center' },
});
