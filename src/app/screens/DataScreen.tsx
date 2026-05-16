import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { AuthUser } from '../api/auth';
import { ApiError } from '../api/client';
import { completeDataPurchase, initializeDataPurchase } from '../api/dataPurchase';
import { getDataTariffPriceList, parseTariffResponseToCatalog } from '../api/dataTariffs';
import { PAYSTACK_PUBLIC_KEY } from '../config';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import { formatPointsEarned } from '../points';
import { DATA_PLANS } from '../dataPlans';
import type { AppScreen, DataPlan, DataState, DataTab, Tx } from '../types';
import { Paystack } from './ElectricityPaystackModal';

const grey = C.muted;
const TABS: { key: DataTab; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
];

const NET_COL: Record<string, string> = {
  MTN: '#FFCC00',
  Airtel: '#FF0000',
  Glo: '#007B40',
  '9mobile': '#006633',
};
const NET_TXT: Record<string, string> = {
  MTN: '#1A1A1A',
  Airtel: '#FFFFFF',
  Glo: '#FFFFFF',
  '9mobile': '#FFFFFF',
};

/** UI chip label → BuyPower `provider` query (tariff + vend). Adjust if your dashboard uses different codes. */
const NETWORK_TO_PROVIDER: Record<string, string> = {
  MTN: 'MTN',
  Airtel: 'AIRTEL',
  Glo: 'GLO',
  '9mobile': 'ETISALAT',
};

const NETWORK_ORDER = ['MTN', 'Airtel', 'Glo', '9mobile'] as const;

/** Offline fallback only: daily, weekly, monthly, yearly — no hot tab. */
function staticCatalogTabs(network: string): Record<DataTab, DataPlan[]> {
  const src = (DATA_PLANS[network] ?? DATA_PLANS.MTN) as Partial<Record<DataTab, DataPlan[]>>;
  return {
    daily: [...(src.daily ?? [])],
    weekly: [...(src.weekly ?? [])],
    monthly: [...(src.monthly ?? [])],
    yearly: [...(src.yearly ?? [])],
  };
}

