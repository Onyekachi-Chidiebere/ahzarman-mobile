import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { PaymentPinModal, ScreenHeader } from '../components';
import { C } from '../constants';
import type { Disco } from '../discos';
import { ELECTRICITY_DISCOS } from '../discos';
import type { AppScreen, Tx } from '../types';

const grey = C.muted;

export function ElectricityScreen({
  goTo,
  onAddTx,
}: {
  goTo: (s: AppScreen) => void;
  onAddTx: (tx: Tx) => void;
}) {
  const [disco, setDisco] = useState<Disco | null>(null);
  const [showDiscoSheet, setShowDiscoSheet] = useState(false);
  const [meter, setMeter] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState<{ name: string; address: string } | null>(null);
  const [amount, setAmount] = useState('');
  const [showPin, setShowPin] = useState(false);

  const handleVerify = () => {
    if (!disco || meter.length < 11) return;
    setVerifying(true);
    setVerified(null);
    setTimeout(() => {
      setVerifying(false);
      setVerified({ name: 'MERCY OKAFOR', address: 'Plot 3, Lugbe Extension, Abuja' });
    }, 2000);
  };

  const handleSuccess = () => {
    const amt = parseInt(amount || '0', 10);
    onAddTx({
      id: String(Date.now()),
      type: 'electricity',
      title: `Electricity — ${disco?.id ?? ''}`,
      amount: `-₦${amt.toLocaleString()}`,
      pts: '+250 pts',
      date: 'Just now',
      status: 'Successful',
    });
    setShowPin(false);
    goTo('elec_success');
  };

  const amtNum = parseInt(amount || '0', 10);
  const canPay = verified && amtNum >= 500;

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
        {!disco ? <Text style={styles.hint}>Select a DisCo first before verifying meter</Text> : null}

        <Text style={styles.sectionLabel}>AMOUNT (₦500 MINIMUM)</Text>
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

        <Pressable disabled={!canPay} onPress={() => canPay && setShowPin(true)} style={[styles.payBtn, !canPay && styles.payBtnDis]}>
          <Text style={styles.payBtnTxt}>
            {canPay ? `Pay ₦${amtNum.toLocaleString()}` : 'Complete fields to continue'}
          </Text>
        </Pressable>
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

      <PaymentPinModal
        visible={showPin}
        amountLabel={`₦${amtNum.toLocaleString()}`}
        onDismiss={() => setShowPin(false)}
        onConfirm={handleSuccess}
      />
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
