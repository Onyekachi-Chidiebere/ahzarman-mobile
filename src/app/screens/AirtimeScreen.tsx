import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import type { AuthUser } from '../api/auth';
import { ApiError, apiErrorMessage } from '../api/client';
import { completeAirtimePurchase, initializeAirtimePurchase } from '../api/airtimePurchase';
import { payWithPoints } from '../api/pointsPay';
import { PayMethodToggle, type PayMethod } from '../components/PayMethodToggle';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import { NumPad } from '../NumPad';
import { formatPointsEarned, pointsForAmount } from '../points';
import type { AppScreen, Beneficiary, Tx } from '../types';
import { Paystack } from './ElectricityPaystackModal';

const grey = C.muted;
const NETS = ['MTN', 'Airtel', 'Glo', '9mobile'] as const;
const PRESETS = [50, 100, 200, 500, 1000, 2000];

/** BuyPower VTU `disco` codes (match /services/airtime/vend). */
const AIRTIME_DISCO: Record<string, string> = {
  MTN: 'MTN',
  Airtel: 'AIRTEL',
  Glo: 'GLO',
  '9mobile': '9MOBILE',
};

/** Local prefix check before charging (server also validates). MNP can still mismatch. */
const NET_PREFIXES: Record<string, string[]> = {
  MTN: ['0703', '0704', '0706', '0803', '0806', '0810', '0813', '0814', '0816', '0903', '0906', '0913', '0916'],
  Airtel: ['0701', '0708', '0802', '0808', '0812', '0901', '0902', '0904', '0907', '0912'],
  Glo: ['0705', '0805', '0807', '0811', '0815', '0905', '0915'],
  '9mobile': ['0809', '0817', '0818', '0908', '0909'],
};

function phoneLooksLikeNetwork(phone11: string, network: string): boolean {
  const prefixes = NET_PREFIXES[network];
  if (!prefixes) return true;
  return prefixes.some(p => phone11.startsWith(p));
}

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

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Pressable onPress={() => onChange(!value)} style={[styles.toggleTrack, value ? styles.toggleOn : null]}>
      <View style={[styles.toggleKnob, value ? { marginLeft: 18 } : { marginLeft: 0 }]} />
    </Pressable>
  );
}