export function DataScreen({
  goTo,
  dataState,
  setDataState,
  onAddTx,
  onPurchaseComplete,
  authUser,
}: {
  goTo: (s: AppScreen) => void;
  dataState: DataState;
  setDataState: Dispatch<SetStateAction<DataState>>;
  onAddTx: (tx: Tx) => void;
  onPurchaseComplete: (pointsEarned: number) => void;
  authUser: AuthUser | null;
}) {
  const [paying, setPaying] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payCheckout, setPayCheckout] = useState<{
    reference: string;
    email: string;
    metadata: Record<string, unknown>;
  } | null>(null);
  const [remoteCatalog, setRemoteCatalog] = useState<Record<DataTab, DataPlan[]> | null>(null);
  const [tariffLoading, setTariffLoading] = useState(false);
  const [tariffError, setTariffError] = useState<string | null>(null);
  const [usingStaticFallback, setUsingStaticFallback] = useState(false);
  const { tab, network, plan, phone } = dataState;

  const provider = NETWORK_TO_PROVIDER[network] ?? network.toUpperCase();

  useEffect(() => {
    let cancelled = false;
    setTariffLoading(true);
    setTariffError(null);
    setUsingStaticFallback(false);

    void (async () => {
      try {
        const res = await getDataTariffPriceList('Data', provider);
        if (cancelled) return;
        const catalog = parseTariffResponseToCatalog(res);
        const hasAny =
          catalog.daily.length +
            catalog.weekly.length +
            catalog.monthly.length +
            catalog.yearly.length >
          0;
        if (hasAny) {
          setRemoteCatalog(catalog);
        } else {
          setRemoteCatalog(null);
          setUsingStaticFallback(true);
          setTariffError('No plans returned for this network. Showing sample catalog.');
        }
      } catch (e) {
        if (cancelled) return;
        const msg =
          e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Could not load data plans';
        setTariffError(msg);
        setRemoteCatalog(null);
        setUsingStaticFallback(true);
      } finally {
        if (!cancelled) setTariffLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [network, provider]);

  const catalog = remoteCatalog ?? staticCatalogTabs(network);
  const plans = catalog[tab] ?? [];

  const handleNetwork = (n: string) => {
    if (n === network) return;
    setDataState(s => ({ ...s, network: n, plan: null }));
  };

  const handleTab = (t: DataTab) => {
    if (t === tab) return;
    setDataState(s => ({ ...s, tab: t, plan: null }));
  };

  const hasTariffCode = !!plan?.tariffClass?.trim();
  const canContinue = !!plan && phone.length === 11 && hasTariffCode;

  const dismissPayModal = () => {
    setShowPayModal(false);
    setPayCheckout(null);
  };

  const startPaystackCheckout = () => {
    if (!plan || !canContinue) return;
    if (!authUser) {
      Alert.alert('Sign in required', 'Please sign in to buy data.');
      return;
    }
    if (!PAYSTACK_PUBLIC_KEY?.trim()) {
      Alert.alert('Paystack key missing', 'Set PAYSTACK_PUBLIC_KEY in src/app/config.ts.');
      return;
    }
    const email = (authUser.email || '').trim();
    if (!email) {
      Alert.alert('Email required', 'Add an email to your account to pay with Paystack.');
      return;
    }
    if (!hasTariffCode) {
      Alert.alert(
        'Live prices required',
        'This plan has no bundle code. Load network prices from the server or pick another plan.',
      );
      return;
    }

    void (async () => {
      setPaying(true);
      try {
        const init = await initializeDataPurchase({
          user_id: authUser.id,
          phone,
          disco: provider,
          amount: plan.price,
          name: authUser.name,
          email: authUser.email,
          tariffClass: plan.tariffClass!,
          plan_label: plan.size,
          paymentType: 'B2B',
          vendType: 'PREPAID',
          defer_payment_init: true,
        });
        const reference = init.data?.reference;
        if (!reference) throw new Error('Server did not return payment reference');

        setPayCheckout({
          reference,
          email,
          metadata: {
            user_id: authUser.id,
            transaction_id: init.data.transaction_id,
            type: 'data',
            disco: provider,
            phone,
            tariffClass: plan.tariffClass,
          },
        });
        setShowPayModal(true);
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Could not start checkout';
        Alert.alert('Checkout failed', msg);
      } finally {
        setPaying(false);
      }
    })();
  };

  const clearPlan = () => setDataState(s => ({ ...s, plan: null, tab: 'daily' }));

  return (
    <View style={styles.page}>
      <ScreenHeader
        title="Buy Data"
        onBack={() => goTo('services')}
        rightSlot={
          plan ? (
            <Pressable onPress={clearPlan} style={styles.clearBtn}>
              <Text style={styles.clearBtnTxt}>Clear</Text>
            </Pressable>
          ) : null
        }
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.netRow}>
          {NETWORK_ORDER.map(n => (
            <Pressable
              key={n}
              onPress={() => handleNetwork(n)}
              style={[
                styles.netBtn,
                {
                  borderColor: network === n ? NET_COL[n] ?? C.primary : C.border,
                  backgroundColor: network === n ? NET_COL[n] ?? C.disabled : C.white,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: network === n ? '700' : '400',
                  color: network === n ? NET_TXT[n] ?? grey : grey,
                }}
              >
                {n}
              </Text>
            </Pressable>
          ))}
        </View>
        {tariffLoading ? (
          <View style={styles.tariffLoadingRow}>
            <ActivityIndicator size="small" color={grey} />
            <Text style={styles.tariffMeta}>Loading prices…</Text>
          </View>
        ) : null}
        {tariffError ? (
          <Text style={[styles.tariffMeta, usingStaticFallback ? styles.tariffWarn : styles.tariffErr]}>
            {usingStaticFallback ? `${tariffError} Using offline sample plans.` : tariffError}
          </Text>
        ) : null}

        <Text style={styles.label}>PHONE</Text>
        <View style={[styles.phoneBox, phone.length === 11 ? { borderColor: '#C8D080' } : null]}>
          <TextInput
            value={phone}
            onChangeText={t => setDataState(s => ({ ...s, phone: t.replace(/\D/g, '').slice(0, 11) }))}
            keyboardType="phone-pad"
            placeholder="0801 234 5678"
            placeholderTextColor={C.placeholder}
            style={styles.phoneInput}
          />
        </View>

        <View style={styles.tabBar}>
          {TABS.map(t => (
            <Pressable
              key={t.key}
              onPress={() => handleTab(t.key)}
              style={[styles.tab, tab === t.key ? { backgroundColor: C.primary } : { backgroundColor: 'transparent' }]}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: tab === t.key ? '700' : '400',
                  color: tab === t.key ? C.ink : grey,
                }}
              >
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {!tariffLoading && plans.length === 0 ? (
          <Text style={styles.emptyPlans}>No bundles for {tab}. Try another period or network.</Text>
        ) : null}

        {plans.map(p => {
          const sel = plan?.id === p.id;
          return (
            <Pressable
              key={p.id}
              onPress={() => setDataState(s => ({ ...s, plan: p }))}
              style={[styles.planRow, sel ? { backgroundColor: C.primFaint, borderColor: C.primary } : { borderColor: C.border }]}
            >
              <View style={{ minWidth: 56 }}>
                <Text style={styles.planSize}>{p.size}</Text>
                <Text style={styles.planVal}>{p.validity}</Text>
              </View>
              {p.tag ? (
                <View style={styles.tag}>
                  <Text style={styles.tagTxt}>{p.tag.toUpperCase()}</Text>
                </View>
              ) : (
                <View style={{ flex: 1 }} />
              )}
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.planPrice}>₦{p.price.toLocaleString()}</Text>
                <View style={styles.ptsPill}>
                  <Text style={styles.ptsPillTxt}>+{p.pts} pts</Text>
                </View>
              </View>
              {sel ? (
                <View style={styles.check}>
                  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M5 12l5 5L20 7"
                      stroke={C.ink}
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
              ) : null}
            </Pressable>
          );
        })}

        <Pressable
          disabled={!canContinue || paying || showPayModal}
          onPress={startPaystackCheckout}
          style={[styles.cta, (!canContinue || paying || showPayModal) && styles.ctaDisabled]}
        >
          {paying ? (
            <ActivityIndicator color={C.ink} />
          ) : (
            <Text style={styles.ctaTxt}>
              {plan && phone.length === 11 && !hasTariffCode
                ? 'Load live prices to pay (plan code missing)'
                : canContinue && plan
                  ? `Buy ${network} ${plan.size} — ₦${plan.price.toLocaleString()}`
                  : 'Select a plan and enter phone'}
            </Text>
          )}
        </Pressable>
      </ScrollView>

      {payCheckout && plan ? (
        <Paystack
          visible={showPayModal}
          paystackKey={PAYSTACK_PUBLIC_KEY}
          amount={plan.price}
          billingEmail={payCheckout.email}
          reference={payCheckout.reference}
          metadata={payCheckout.metadata}
          onSuccess={async res => {
            const ref = res?.reference?.trim() ? res.reference : payCheckout.reference;
            setPaying(true);
            try {
              await completeDataPurchase({ reference: ref });
              dismissPayModal();
              onAddTx({
                id: String(Date.now()),
                type: 'data',
                title: `Data — ${network} ${plan.size}`,
                amount: `-₦${plan.price.toLocaleString()}`,
                pts: formatPointsEarned(plan.pts),
                date: 'Just now',
                status: 'Successful',
              });
              onPurchaseComplete(plan.pts);
            } catch (e) {
              const msg =
                e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Could not complete purchase';
              Alert.alert('Purchase failed', msg);
            } finally {
              setPaying(false);
            }
          }}
          onCancel={() => dismissPayModal()}
          onRequestClose={dismissPayModal}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
  clearBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, backgroundColor: C.disabled },
  clearBtnTxt: { fontSize: 11, fontWeight: '600', color: grey },
  netRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  tariffLoadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  tariffMeta: { fontSize: 12, color: grey, marginBottom: 10 },
  tariffWarn: { color: C.olive },
  tariffErr: { color: C.error },
  emptyPlans: { fontSize: 13, color: grey, textAlign: 'center', marginBottom: 12 },
  netBtn: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: grey,
    marginBottom: 6,
    letterSpacing: 0.4,
  },
  phoneBox: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
    paddingHorizontal: 12,
    marginBottom: 14,
    justifyContent: 'center',
  },
  phoneInput: { fontSize: 15, fontWeight: '500', color: C.ink },
  tabBar: {
    backgroundColor: C.white,
    borderRadius: 10,
    padding: 4,
    flexDirection: 'row',
    gap: 2,
    marginBottom: 14,
  },
  tab: { flex: 1, height: 34, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: C.white,
    marginBottom: 10,
  },
  planSize: { fontSize: 20, fontWeight: '700', color: C.ink },
  planVal: { fontSize: 11, color: grey, marginTop: 2 },
  tag: { backgroundColor: C.ink, borderRadius: 6, paddingVertical: 2, paddingHorizontal: 8 },
  tagTxt: { fontSize: 10, fontWeight: '700', color: C.primary },
  planPrice: { fontSize: 16, fontWeight: '700', color: C.ink },
  ptsPill: {
    marginTop: 4,
    backgroundColor: C.primXlt,
    borderRadius: 4,
    paddingVertical: 1,
    paddingHorizontal: 6,
    alignSelf: 'flex-end',
  },
  ptsPillTxt: { fontSize: 10, fontWeight: '600', color: C.olive },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cta: {
    height: 50,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  ctaDisabled: { opacity: 0.45 },
  ctaTxt: { fontSize: 15, fontWeight: '800', color: C.ink },
});
