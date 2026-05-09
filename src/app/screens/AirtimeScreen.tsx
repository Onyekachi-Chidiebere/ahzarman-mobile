import { useState } from 'react';
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
import Svg, { Circle, Path } from 'react-native-svg';
import type { AuthUser } from '../api/auth';
import { ApiError } from '../api/client';
import { completeAirtimePurchase, initializeAirtimePurchase } from '../api/airtimePurchase';
import { PAYSTACK_PUBLIC_KEY } from '../config';
import { ScreenHeader } from '../components';
import { C } from '../constants';
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

function pointsForAmount(amt: number) {
  return Math.max(5, Math.round(amt / 20));
}

export function AirtimeScreen({
  goTo,
  beneficiaries,
  onSaveBenef,
  onAddTx,
  onPurchaseComplete,
  authUser,
}: {
  goTo: (s: AppScreen) => void;
  beneficiaries: Beneficiary[];
  onSaveBenef: (b: Beneficiary) => void;
  onAddTx: (tx: Tx) => void;
  onPurchaseComplete: (pointsEarned: number) => void;
  authUser: AuthUser | null;
}) {
  const [network, setNetwork] = useState<string>('MTN');
  const [phone, setPhone] = useState('');
  const [selAmt, setSelAmt] = useState<number | null>(null);
  const [customAmt, setCustomAmt] = useState('');
  const [save, setSave] = useState(false);
  const [benName, setBenName] = useState('');
  const [paying, setPaying] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payCheckout, setPayCheckout] = useState<{
    reference: string;
    email: string;
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

  const startPaystackCheckout = () => {
    if (!canContinue) return;
    if (!authUser) {
      Alert.alert('Sign in required', 'Please sign in to buy airtime.');
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

  const finishPurchase = (pts: number) => {
    if (save && benName.trim() && phone.length === 11) {
      onSaveBenef({ id: Date.now(), name: benName.trim(), phone, network });
    }
    onAddTx({
      id: String(Date.now()),
      type: 'airtime',
      title: `Airtime — ${network}`,
      amount: `-₦${finalAmt.toLocaleString()}`,
      pts: `+${pts} pts`,
      date: 'Just now',
      status: 'Successful',
    });
    dismissPayModal();
    onPurchaseComplete(pts);
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

        <Pressable
          disabled={!canContinue || paying || showPayModal}
          onPress={startPaystackCheckout}
          style={[styles.cta, (!canContinue || paying || showPayModal) && styles.ctaDisabled]}
        >
          {paying ? (
            <ActivityIndicator color={C.ink} />
          ) : (
            <Text style={styles.ctaTxt}>
              {canContinue ? `Pay with Paystack — ₦${finalAmt.toLocaleString()}` : 'Enter phone and amount'}
            </Text>
          )}
        </Pressable>
      </ScrollView>

      {payCheckout ? (
        <Paystack
          visible={showPayModal}
          paystackKey={PAYSTACK_PUBLIC_KEY}
          amount={finalAmt}
          billingEmail={payCheckout.email}
          reference={payCheckout.reference}
          metadata={payCheckout.metadata}
          onSuccess={async res => {
            const ref = res?.reference?.trim() ? res.reference : payCheckout.reference;
            const pts = pointsForAmount(finalAmt);
            setPaying(true);
            try {
              await completeAirtimePurchase({ reference: ref });
              finishPurchase(pts);
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
});
