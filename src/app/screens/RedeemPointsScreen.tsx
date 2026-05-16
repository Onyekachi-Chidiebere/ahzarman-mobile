import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import { NumPad } from '../NumPad';
import type { AppScreen } from '../types';

const grey = C.muted;

export function RedeemPointsScreen({
  goTo,
  userPoints,
  onSpendPoints,
}: {
  goTo: (s: AppScreen) => void;
  userPoints: number;
  onSpendPoints: (title: string, amount: number) => void;
}) {
  const [meter, setMeter] = useState('');
  const [pts, setPts] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [pinErr, setPinErr] = useState('');
  const [done, setDone] = useState(false);

  const ptsNum = parseInt(pts || '0', 10);
  const nairaVal = ptsNum;
  const valid = meter.length >= 11 && ptsNum >= 100 && ptsNum <= userPoints;

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setPinErr('');
    if (next.length === 4) {
      if (next === '1234') {
        setTimeout(() => {
          onSpendPoints(`Redeemed for electricity — ${meter}`, ptsNum);
          setShowPin(false);
          setDone(true);
          setPin('');
        }, 400);
      } else {
        setTimeout(() => {
          setPinErr('Incorrect PIN. Try again.');
          setPin('');
        }, 600);
      }
    }
  };

  const openPin = () => {
    if (!valid) return;
    setPin('');
    setPinErr('');
    setShowPin(true);
  };

  if (done) {
    return (
      <View style={styles.donePage}>
        <View style={styles.doneIcon}>
          <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
            <Path
              d="M13 2L4.09 12.6A1 1 0 0 0 5 14h7l-1 8 8.91-10.6A1 1 0 0 0 19 10h-7l1-8z"
              stroke={C.olive}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.doneTitle}>Redeemed!</Text>
          <Text style={styles.doneSub}>
            ₦{nairaVal.toLocaleString()} electricity credit{'\n'}sent to meter{' '}
            <Text style={styles.doneStrong}>
              {meter.slice(0, 4)}****{meter.slice(-3)}
            </Text>
          </Text>
        </View>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceBig}>{(userPoints - ptsNum).toLocaleString()} pts</Text>
          <Text style={styles.balanceLbl}>Your remaining balance</Text>
        </View>
        <Pressable onPress={() => goTo('home')} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnTxt}>Back to Home</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <ScreenHeader title="Redeem Points" onBack={() => goTo('home')} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.heroBal}>
          <View>
            <Text style={styles.heroLbl}>Points balance</Text>
            <Text style={styles.heroAmt}>
              {userPoints.toLocaleString()} <Text style={styles.heroPts}>pts</Text>
            </Text>
          </View>
          <View style={styles.heroPill}>
            <Text style={styles.heroPillTxt}>= ₦{userPoints.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.convCard}>
          <Text style={styles.convTitle}>Conversion Rate</Text>
          <Text style={styles.convRate}>1 pt = ₦1 electricity</Text>
          <Text style={styles.convHint}>Min redemption: 100 pts</Text>
        </View>

        <Text style={styles.fieldLbl}>Meter Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your prepaid meter number"
          placeholderTextColor={C.placeholder}
          value={meter}
          onChangeText={v => setMeter(v.replace(/\D/g, '').slice(0, 13))}
          keyboardType="number-pad"
        />
        <Text style={styles.hint}>Enter your prepaid meter number</Text>

        <Text style={styles.fieldLbl}>Points to Redeem</Text>
        <TextInput
          style={styles.input}
          placeholder="0"
          placeholderTextColor={C.placeholder}
          value={pts}
          onChangeText={v => setPts(v.replace(/\D/g, ''))}
          keyboardType="number-pad"
        />
        <Text style={styles.hint}>
          Min 100 pts · Max {userPoints.toLocaleString()} pts
          {ptsNum > userPoints ? <Text style={{ color: C.error }}> — Insufficient balance</Text> : null}
        </Text>

        {ptsNum >= 100 && ptsNum <= userPoints ? (
          <View style={styles.previewBox}>
            <Text style={styles.previewTxt}>
              You will receive <Text style={{ fontWeight: '700' }}>₦{nairaVal.toLocaleString()}</Text> electricity
              credit on your meter
            </Text>
          </View>
        ) : null}

        <Pressable disabled={!valid} onPress={openPin} style={[styles.primaryBtn, !valid && styles.btnDisabled]}>
          <Text style={styles.primaryBtnTxt}>
            {valid
              ? `Redeem ${ptsNum.toLocaleString()} pts for ₦${nairaVal.toLocaleString()}`
              : 'Complete fields to continue'}
          </Text>
        </Pressable>
        <Text style={styles.demoHint}>
          Demo PIN: <Text style={{ fontWeight: '700', color: C.ink }}>1234</Text>
        </Text>
      </ScrollView>

      <Modal visible={showPin} transparent animationType="slide" onRequestClose={() => { setShowPin(false); setPin(''); setPinErr(''); }}>
        <Pressable style={styles.pinOverlay} onPress={() => { setShowPin(false); setPin(''); setPinErr(''); }}>
          <Pressable style={styles.pinSheet} onPress={e => e.stopPropagation()}>
            <View style={styles.grabber} />
            <Text style={styles.pinTitle}>Confirm with PIN</Text>
            <Text style={styles.pinSub}>
              Redeem <Text style={{ color: C.olive, fontWeight: '700' }}>{ptsNum.toLocaleString()} pts</Text> → ₦
              {nairaVal.toLocaleString()} electricity
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
            {pinErr ? (
              <View style={styles.errBox}>
                <Text style={styles.errTxt}>{pinErr}</Text>
              </View>
            ) : null}
            <NumPad onDigit={handleDigit} onDelete={() => { setPin(p => p.slice(0, -1)); setPinErr(''); }} />
            <Pressable
              onPress={() => {
                setShowPin(false);
                setPin('');
                setPinErr('');
              }}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelTxt}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32 },
  donePage: {
    flex: 1,
    backgroundColor: C.white,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  doneIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.primXlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneTitle: { fontSize: 20, fontWeight: '700', color: C.ink, marginBottom: 8, textAlign: 'center' },
  doneSub: { fontSize: 14, color: grey, lineHeight: 22, textAlign: 'center' },
  doneStrong: { color: C.ink, fontWeight: '700' },
  balanceCard: {
    width: '100%',
    backgroundColor: C.primFaint,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: C.primXlt,
    alignItems: 'center',
  },
  balanceBig: { fontSize: 24, fontWeight: '700', color: C.olive },
  balanceLbl: { fontSize: 12, color: C.olive, marginTop: 2 },
  heroBal: {
    backgroundColor: C.ink,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroLbl: { fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 4 },
  heroAmt: { fontSize: 28, fontWeight: '700', color: C.white },
  heroPts: { fontSize: 16, opacity: 0.5, fontWeight: '400' },
  heroPill: { backgroundColor: `${C.primary}22`, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 },
  heroPillTxt: { fontSize: 14, fontWeight: '700', color: C.primLt },
  convCard: {
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 16,
  },
  convTitle: { fontSize: 13, fontWeight: '600', color: C.ink, marginBottom: 8 },
  convRate: { fontSize: 22, fontWeight: '700', color: C.primary },
  convHint: { fontSize: 12, color: grey, marginTop: 4 },
  fieldLbl: { fontSize: 11, fontWeight: '500', color: grey, marginBottom: 6 },
  input: {
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
    paddingHorizontal: 14,
    fontSize: 14,
    color: C.ink,
    marginBottom: 4,
  },
  hint: { fontSize: 11, color: grey, marginBottom: 12 },
  previewBox: {
    backgroundColor: C.primFaint,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: C.primXlt,
    marginBottom: 16,
  },
  previewTxt: { fontSize: 13, color: C.olive, lineHeight: 20 },
  primaryBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.5 },
  primaryBtnTxt: { color: C.ink, fontSize: 15, fontWeight: '700' },
  demoHint: { textAlign: 'center', fontSize: 11, color: C.placeholder, marginTop: 12 },
  pinOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  pinSheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  grabber: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0', alignSelf: 'center', marginBottom: 16 },
  pinTitle: { fontSize: 17, fontWeight: '700', color: C.ink, textAlign: 'center' },
  pinSub: { fontSize: 13, color: grey, textAlign: 'center', marginTop: 4, lineHeight: 20 },
  dots: { flexDirection: 'row', gap: 16, justifyContent: 'center', marginVertical: 20 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  errBox: {
    backgroundColor: C.errorBg,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: C.errorBorder,
    marginBottom: 8,
  },
  errTxt: { fontSize: 13, fontWeight: '500', color: C.error, textAlign: 'center' },
  cancelBtn: { marginTop: 8, paddingVertical: 12, alignItems: 'center' },
  cancelTxt: { fontSize: 14, fontWeight: '500', color: grey },
});
