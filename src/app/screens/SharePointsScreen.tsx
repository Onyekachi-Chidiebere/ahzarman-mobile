import { useCallback, useEffect, useState } from 'react';
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
import { apiErrorMessage } from '../api/client';
import { lookupRecipientByPhone, sharePoints } from '../api/pointsShare';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import { NumPad } from '../NumPad';
import type { AppScreen } from '../types';

const grey = C.muted;

export function SharePointsScreen({
  goTo,
  userPoints,
  authToken,
  onShareSuccess,
}: {
  goTo: (s: AppScreen) => void;
  userPoints: number;
  authToken: string | null;
  onShareSuccess: () => void | Promise<void>;
}) {
  const [phone, setPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [lookupOk, setLookupOk] = useState(false);
  const [lookupErr, setLookupErr] = useState<string | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [note, setNote] = useState('');
  const [pts, setPts] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [pinErr, setPinErr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [remainingPts, setRemainingPts] = useState(0);
  const [sentPts, setSentPts] = useState(0);
  const [sentTo, setSentTo] = useState('');

  const ptsNum = parseInt(pts || '0', 10);
  const valid = lookupOk && phone.length === 11 && ptsNum >= 10 && ptsNum <= userPoints;

  const runLookup = useCallback(
    async (phoneInput: string) => {
      if (phoneInput.length !== 11) {
        setLookupOk(false);
        setRecipientName('');
        setLookupErr(null);
        return;
      }
      if (!authToken) {
        setLookupErr('Sign in to send points.');
        setLookupOk(false);
        return;
      }
      setLookupLoading(true);
      setLookupErr(null);
      setLookupOk(false);
      try {
        const res = await lookupRecipientByPhone(authToken, phoneInput);
        if (res.data?.registered && res.data.name) {
          setRecipientName(res.data.name);
          setLookupOk(true);
        } else {
          setLookupErr('This number is not registered on Ahzarman');
        }
      } catch (e) {
        setLookupErr(apiErrorMessage(e, 'Could not verify recipient'));
        setRecipientName('');
      } finally {
        setLookupLoading(false);
      }
    },
    [authToken],
  );

  useEffect(() => {
    const t = setTimeout(() => {
      if (phone.length === 11) void runLookup(phone);
      else {
        setLookupOk(false);
        setRecipientName('');
        setLookupErr(null);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [phone, runLookup]);

  const submitShare = async (pinValue: string) => {
    if (!valid || !authToken) return;
    setSubmitting(true);
    setPinErr('');
    try {
      const result = await sharePoints(authToken, {
        recipient_phone: phone,
        points: ptsNum,
        pin: pinValue,
        note: note.trim() || undefined,
      });
      setSentPts(result.points_sent);
      setRemainingPts(result.remaining_points);
      setSentTo(result.recipient.name || recipientName || phone);
      await onShareSuccess();
      setShowPin(false);
      setPin('');
      setDone(true);
    } catch (e) {
      setPinErr(apiErrorMessage(e, 'Could not send points'));
      setPin('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDigit = (d: string) => {
    if (submitting || pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setPinErr('');
    if (next.length === 4) void submitShare(next);
  };

  const openPin = () => {
    if (!valid) return;
    if (!authToken) {
      Alert.alert('Sign in required', 'Please sign in to share points.');
      return;
    }
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
              d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"
              stroke={C.olive}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.doneTitle}>{sentPts.toLocaleString()} pts sent!</Text>
          <Text style={styles.doneSub}>
            Points transferred to{'\n'}
            <Text style={styles.doneStrong}>{sentTo}</Text>
          </Text>
        </View>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceBig}>{remainingPts.toLocaleString()} pts</Text>
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
      <ScreenHeader title="Share Points" onBack={() => goTo('home')} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.heroBal}>
          <View>
            <Text style={styles.heroLbl}>Available to share</Text>
            <Text style={styles.heroAmt}>
              {userPoints.toLocaleString()} <Text style={styles.heroPts}>pts</Text>
            </Text>
          </View>
          <View style={styles.heroPill}>
            <Text style={styles.heroPillTxt}>= ₦{userPoints.toLocaleString()}</Text>
          </View>
        </View>

        <Text style={styles.fieldLbl}>Recipient Phone Number</Text>
        <View style={styles.fieldWrap}>
          <TextInput
            style={[styles.input, lookupOk ? { borderColor: C.successBorder } : null]}
            placeholder="08000000000"
            placeholderTextColor={C.placeholder}
            value={phone}
            onChangeText={v => setPhone(v.replace(/\D/g, '').slice(0, 11))}
            keyboardType="phone-pad"
          />
          {lookupLoading ? (
            <View style={styles.check}>
              <ActivityIndicator size="small" color={grey} />
            </View>
          ) : lookupOk ? (
            <View style={styles.check}>
              <Svg width={16} height={16} viewBox="0 0 24 24">
                <Circle cx={12} cy={12} r={10} fill={C.success} />
                <Path
                  d="M8 12l3 3 5-5"
                  stroke={C.white}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          ) : null}
        </View>
        {lookupOk && recipientName ? (
          <Text style={styles.recipientOk}>Registered: {recipientName}</Text>
        ) : null}
        {lookupErr ? <Text style={styles.lookupErr}>{lookupErr}</Text> : null}
        <Text style={styles.hint}>11-digit number registered on Ahzarman</Text>

        <Text style={styles.fieldLbl}>Points to Send</Text>
        <TextInput
          style={styles.input}
          placeholder="0"
          placeholderTextColor={C.placeholder}
          value={pts}
          onChangeText={v => setPts(v.replace(/\D/g, ''))}
          keyboardType="number-pad"
        />
        <Text style={styles.hint}>
          Min 10 pts · Max {userPoints.toLocaleString()} pts
          {ptsNum > userPoints ? <Text style={{ color: C.error }}> — Not enough points</Text> : null}
        </Text>
        {pts && ptsNum >= 10 && ptsNum <= userPoints ? (
          <View style={styles.convBox}>
            <Text style={styles.convTxt}>= ₦{ptsNum.toLocaleString()} electricity credit for recipient</Text>
          </View>
        ) : null}

        <Text style={styles.fieldLbl}>Add a note (optional)</Text>
        <TextInput
          style={[styles.input, styles.inputMulti]}
          placeholder="e.g. For your light bill this month"
          placeholderTextColor={C.placeholder}
          value={note}
          onChangeText={setNote}
          multiline
        />

        <Pressable
          disabled={!valid || submitting}
          onPress={openPin}
          style={[styles.primaryBtn, (!valid || submitting) && styles.btnDisabled]}
        >
          {submitting ? (
            <ActivityIndicator color={C.ink} />
          ) : (
            <Text style={styles.primaryBtnTxt}>
              {valid ? `Send ${ptsNum.toLocaleString()} pts →` : 'Enter recipient and amount'}
            </Text>
          )}
        </Pressable>
        <Text style={styles.pinHint}>Confirm with your 4-digit login PIN</Text>
      </ScrollView>

      <Modal
        visible={showPin}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!submitting) {
            setShowPin(false);
            setPin('');
            setPinErr('');
          }
        }}
      >
        <Pressable
          style={styles.pinOverlay}
          onPress={() => {
            if (!submitting) {
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
              Send <Text style={{ color: C.olive, fontWeight: '700' }}>{ptsNum.toLocaleString()} pts</Text> to{' '}
              {recipientName || phone}
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
            {submitting ? <ActivityIndicator color={C.primary} style={{ marginBottom: 8 }} /> : null}
            {pinErr ? (
              <View style={styles.errBox}>
                <Text style={styles.errTxt}>{pinErr}</Text>
              </View>
            ) : null}
            <NumPad
              onDigit={handleDigit}
              onDelete={() => {
                if (!submitting) {
                  setPin(p => p.slice(0, -1));
                  setPinErr('');
                }
              }}
            />
            <Pressable
              onPress={() => {
                if (!submitting) {
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
  fieldLbl: { fontSize: 11, fontWeight: '500', color: grey, marginBottom: 6, letterSpacing: 0.3 },
  fieldWrap: { position: 'relative', marginBottom: 4 },
  input: {
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
    paddingHorizontal: 14,
    fontSize: 14,
    color: C.ink,
  },
  inputMulti: { height: 88, paddingTop: 12, textAlignVertical: 'top', marginBottom: 4 },
  check: { position: 'absolute', right: 12, top: 16 },
  recipientOk: { fontSize: 12, fontWeight: '600', color: C.success, marginBottom: 4 },
  lookupErr: { fontSize: 12, color: C.error, marginBottom: 4 },
  hint: { fontSize: 11, color: grey, marginTop: 6, marginBottom: 12 },
  convBox: {
    backgroundColor: C.primFaint,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: C.primXlt,
    marginBottom: 12,
  },
  convTxt: { fontSize: 12, color: C.olive },
  primaryBtn: {
    marginTop: 8,
    height: 50,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  primaryBtnTxt: { color: C.ink, fontSize: 16, fontWeight: '700' },
  pinHint: { textAlign: 'center', fontSize: 11, color: C.placeholder, marginTop: 12 },
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
