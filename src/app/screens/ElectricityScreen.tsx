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
import { ApiError } from '../api/client';
import { checkElectricityMeter } from '../api/electricity';
import type { AuthUser } from '../api/auth';
import { completeElectricityPurchase, initializeElectricityPurchase } from '../api/electricityPurchase';
import { PAYSTACK_PUBLIC_KEY } from '../config';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { Disco } from '../discos';
import { ELECTRICITY_DISCOS } from '../discos';
import type { AppScreen, ElecPurchaseSummary, Tx } from '../types';
import { Paystack } from './ElectricityPaystackModal';

const grey = C.muted;

function mergeMeterPayload(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== 'object') return {};
  const root = data as Record<string, unknown>;
  const nested = root.data ?? root.result ?? root.meterInfo ?? root.payload;
  const out = { ...root };
  if (nested && typeof nested === 'object' && nested !== null) {
    Object.assign(out, nested as Record<string, unknown>);
  }
  return out;
}

function pickString(obj: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

function mapMeterCheckToCustomer(data: unknown): { name: string; address: string; min: string } | null {
  const flat = mergeMeterPayload(data);
  const name = pickString(flat, [
    'customerName',
    'customer_name',
    'name',
    'fullName',
    'meterOwner',
    'customer',
    'accountName',
    'AccountName',
  ]);
  const address = pickString(flat, [
    'address',
    'customerAddress',
    'customer_address',
    'meterAddress',
    'location',
    'serviceAddress',
  ]);
  const min = pickString(flat, ['minVendAmount', 'minAmount', 'minimum', 'minimumAmount']);
  if (!name && !address) return null;
  return { name: name || 'Customer', address: address || '—', min: min || '500' };
}

function meterVerifyErrorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    const b = e.body as Record<string, unknown> | undefined;
    if (b && typeof b === 'object') {
      if (typeof b.message === 'string' && b.message) return b.message;
      const err = b.error;
      if (typeof err === 'string' && err) return err;
      if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: string }).message === 'string') {
        return (err as { message: string }).message;
      }
    }
    return e.message;
  }
  return 'Could not verify meter. Check your connection and try again.';
}