export function AirtimeScreen({
  goTo,
  beneficiaries,
  onSaveBenef,
  onAddTx,
  onPurchaseComplete,
  authUser,
  authToken,
  userPoints = 0,
}: {
  goTo: (s: AppScreen) => void;
  beneficiaries: Beneficiary[];
  onSaveBenef: (b: Beneficiary) => void;
  onAddTx: (tx: Tx) => void;
  onPurchaseComplete: (pointsEarned: number) => void;
  authUser: AuthUser | null;
  authToken: string | null;
  userPoints?: number;
}) {
  const [network, setNetwork] = useState<string>('MTN');
  const [phone, setPhone] = useState('');
  const [selAmt, setSelAmt] = useState<number | null>(null);
  const [customAmt, setCustomAmt] = useState('');
  const [save, setSave] = useState(false);
  const [benName, setBenName] = useState('');
  const [paying, setPaying] = useState(false);
  const [payMethod, setPayMethod] = useState<PayMethod>('card');
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [pinErr, setPinErr] = useState('');
  const [showPayModal, setShowPayModal] = useState(false);
  const [payCheckout, setPayCheckout] = useState<{
    reference: string;
    email: string;
    checkoutUrl: string;
    metadata: Record<string, unknown>;
  } | null>(null);

  const netBenefs = beneficiaries.filter(b => b.network === network);
  const finalAmt =
    selAmt !== null ? PRESETS[selAmt] : Math.min(50000, Math.max(0, parseInt(customAmt || '0', 10) || 0));
  const canContinue = phone.length === 11 && finalAmt >= 50 && finalAmt <= 50000;
  const disco = AIRTIME_DISCO[network] ?? network.toUpperCase();

  const dismissPayModal = () => {
    setShowPayModal(false);
    setPayCheckout(null);
  };

  const submitPointsPay = async (pinValue: string) => {
    if (!authUser || !canContinue) return;
    setPaying(true);
    setPinErr('');
    try {
      const res = await payWithPoints(authToken, {
        service: 'airtime',
        amount: finalAmt,
        pin: pinValue,
        phone,
        disco,
        name: authUser.name,
        email: authUser.email,
      });
      setShowPin(false);
      setPin('');
      const st = String(res.data?.status || '').toLowerCase();
      const delivery = String(res.data?.delivery || '').toLowerCase();
      if (st === 'success' || delivery === 'delivered') {
        finishPurchase(0, { status: 'Successful', transactionId: res.data.transaction_id });
        Alert.alert('Success', 'Airtime delivered — paid with points (no bonus earn).');
      } else if (st === 'refunded' || delivery === 'points_restored') {
        finishPurchase(0, { status: 'Refunded', transactionId: res.data.transaction_id });
        Alert.alert('Points restored', res.message || 'Delivery failed; your points were restored.');
      } else {
        finishPurchase(0, { status: 'Pending', transactionId: res.data.transaction_id });
        Alert.alert(
          'Payment successful',
          'Points reserved. Airtime delivery is in progress — check History to retry if needed.',
        );
      }
    } catch (e) {
      setPinErr(apiErrorMessage(e, 'Points payment failed'));
      setPin('');
    } finally {
      setPaying(false);
    }
  };

  const startCheckout = () => {
    if (!canContinue) return;
    if (!authUser) {
      Alert.alert('Sign in required', 'Please sign in to buy airtime.');
      return;
    }
    if (!phoneLooksLikeNetwork(phone, network)) {
      Alert.alert(
        'Check network',
        `This number does not look like a ${network} line. Pick the correct network before paying.`,
      );
      return;
    }

    if (payMethod === 'points') {
      if (userPoints < finalAmt) {
        Alert.alert('Not enough points', `You need ${finalAmt.toLocaleString()} pts.`);
        return;
      }
      setPin('');
      setPinErr('');
      setShowPin(true);
      return;
    }

    const email = (authUser.email || '').trim();
    if (!email) {
      Alert.alert('Email required', 'Add an email to your account to pay.');
      return;
    }

    void (async () => {
      setPaying(true);
      try {
        const init = await initializeAirtimePurchase({
          user_id: authUser.id,
          phone,
          disco,
          amount: finalAmt,
          name: authUser.name,
          email: authUser.email,
          paymentType: 'B2B',
          vendType: 'PREPAID',
          defer_payment_init: false,
        });
        const reference = init.data?.reference;
        const checkoutUrl = init.data?.authorization_url?.trim() || '';
        if (!reference) throw new Error('Server did not return payment reference');
        if (!checkoutUrl) throw new Error('Server did not return TransactPay checkout URL');

        setPayCheckout({
          reference,
          email,
          checkoutUrl,
          metadata: {
            user_id: authUser.id,
            transaction_id: init.data.transaction_id,
            type: 'airtime',
            disco,
            phone,
            amount: finalAmt,
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

  const finishPurchase = (
    pts: number,
    opts: { status: 'Successful' | 'Pending' | 'Refunded'; transactionId?: number | string },
  ) => {
    if (save && benName.trim() && phone.length === 11) {
      onSaveBenef({ id: Date.now(), name: benName.trim(), phone, network });
    }
    onAddTx({
      id: String(opts.transactionId ?? Date.now()),
      type: 'airtime',
      title: `Airtime — ${network}`,
      amount: `-₦${finalAmt.toLocaleString()}`,
      pts: opts.status === 'Successful' ? formatPointsEarned(pts) : undefined,
      date: 'Just now',
      status: opts.status,
    });
    dismissPayModal();
    if (opts.status === 'Successful') {
      onPurchaseComplete(pts);
    } else {
      goTo('history');
    }
  };

  return (
    <View style={styles.page}>
      <ScreenHeader title="Airtime" onBack={() => goTo('services')} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionLabel}>NETWORK</Text>
        <View style={styles.netRow}>
          {NETS.map(n => (
            <Pressable
              key={n}
              onPress={() => setNetwork(n)}
              style={[styles.netChip, { backgroundColor: network === n ? NET_COL[n] ?? C.primary : C.disabled }]}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: network === n ? '700' : '400',
                  color: network === n ? NET_TXT[n] ?? C.ink : grey,
                }}
              >
                {n}
              </Text>
            </Pressable>
          ))}
        </View>

        {netBenefs.length > 0 ? (
          <View style={{ marginBottom: 4 }}>
            <Text style={styles.sectionLabel}>SAVED CONTACTS</Text>
            <View style={styles.benefRow}>
              {netBenefs.map(b => (
                <Pressable key={b.id} onPress={() => setPhone(b.phone)} style={styles.benefItem}>
                  <View style={styles.benefAvatarWrap}>
                    <View style={[styles.benefAvatar, { backgroundColor: NET_COL[b.network] ?? C.primary }]}>
                      <Text style={{ fontSize: 18, fontWeight: '700', color: NET_TXT[b.network] ?? C.ink }}>
                        {b.name[0]}
                      </Text>
                    </View>
                    {phone === b.phone ? <View style={styles.benefRing} /> : null}
                  </View>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.benefName,
                      { fontWeight: phone === b.phone ? '600' : '400', color: phone === b.phone ? C.olive : grey },
                    ]}
                  >
                    {b.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        <Text style={styles.sectionLabel}>PHONE NUMBER</Text>
        <View style={[styles.phoneWrap, phone.length === 11 ? { borderColor: '#C8D080' } : null]}>
          <TextInput
            value={phone}
            onChangeText={t => setPhone(t.replace(/\D/g, '').slice(0, 11))}
            keyboardType="phone-pad"
            placeholder="0801 234 5678"
            placeholderTextColor={C.placeholder}
            style={styles.phoneInput}
          />
          {phone.length === 11 ? (
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Circle cx={12} cy={12} r={10} fill={C.success} />
              <Path d="M8 12l3 3 5-5" stroke={C.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          ) : null}
        </View>

        <Text style={styles.sectionLabel}>QUICK AMOUNTS</Text>
        <View style={styles.presetGrid}>
          {PRESETS.map((a, i) => (
            <Pressable
              key={a}
              onPress={() => {
                setSelAmt(i);
                setCustomAmt('');
              }}
              style={[
                styles.presetCell,
                selAmt === i ? { backgroundColor: C.primXlt, borderColor: C.primary } : { borderColor: 'transparent' },
              ]}
            >
              <Text style={styles.presetTxt}>₦{a.toLocaleString()}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>OR ENTER CUSTOM AMOUNT</Text>
        <TextInput
          value={customAmt}
          onChangeText={v => {
            setCustomAmt(v.replace(/\D/g, ''));
            setSelAmt(null);
          }}
          keyboardType="number-pad"
          placeholder="₦ Min ₦50 · Max ₦50,000"
          placeholderTextColor={C.placeholder}
          style={styles.input}
        />

        <View style={styles.saveCard}>
          <View style={styles.saveRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.saveTitle}>Save as beneficiary</Text>
              <Text style={styles.saveSub}>Quick-select next time</Text>
            </View>
            <Toggle value={save} onChange={setSave} />
          </View>
          {save ? (
            <TextInput
              value={benName}
              onChangeText={setBenName}
              placeholder="Enter a name (e.g. Mum)"
              placeholderTextColor={C.placeholder}
              style={[styles.input, { marginTop: 10 }, benName ? { borderColor: C.primary } : null]}
            />
          ) : null}
        </View>

        <PayMethodToggle
          value={payMethod}
          onChange={setPayMethod}
          pointsBalance={userPoints}
          pointsNeeded={finalAmt}
        />

        <Pressable
          disabled={
            !canContinue ||
            paying ||
            showPayModal ||
            (payMethod === 'points' && userPoints < finalAmt)
          }
          onPress={startCheckout}
          style={[
            styles.cta,
            (!canContinue ||
              paying ||
              showPayModal ||
              (payMethod === 'points' && userPoints < finalAmt)) &&
              styles.ctaDisabled,
          ]}
        >
          {paying ? (
            <ActivityIndicator color={C.ink} />
          ) : (
            <Text style={styles.ctaTxt}>
              {!canContinue
                ? 'Enter phone and amount'
                : payMethod === 'points'
                  ? `Pay ${finalAmt.toLocaleString()} pts`
                  : `Pay — ₦${finalAmt.toLocaleString()}`}
            </Text>
          )}
        </Pressable>
      </ScrollView>

      <Modal
        visible={showPin}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!paying) {
            setShowPin(false);
            setPin('');
            setPinErr('');
          }
        }}
      >
        <Pressable
          style={styles.pinOverlay}
          onPress={() => {
            if (!paying) {
              setShowPin(false);
              setPin('');
              setPinErr('');
            }
          }}
        >
          <Pressable style={styles.pinSheet} onPress={e => e.stopPropagation()}>
            <View style={styles.grabber} />
            <Text style={styles.pinTitle}>Confirm with PIN</Text>
            <Text style={styles.pinSub}>
              Pay <Text style={{ color: C.olive, fontWeight: '700' }}>{finalAmt.toLocaleString()} pts</Text> for
              airtime
            </Text>
            <View style={styles.dots}>
              {[0, 1, 2, 3].map(i => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    { backgroundColor: pin.length > i ? (pinErr ? C.error : C.primary) : C.border },
                  ]}
                />
              ))}
            </View>
            {paying ? <ActivityIndicator color={C.primary} style={{ marginBottom: 8 }} /> : null}
            {pinErr ? (
              <View style={styles.errBox}>
                <Text style={styles.errTxt}>{pinErr}</Text>
              </View>
            ) : null}
            <NumPad
              onDigit={d => {
                if (paying || pin.length >= 4) return;
                const next = pin + d;
                setPin(next);
                setPinErr('');
                if (next.length === 4) void submitPointsPay(next);
              }}
              onDelete={() => {
                if (!paying) {
                  setPin(p => p.slice(0, -1));
                  setPinErr('');
                }
              }}
            />
            <Pressable
              onPress={() => {
                if (!paying) {
                  setShowPin(false);
                  setPin('');
                  setPinErr('');
                }
              }}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelTxt}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {payCheckout ? (
        <Paystack
          visible={showPayModal}
          checkoutUrl={payCheckout.checkoutUrl}
          amount={finalAmt}
          billingEmail={payCheckout.email}
          reference={payCheckout.reference}
          metadata={payCheckout.metadata}
          onSuccess={async res => {
            const ref = res?.reference?.trim() ? res.reference : payCheckout.reference;
            const pts = pointsForAmount(finalAmt);
            setPaying(true);
            try {
              const done = await completeAirtimePurchase({ reference: ref });
              const st = String(done.data?.status || '').toLowerCase();
              const delivery = String(done.data?.delivery || '').toLowerCase();
              const txId = done.data?.transaction_id;

              if (st === 'success' || delivery === 'delivered') {
                finishPurchase(pts, { status: 'Successful', transactionId: txId });
                Alert.alert('Payment successful', 'Your airtime has been delivered.');
                return;
              }
              if (st === 'refunded' || st === 'refund_pending' || delivery === 'refunded') {
                finishPurchase(0, { status: 'Refunded', transactionId: txId });
                Alert.alert(
                  'Payment refunded',
                  done.message ||
                    'We could not deliver airtime, so a refund was started. It may take a short time to appear.',
                );
                return;
              }

              // processing / paid — money taken, delivery pending (auto-retry then refund)
              finishPurchase(0, { status: 'Pending', transactionId: txId });
              Alert.alert(
                'Payment successful',
                'Your payment went through. Airtime delivery is in progress — you will not be charged again. Check History to retry or see status.',
              );
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
  page: { flex: 1, backgroundColor: C.white },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32, gap: 4 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: grey,
    marginBottom: 8,
    marginTop: 12,
    letterSpacing: 0.4,
  },
  netRow: { flexDirection: 'row', gap: 8 },
  netChip: { flex: 1, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  benefRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  benefItem: { alignItems: 'center', gap: 5, maxWidth: 72 },
  benefAvatarWrap: { position: 'relative' },
  benefAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefRing: {
    position: 'absolute',
    left: -2,
    right: -2,
    top: -2,
    bottom: -2,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: C.primary,
  },
  benefName: { fontSize: 11, maxWidth: 52, textAlign: 'center' },
  phoneWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 12,
    backgroundColor: C.white,
  },
  phoneInput: { flex: 1, fontSize: 15, fontWeight: '500', color: C.ink },
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  presetCell: {
    width: '31%',
    height: 48,
    borderRadius: 10,
    backgroundColor: C.disabled,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetTxt: { fontSize: 15, fontWeight: '600', color: C.ink },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 12,
    fontSize: 14,
    color: C.ink,
    backgroundColor: C.white,
  },
  saveCard: {
    backgroundColor: C.primFaint,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: C.primXlt,
    marginTop: 8,
  },
  saveRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  saveTitle: { fontSize: 14, fontWeight: '500', color: C.ink },
  saveSub: { fontSize: 11, color: C.olive, marginTop: 2 },
  toggleTrack: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#D0D0D0',
    paddingHorizontal: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleOn: { backgroundColor: C.primary },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  cta: {
    height: 50,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  ctaDisabled: { opacity: 0.45 },
  ctaTxt: { fontSize: 15, fontWeight: '800', color: C.ink },
  pinOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  pinSheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 10,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    marginBottom: 14,
  },
  pinTitle: { fontSize: 18, fontWeight: '700', color: C.ink, textAlign: 'center' },
  pinSub: { fontSize: 13, color: grey, textAlign: 'center', marginTop: 6, marginBottom: 16 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 12 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  errBox: {
    backgroundColor: C.errorBg,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  errTxt: { fontSize: 13, color: C.error, textAlign: 'center' },
  cancelBtn: { alignItems: 'center', paddingVertical: 12 },
  cancelTxt: { fontSize: 14, fontWeight: '500', color: grey },
});
