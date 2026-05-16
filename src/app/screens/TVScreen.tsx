import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import { getDataTariffPriceList, parseTariffResponseToTvPlans } from '../api/dataTariffs';
import { checkBuyPowerMeter, mapMeterCheckToCustomerName, meterVerifyErrorMessage } from '../api/meterCheck';
import type { AuthUser } from '../api/auth';
import { ApiError } from '../api/client';
import { completeTvPurchase, initializeTvPurchase } from '../api/tvPurchase';
import { PAYSTACK_PUBLIC_KEY } from '../config';
import { formatPointsEarned, pointsForAmount } from '../points';
import type { TvPlan, TvProviderId } from '../tvProviders';
import { TV_PROVIDERS, TV_TARIFF_PROVIDER } from '../tvProviders';
import type { AppScreen, Tx } from '../types';
import { Paystack } from './ElectricityPaystackModal';

const grey = C.muted;
const PROVIDER_KEYS = Object.keys(TV_PROVIDERS) as TvProviderId[];

function planSubtitle(p: TvPlan) {
  return [p.desc, p.validity].filter(Boolean).join(' · ');
}

export function TVScreen({
  goTo,
  onAddTx,
  onPurchaseComplete,
  authUser,
}: {
  goTo: (s: AppScreen) => void;
  onAddTx: (tx: Tx) => void;
  onPurchaseComplete: (pts: number) => void;
  authUser: AuthUser | null;
}) {
  const [provider, setProvider] = useState<TvProviderId>('DStv');
  const [plan, setPlan] = useState<TvPlan | null>(null);
  const [plans, setPlans] = useState<TvPlan[]>(() => TV_PROVIDERS.DStv.plans);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansBanner, setPlansBanner] = useState<string | null>(null);
  const [decoder, setDecoder] = useState('');
  const [verifyingDec, setVerifyingDec] = useState(false);
  const [verifiedDec, setVerifiedDec] = useState<{ name: string } | null>(null);
  const [verifyDecError, setVerifyDecError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [completingVend, setCompletingVend] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payCheckout, setPayCheckout] = useState<{
    reference: string;
    email: string;
    amount: number;
    metadata: Record<string, unknown>;
  } | null>(null);

  const canPay = !!plan && !!verifiedDec && decoder.length >= 5;

  useEffect(() => {
    let cancelled = false;
    const fallback = TV_PROVIDERS[provider].plans;
    const apiProvider = TV_TARIFF_PROVIDER[provider];

    setPlansLoading(true);
    setPlansBanner(null);
    setPlan(null);

    (async () => {
      try {
        const res = await getDataTariffPriceList('TV', apiProvider);
        const parsed = parseTariffResponseToTvPlans(res);
        if (cancelled) return;
        if (parsed.length) {
          setPlans(parsed);
        } else {
          setPlans(fallback);
          setPlansBanner('No live plans; showing saved list.');
        }
      } catch {
        if (cancelled) return;
        setPlans(fallback);
        setPlansBanner('Could not load plans; showing saved list.');
      } finally {
        if (!cancelled) setPlansLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [provider]);

  const dismissPayModal = () => {
    if (completingVend) return;
    setShowPayModal(false);
    setPayCheckout(null);
  };

  const handlePaystackSuccess = async (res: { reference?: string }) => {
    if (!payCheckout || !plan) return;
    const ref = res?.reference?.trim() ? res.reference : payCheckout.reference;
    const pts = pointsForAmount(plan.price);
    setCompletingVend(true);
    try {
      const result = await completeTvPurchase({ reference: ref });
      if (result.data?.status !== 'success') {
        throw new Error('TV subscription was not confirmed. Please contact support with your payment reference.');
      }
      setShowPayModal(false);
      setPayCheckout(null);
      onAddTx({
        id: String(Date.now()),
        type: 'tv',
        title: `${provider} ${plan.name}`,
        amount: `-₦${plan.price.toLocaleString()}`,
        pts: formatPointsEarned(pts),
        date: 'Just now',
        status: 'Successful',
      });
      onPurchaseComplete(pts);
    } catch (e) {
      let msg =
        e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Could not complete TV subscription';
      if (e instanceof ApiError && e.body && typeof e.body === 'object') {
        const b = e.body as { buypower_message?: string };
        if (typeof b.buypower_message === 'string' && b.buypower_message.trim()) {
          msg = b.buypower_message.trim();
        }
      }
      Alert.alert(
        'Subscription failed',
        `${msg}\n\nYour Paystack payment may have gone through. Retry from the app or contact support with reference: ${ref}.`,
      );
    } finally {
      setCompletingVend(false);
    }
  };

  const handleVerifyDec = () => {
    if (decoder.length < 5) return;
    setVerifyingDec(true);
    setVerifiedDec(null);
    setVerifyDecError(null);
    void (async () => {
      try {
        const res = await checkBuyPowerMeter({
          meter: decoder,
          disco: TV_TARIFF_PROVIDER[provider],
          vendType: 'PREPAID',
        });
        const name = mapMeterCheckToCustomerName(res.data);
        if (name) {
          setVerifiedDec({ name });
        } else {
          setVerifiedDec({ name: 'Decoder verified' });
        }
      } catch (e) {
        setVerifyDecError(
          meterVerifyErrorMessage(e, 'Could not verify decoder. Check the number and try again.'),
        );
      } finally {
        setVerifyingDec(false);
      }
    })();
  };

  const startPaystackCheckout = () => {
    if (!canPay || !plan) return;
    if (!authUser) {
      Alert.alert('Sign in required', 'Please sign in to subscribe to cable TV.');
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
    const phone = authUser.phone.replace(/\D/g, '').slice(-11);
    if (phone.length < 10) {
      Alert.alert('Phone required', 'Your account needs a valid phone number for TV subscription.');
      return;
    }
    if (!plan.code?.trim()) {
      Alert.alert('Plan unavailable', 'This plan has no bundle code. Pick another plan or try again later.');
      return;
    }

    void (async () => {
      setPaying(true);
      try {
        const init = await initializeTvPurchase({
          user_id: authUser.id,
          meter: decoder,
          phone,
          disco: TV_TARIFF_PROVIDER[provider],
          amount: plan.price,
          name: verifiedDec?.name || authUser.name,
          email: authUser.email,
          tariffClass: plan.code,
          plan_label: plan.name,
          provider_label: provider,
          paymentType: 'B2B',
          vendType: 'PREPAID',
          defer_payment_init: true,
        });
        const reference = init.data?.reference;
        if (!reference) throw new Error('Server did not return payment reference');

        setPayCheckout({
          reference,
          email,
          amount: plan.price,
          metadata: {
            user_id: authUser.id,
            transaction_id: init.data.transaction_id,
            type: 'tv',
            disco: TV_TARIFF_PROVIDER[provider],
            meter: decoder,
            tariffClass: plan.code,
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

  return (
    <View style={styles.page}>
      <ScreenHeader title="Cable TV" onBack={() => goTo('services')} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>PROVIDER</Text>
        <View style={styles.prow}>
          {PROVIDER_KEYS.map(p => (
            <Pressable
              key={p}
              onPress={() => {
                setProvider(p);
                setPlan(null);
                setDecoder('');
                setVerifiedDec(null);
                setVerifyDecError(null);
              }}
              style={[
                styles.pchip,
                provider === p ? { borderColor: C.primary, backgroundColor: C.primFaint } : null,
              ]}
            >
              <Text style={[styles.pchipTxt, provider === p ? { fontWeight: '700', color: C.olive } : { color: grey }]}>
                {p}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>DECODER / SMART CARD NUMBER</Text>
        <View style={styles.decRow}>
          <View style={[styles.decInputWrap, verifiedDec ? { borderColor: C.successBorder, backgroundColor: C.successBg } : null]}>
            <TextInput
              value={decoder}
              onChangeText={v => {
                setDecoder(v.replace(/\D/g, '').slice(0, 12));
                setVerifiedDec(null);
                setVerifyDecError(null);
              }}
              placeholder="Enter decoder / smart card number"
              placeholderTextColor={C.placeholder}
              keyboardType="number-pad"
              style={styles.decInput}
            />
            {verifiedDec ? (
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Circle cx={12} cy={12} r={10} fill={C.success} />
                <Path d="M8 12l3 3 5-5" stroke={C.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            ) : null}
          </View>
          <Pressable
            onPress={handleVerifyDec}
            disabled={decoder.length < 5 || verifyingDec || !!verifiedDec}
            style={[
              styles.vbtn,
              verifiedDec ? { backgroundColor: C.successBg } : decoder.length >= 5 && !verifyingDec ? null : { backgroundColor: C.disabled },
            ]}
          >
            {verifyingDec ? (
              <ActivityIndicator color={grey} />
            ) : verifiedDec ? (
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path d="M5 12l5 5L20 7" stroke={C.success} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            ) : (
              <Text style={[styles.vbtnTxt, decoder.length < 5 && { color: C.disabledTxt }]}>Verify</Text>
            )}
          </Pressable>
        </View>
        {verifiedDec ? (
          <View style={styles.okBox}>
            <Text style={styles.okName}>{verifiedDec.name}</Text>
            <Text style={styles.okSub}>Verified {provider} subscriber</Text>
          </View>
        ) : null}
        {verifyingDec ? (
          <View style={styles.pending}>
            <ActivityIndicator size="small" color={grey} />
            <Text style={styles.pendingTxt}>Verifying decoder…</Text>
          </View>
        ) : null}
        {verifyDecError ? <Text style={styles.verifyErr}>{verifyDecError}</Text> : null}

        <Text style={styles.label}>{provider} PLANS</Text>
        {plansLoading ? (
          <View style={styles.pending}>
            <ActivityIndicator size="small" color={grey} />
            <Text style={styles.pendingTxt}>Loading plans…</Text>
          </View>
        ) : null}
        {plansBanner ? <Text style={styles.banner}>{plansBanner}</Text> : null}
        {plans.map(p => {
          const sel = plan?.code === p.code;
          return (
            <Pressable
              key={p.code}
              disabled={!verifiedDec}
              onPress={() => verifiedDec && setPlan(p)}
              style={[
                styles.planCard,
                sel ? { borderColor: C.primary, backgroundColor: C.primFaint } : null,
                !verifiedDec && { opacity: 0.55 },
              ]}
            >
              <View>
                <Text style={styles.planName}>{p.name}</Text>
                <Text style={styles.planDesc}>{planSubtitle(p)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.planPrice}>₦{p.price.toLocaleString()}</Text>
                <View style={styles.ptsPill}>
                  <Text style={styles.ptsTxt}>+{p.pts} pts</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
        {!verifiedDec ? <Text style={styles.warn}>Verify your decoder number first to select a plan</Text> : null}

        <Pressable
          disabled={!canPay || paying || showPayModal}
          onPress={startPaystackCheckout}
          style={[styles.cta, (!canPay || paying || showPayModal) && styles.ctaDis]}
        >
          {paying ? (
            <ActivityIndicator color={C.ink} />
          ) : (
            <Text style={styles.ctaTxt}>
              {canPay && plan
                ? `Pay with Paystack — ${provider} ${plan.name} · ₦${plan.price.toLocaleString()}`
                : 'Verify decoder & select a plan'}
            </Text>
          )}
        </Pressable>
      </ScrollView>

      {payCheckout && plan ? (
        <Paystack
          visible={showPayModal}
          paystackKey={PAYSTACK_PUBLIC_KEY}
          amount={payCheckout.amount}
          billingEmail={payCheckout.email}
          reference={payCheckout.reference}
          metadata={payCheckout.metadata}
          onSuccess={handlePaystackSuccess}
          onCancel={() => dismissPayModal()}
          onRequestClose={dismissPayModal}
        />
      ) : null}

      {completingVend ? (
        <View style={styles.completingOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.completingTxt}>Completing your {provider} subscription…</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32, gap: 8 },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: grey,
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  prow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  pchip: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pchipTxt: { fontSize: 13 },
  decRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  decInputWrap: {
    flex: 1,
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    backgroundColor: C.white,
  },
  decInput: { flex: 1, fontSize: 14, fontWeight: '500', color: C.ink },
  vbtn: {
    width: 80,
    height: 52,
    borderRadius: 10,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vbtnTxt: { fontSize: 13, fontWeight: '600', color: C.ink },
  okBox: {
    backgroundColor: C.successBg,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: C.successBorder,
  },
  okName: { fontSize: 13, fontWeight: '700', color: C.success },
  okSub: { fontSize: 11, color: C.success, opacity: 0.85, marginTop: 4 },
  pending: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pendingTxt: { fontSize: 12, color: grey },
  banner: { fontSize: 11, color: C.placeholder, marginBottom: 4 },
  verifyErr: { fontSize: 12, color: C.error, marginTop: 4, marginBottom: 4 },
  planCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
    marginBottom: 8,
  },
  planName: { fontSize: 14, fontWeight: '600', color: C.ink },
  planDesc: { fontSize: 11, color: grey, marginTop: 2 },
  planPrice: { fontSize: 15, fontWeight: '700', color: C.ink },
  ptsPill: {
    marginTop: 4,
    backgroundColor: C.primXlt,
    borderRadius: 4,
    paddingVertical: 1,
    paddingHorizontal: 6,
  },
  ptsTxt: { fontSize: 10, fontWeight: '600', color: C.olive },
  warn: { fontSize: 12, color: C.placeholder, marginTop: 4 },
  cta: {
    height: 50,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  ctaDis: { opacity: 0.45 },
  ctaTxt: { fontSize: 15, fontWeight: '700', color: C.ink, textAlign: 'center', paddingHorizontal: 8 },
  completingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248,249,246,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 20,
  },
  completingTxt: { fontSize: 14, fontWeight: '600', color: C.ink, textAlign: 'center', paddingHorizontal: 24 },
});