export function ElectricityScreen({
  goTo,
  onAddTx,
  authUser,
  onPurchaseSuccess,
}: {
  goTo: (s: AppScreen) => void;
  onAddTx: (tx: Tx) => void;
  authUser: AuthUser | null;
  onPurchaseSuccess: (summary: ElecPurchaseSummary) => void;
}) {
  const [disco, setDisco] = useState<Disco | null>(null);
  const [showDiscoSheet, setShowDiscoSheet] = useState(false);
  const [meter, setMeter] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState<{ name: string; address: string, min:string } | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [payError, setPayError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payCheckout, setPayCheckout] = useState<{
    reference: string;
    transactionId: number;
    email: string;
    metadata: Record<string, unknown>;
  } | null>(null);

  const handleVerify = () => {
    if (!disco || meter.length < 11) return;
    setVerifying(true);
    setVerified(null);
    setVerifyError(null);
    void (async () => {
      try {
        const discoCode = disco.buypowerCode ?? disco.id;
        const res = await checkElectricityMeter({ meter, disco: discoCode, vendType: 'PREPAID' });
        const mapped = mapMeterCheckToCustomer(res.data);
        if (mapped) {
          setVerified(mapped);
        } else {
          setVerified({
            name: 'Meter verified',
            address: `Proceed to enter amount for ${disco.name}.`,
            min: '500',
          });
        }
      } catch (e) {
        setVerifyError(meterVerifyErrorMessage(e));
      } finally {
        setVerifying(false);
      }
    })();
  };

  const amtNum = parseInt(amount || '0', 10);
  const minPay = Math.max(500, parseInt(verified?.min || '500', 10) || 500);
  const canOpenPay = verified && amtNum >= minPay;

  const openPayModal = () => {
    if (!canOpenPay || !disco) return;
    if (!authUser) {
      Alert.alert('Sign in required', 'Please sign in to buy electricity.');
      return;
    }
    if (!PAYSTACK_PUBLIC_KEY?.trim()) {
      Alert.alert(
        'Paystack key missing',
        'Set PAYSTACK_PUBLIC_KEY in src/app/config.ts (your pk_test_ or pk_live_ key).',
      );
      return;
    }
    const email = (authUser.email || '').trim();
    if (!email) {
      Alert.alert('Email required', 'Add an email to your account to pay with Paystack.');
      return;
    }

    setPayError(null);
    void (async () => {
      setPaying(true);
      try {
        const discoCode = disco.buypowerCode ?? disco.id;
        const init = await initializeElectricityPurchase({
          user_id: authUser.id,
          meter,
          disco: discoCode,
          amount: amtNum,
          phone: (authUser.phone) || '08000000000',
          name: authUser.name,
          email: authUser.email,
          vendType: 'PREPAID',
          paymentType: 'B2B',
          defer_payment_init: true,
        });
        const reference = init.data?.reference;
        if (!reference) {
          throw new Error('Server did not return payment reference');
        }
        setPayCheckout({
          reference,
          transactionId: init.data.transaction_id,
          email,
          metadata: {
            user_id: authUser.id,
            transaction_id: init.data.transaction_id,
            type: 'electricity',
            meter: String(meter).trim(),
          },
        });
        setShowPayModal(true);
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Could not start checkout';
        setPayError(msg);
      } finally {
        setPaying(false);
      }
    })();
  };

  const dismissPayModal = () => {
    setShowPayModal(false);
    setPayCheckout(null);
  };

  return (
    <View style={styles.page}>
      <ScreenHeader title="Buy Electricity" onBack={() => goTo('services')} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionLabel}>DISTRIBUTION COMPANY (DISCO)</Text>
        <Pressable onPress={() => setShowDiscoSheet(true)} style={[styles.discoSelect, disco ? { borderColor: '#C8D080' } : null]}>
          {disco ? (
            <>
              <View style={styles.discoBadge}>
                <Text style={styles.discoBadgeTxt}>{disco.id}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.discoName}>{disco.name}</Text>
                <Text style={styles.discoShort}>{disco.short}</Text>
              </View>
            </>
          ) : (
            <>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M13 2L4.09 12.6A1 1 0 0 0 5 14h7l-1 8 8.91-10.6A1 1 0 0 0 19 10h-7l1-8z"
                  stroke={grey}
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.discoPlaceholder}>Select your distribution company</Text>
            </>
          )}
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M6 9l6 6 6-6" stroke={grey} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>

        <Text style={styles.sectionLabel}>METER NUMBER</Text>
        <View style={styles.meterRow}>
          <View style={[styles.meterInputWrap, verified ? { borderColor: C.successBorder, backgroundColor: C.successBg } : null]}>
            <TextInput
              value={meter}
              onChangeText={v => {
                setMeter(v.replace(/\D/g, '').slice(0, 13));
                setVerified(null);
                setVerifyError(null);
              }}
              placeholder="Enter meter number"
              placeholderTextColor={C.placeholder}
              keyboardType="number-pad"
              style={styles.meterInput}
            />
            {verified ? (
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Circle cx={12} cy={12} r={10} fill={C.success} />
                <Path d="M8 12l3 3 5-5" stroke={C.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            ) : null}
          </View>
          <Pressable
            onPress={handleVerify}
            disabled={!disco || meter.length < 11 || verifying || !!verified}
            style={[
              styles.verifyBtn,
              verified ? { backgroundColor: C.successBg } : disco && meter.length >= 11 && !verifying ? null : { backgroundColor: C.disabled },
            ]}
          >
            {verifying ? (
              <ActivityIndicator color={grey} />
            ) : verified ? (
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path d="M5 12l5 5L20 7" stroke={C.success} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            ) : (
              <Text style={[styles.verifyBtnTxt, !(disco && meter.length >= 11) && { color: C.disabledTxt }]}>Verify</Text>
            )}
          </Pressable>
        </View>
        {verified ? (
          <View style={styles.verifiedBox}>
            <Text style={styles.verifiedName}>{verified.name}</Text>
            <Text style={styles.verifiedAddr}>{verified.address}</Text>
          </View>
        ) : null}
        {verifying ? (
          <View style={styles.verifyRow}>
            <ActivityIndicator size="small" color={grey} />
            <Text style={styles.verifyNote}>Verifying meter…</Text>
          </View>
        ) : null}
        {verifyError ? (
          <View style={styles.errBox}>
            <Text style={styles.errTxt}>{verifyError}</Text>
          </View>
        ) : null}
        {!disco ? <Text style={styles.hint}>Select a DisCo first before verifying meter</Text> : null}

        <Text style={styles.sectionLabel}>AMOUNT (₦{verified?.min ?? '500'} MINIMUM)</Text>
        <TextInput
          style={[styles.input, !verified && styles.inputDisabled]}
          editable={!!verified}
          placeholder="₦"
          placeholderTextColor={C.placeholder}
          keyboardType="number-pad"
          value={amount}
          onChangeText={v => setAmount(v.replace(/\D/g, ''))}
        />
        {!verified ? <Text style={styles.fieldHint}>Verify meter number first</Text> : null}

        <Pressable
          disabled={!canOpenPay || paying || showPayModal}
          onPress={openPayModal}
          style={[styles.payBtn, (!canOpenPay || paying || showPayModal) && styles.payBtnDis]}
        >
          {paying ? (
            <ActivityIndicator color={C.ink} />
          ) : (
            <Text style={styles.payBtnTxt}>
              {canOpenPay ? `Pay ₦${amtNum.toLocaleString()}` : 'Complete fields to continue'}
            </Text>
          )}
        </Pressable>
        {payError ? (
          <View style={styles.errBox}>
            <Text style={styles.errTxt}>{payError}</Text>
          </View>
        ) : null}
      </ScrollView>

      <Modal visible={showDiscoSheet} transparent animationType="slide" onRequestClose={() => setShowDiscoSheet(false)}>
        <Pressable style={styles.sheetOverlay} onPress={() => setShowDiscoSheet(false)}>
          <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
            <View style={styles.sheetGrab} />
            <View style={styles.sheetHead}>
              <View>
                <Text style={styles.sheetTitle}>Select DisCo</Text>
                <Text style={styles.sheetSub}>11 distribution companies available</Text>
              </View>
              <Pressable onPress={() => setShowDiscoSheet(false)} style={styles.sheetClose}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Path d="M18 6L6 18M6 6l12 12" stroke={grey} strokeWidth={2} strokeLinecap="round" />
                </Svg>
              </Pressable>
            </View>
            <ScrollView style={styles.sheetList}>
              {ELECTRICITY_DISCOS.map(d => {
                const sel = disco?.id === d.id;
                return (
                  <Pressable
                    key={d.id}
                    onPress={() => {
                      setDisco(d);
                      setShowDiscoSheet(false);
                      setMeter('');
                      setVerified(null);
                      setVerifyError(null);
                    }}
                    style={[styles.sheetRow, sel ? { borderColor: C.primary, backgroundColor: C.primFaint } : null]}
                  >
                    <View style={[styles.sheetDiscoIcon, sel ? { backgroundColor: C.primary } : { backgroundColor: C.primXlt }]}>
                      <Text style={[styles.sheetDiscoId, sel ? { color: C.ink } : { color: C.olive }]}>{d.id}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sheetDiscoName}>{d.name}</Text>
                      <Text style={styles.sheetDiscoShort}>{d.short}</Text>
                    </View>
                    {sel ? (
                      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
                          fill={C.primary}
                        />
                        <Path d="M8 12l3 3 5-5" stroke={C.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {payCheckout && disco ? (
        <Paystack
          visible={showPayModal}
          paystackKey={PAYSTACK_PUBLIC_KEY}
          amount={amtNum}
          billingEmail={payCheckout.email}
          reference={payCheckout.reference}
          metadata={payCheckout.metadata}
          onSuccess={async res => {
            const ref = res?.reference?.trim() ? res.reference : payCheckout.reference;
            setPaying(true);
            try {
              const done = await completeElectricityPurchase({ reference: ref });
              onPurchaseSuccess({
                meterToken: done.data?.meter_token ?? null,
                amount: amtNum,
                discoName: disco.name,
                meter,
              });
              onAddTx({
                id: String(Date.now()),
                type: 'electricity',
                title: `Electricity — ${disco.id}`,
                amount: `-₦${amtNum.toLocaleString()}`,
                pts: '+250 pts',
                date: 'Just now',
                status: 'Successful',
              });
            } catch (e) {
              const msg = e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Could not complete purchase';
              Alert.alert('Purchase failed', msg);
            } finally {
              setPaying(false);
            }
          }}
          onCancel={() => {
            dismissPayModal();
          }}
          onRequestClose={dismissPayModal}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.white },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 32, gap: 4 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: grey,
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  discoSelect: {
    height: 56,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  discoBadge: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: C.primXlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discoBadgeTxt: { fontSize: 9, fontWeight: '700', color: C.olive, textAlign: 'center' },
  discoName: { fontSize: 14, fontWeight: '600', color: C.ink },
  discoShort: { fontSize: 11, color: grey },
  discoPlaceholder: { flex: 1, fontSize: 14, color: C.placeholder },
  meterRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  meterInputWrap: {
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
  meterInput: { flex: 1, fontSize: 15, fontWeight: '500', color: C.ink },
  verifyBtn: {
    width: 80,
    height: 52,
    borderRadius: 10,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyBtnTxt: { fontSize: 13, fontWeight: '600', color: C.ink },
  verifiedBox: {
    marginTop: 8,
    backgroundColor: C.successBg,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: C.successBorder,
  },
  verifiedName: { fontSize: 13, fontWeight: '700', color: C.success },
  verifiedAddr: { fontSize: 11, color: C.success, opacity: 0.85, marginTop: 4 },
  verifyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  verifyNote: { fontSize: 12, color: grey },
  hint: { fontSize: 12, color: C.placeholder, marginTop: 6 },
  errBox: {
    marginTop: 8,
    backgroundColor: C.errorBg,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: C.errorBorder,
  },
  errTxt: { fontSize: 13, fontWeight: '500', color: C.error, textAlign: 'center' },
  input: {
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 14,
    fontSize: 15,
    color: C.ink,
    marginBottom: 4,
  },
  inputDisabled: { opacity: 0.55 },
  fieldHint: { fontSize: 12, color: grey, marginBottom: 8 },
  payBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  payBtnDis: { opacity: 0.45 },
  payBtnTxt: { fontSize: 16, fontWeight: '700', color: C.ink },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.52)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '78%',
  },
  sheetGrab: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0', marginTop: 10 },
  sheetHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: C.ink },
  sheetSub: { fontSize: 11, color: grey, marginTop: 2 },
  sheetClose: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.disabled,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetList: { paddingHorizontal: 16, paddingBottom: 28, paddingTop: 10 },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    marginBottom: 8,
  },
  sheetDiscoIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetDiscoId: { fontSize: 9, fontWeight: '700', textAlign: 'center', lineHeight: 12 },
  sheetDiscoName: { fontSize: 14, fontWeight: '600', color: C.ink },
  sheetDiscoShort: { fontSize: 11, color: grey },
});
