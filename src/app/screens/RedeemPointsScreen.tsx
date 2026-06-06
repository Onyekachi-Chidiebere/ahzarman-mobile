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
import Svg, { Path } from 'react-native-svg';
import type { AuthUser } from '../api/auth';
import { apiErrorMessage } from '../api/client';
import { redeemPointsForElectricity } from '../api/pointsRedeem';
import {
  getSavedMeters,
  maskMeterNumber,
  type SavedMeter,
} from '../api/savedMeters';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { Disco } from '../discos';
import { ELECTRICITY_DISCOS } from '../discos';
import { NumPad } from '../NumPad';
import type { AppScreen } from '../types';

const grey = C.muted;

function findDiscoById(discoId: string): Disco | null {
  return ELECTRICITY_DISCOS.find(d => d.id === discoId) ?? null;
}

export function RedeemPointsScreen({
  goTo,
  userPoints,
  authUser,
  authToken,
  onRedeemSuccess,
}: {
  goTo: (s: AppScreen) => void;
  userPoints: number;
  authUser: AuthUser | null;
  authToken: string | null;
  onRedeemSuccess: () => void | Promise<void>;
}) {
  const [meter, setMeter] = useState('');
  const [disco, setDisco] = useState<Disco | null>(null);
  const [discoCode, setDiscoCode] = useState('');
  const [pts, setPts] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [pinErr, setPinErr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [remainingPts, setRemainingPts] = useState(0);
  const [savedMeters, setSavedMeters] = useState<SavedMeter[]>([]);
  const [loadingSavedMeters, setLoadingSavedMeters] = useState(false);
  const [selectedSavedMeterId, setSelectedSavedMeterId] = useState<string | null>(null);
  const [showDiscoSheet, setShowDiscoSheet] = useState(false);

  const loadSavedMeters = useCallback(async () => {
    if (!authUser?.id || !authToken) {
      setSavedMeters([]);
      return;
    }
    setLoadingSavedMeters(true);
    try {
      const list = await getSavedMeters(authUser.id, authToken);
      setSavedMeters(list);
    } catch {
      // Non-blocking
    } finally {
      setLoadingSavedMeters(false);
    }
  }, [authUser?.id, authToken]);

  useEffect(() => {
    void loadSavedMeters();
  }, [loadSavedMeters]);

  const ptsNum = parseInt(pts || '0', 10);
  const nairaVal = ptsNum;
  const hasDisco = !!disco && !!discoCode;
  const valid =
    !!authUser &&
    meter.length >= 11 &&
    hasDisco &&
    ptsNum >= 100 &&
    ptsNum <= userPoints;

  const applySavedMeter = (saved: SavedMeter) => {
    const matchedDisco = findDiscoById(saved.disco_id);
    if (!matchedDisco) {
      Alert.alert('DisCo unavailable', 'This saved meter uses a distribution company that is no longer listed.');
      return;
    }
    setDisco(matchedDisco);
    setDiscoCode(saved.disco);
    setMeter(saved.meter);
    setSelectedSavedMeterId(saved.id);
  };

  const clearMeterSelection = () => {
    setMeter('');
    setDisco(null);
    setDiscoCode('');
    setSelectedSavedMeterId(null);
  };

  const submitRedemption = async (pinValue: string) => {
    if (!authUser || !valid) return;
    setSubmitting(true);
    setPinErr('');
    try {
      const result = await redeemPointsForElectricity(authToken, {
        meter,
        disco: discoCode,
        disco_id: disco?.id,
        points: ptsNum,
        pin: pinValue,
      });
      setRemainingPts(result.remaining_points);
      await onRedeemSuccess();
      setShowPin(false);
      setPin('');
      setDone(true);
    } catch (e) {
      setPinErr(apiErrorMessage(e, 'Redemption failed'));
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
    if (next.length === 4) {
      void submitRedemption(next);
    }
  };

  const openPin = () => {
    if (!valid) return;
    if (!authUser) {
      Alert.alert('Sign in required', 'Please sign in to redeem points.');
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

        {authUser && savedMeters.length > 0 ? (
          <View style={styles.savedSection}>
            <View style={styles.savedHead}>
              <Text style={styles.fieldLbl}>Saved meters</Text>
              {selectedSavedMeterId ? (
                <Pressable onPress={clearMeterSelection} hitSlop={8}>
                  <Text style={styles.useNewTxt}>Use new meter</Text>
                </Pressable>
              ) : null}
            </View>
            {loadingSavedMeters ? (
              <ActivityIndicator size="small" color={grey} style={{ marginBottom: 8 }} />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.savedRow}>
                {savedMeters.map(saved => {
                  const sel = selectedSavedMeterId === saved.id;
                  return (
                    <Pressable
                      key={saved.id}
                      onPress={() => applySavedMeter(saved)}
                      style={[styles.savedChip, sel ? styles.savedChipSel : null]}
                    >
                      <Text style={[styles.savedName, sel && { color: C.olive }]} numberOfLines={1}>
                        {saved.customer_name}
                      </Text>
                      <Text style={styles.savedMeta} numberOfLines={1}>
                        {saved.disco_id} · {maskMeterNumber(saved.meter)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </View>
        ) : null}

        {!selectedSavedMeterId ? (
          <>
            <Text style={styles.fieldLbl}>Distribution company</Text>
            <Pressable
              onPress={() => setShowDiscoSheet(true)}
              style={[styles.discoSelect, disco ? { borderColor: '#C8D080' } : null]}
            >
              {disco ? (
                <>
                  <View style={styles.discoBadge}>
                    <Text style={styles.discoBadgeTxt}>{disco.id}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.discoName}>{disco.name}</Text>
                  </View>
                </>
              ) : (
                <Text style={styles.discoPlaceholder}>Select your distribution company</Text>
              )}
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M6 9l6 6 6-6" stroke={grey} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Pressable>
          </>
        ) : disco ? (
          <View style={styles.selectedDiscoBox}>
            <Text style={styles.selectedDiscoLbl}>DisCo</Text>
            <Text style={styles.selectedDiscoVal}>{disco.name}</Text>
          </View>
        ) : null}

        <Text style={styles.fieldLbl}>Meter Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your prepaid meter number"
          placeholderTextColor={C.placeholder}
          value={meter}
          onChangeText={v => {
            setMeter(v.replace(/\D/g, '').slice(0, 13));
            setSelectedSavedMeterId(null);
            if (selectedSavedMeterId) {
              setDisco(null);
              setDiscoCode('');
            }
          }}
          keyboardType="number-pad"
          editable={!selectedSavedMeterId}
        />
        <Text style={styles.hint}>
          {selectedSavedMeterId ? 'Using a saved meter' : 'Select a saved meter or enter details manually'}
        </Text>

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

        <Pressable
          disabled={!valid || submitting}
          onPress={openPin}
          style={[styles.primaryBtn, (!valid || submitting) && styles.btnDisabled]}
        >
          {submitting ? (
            <ActivityIndicator color={C.ink} />
          ) : (
            <Text style={styles.primaryBtnTxt}>
              {valid
                ? `Redeem ${ptsNum.toLocaleString()} pts for ₦${nairaVal.toLocaleString()}`
                : 'Complete fields to continue'}
            </Text>
          )}
        </Pressable>
        <Text style={styles.pinHint}>Confirm with your 4-digit login PIN</Text>
      </ScrollView>

      <Modal
        visible={showDiscoSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDiscoSheet(false)}
      >
        <Pressable style={styles.sheetOverlay} onPress={() => setShowDiscoSheet(false)}>
          <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
            <View style={styles.sheetGrab} />
            <Text style={styles.sheetTitle}>Select DisCo</Text>
            <ScrollView style={styles.sheetList}>
              {ELECTRICITY_DISCOS.map(d => (
                <Pressable
                  key={d.id}
                  onPress={() => {
                    setDisco(d);
                    setDiscoCode(d.buypowerCode ?? d.id);
                    setShowDiscoSheet(false);
                    setSelectedSavedMeterId(null);
                  }}
                  style={[styles.sheetRow, disco?.id === d.id ? styles.sheetRowSel : null]}
                >
                  <Text style={styles.sheetDiscoId}>{d.id}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sheetDiscoName}>{d.name}</Text>
                    <Text style={styles.sheetDiscoShort}>{d.short}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

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
  savedSection: { marginBottom: 12 },
  savedHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  useNewTxt: { fontSize: 12, fontWeight: '600', color: C.olive },
  savedRow: { gap: 8, paddingBottom: 4 },
  savedChip: {
    minWidth: 120,
    maxWidth: 160,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  savedChipSel: { borderColor: C.primary, backgroundColor: C.primFaint },
  savedName: { fontSize: 13, fontWeight: '600', color: C.ink },
  savedMeta: { fontSize: 10, color: grey, marginTop: 2 },
  discoSelect: {
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    backgroundColor: C.white,
    marginBottom: 12,
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
  discoPlaceholder: { flex: 1, fontSize: 14, color: C.placeholder },
  selectedDiscoBox: {
    backgroundColor: C.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
    marginBottom: 12,
  },
  selectedDiscoLbl: { fontSize: 11, color: grey, marginBottom: 2 },
  selectedDiscoVal: { fontSize: 14, fontWeight: '600', color: C.ink },
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
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.52)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 24,
  },
  sheetGrab: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    marginTop: 10,
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.ink,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sheetList: { paddingHorizontal: 16 },
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
  sheetRowSel: { borderColor: C.primary, backgroundColor: C.primFaint },
  sheetDiscoId: { fontSize: 10, fontWeight: '700', color: C.olive, width: 52 },
  sheetDiscoName: { fontSize: 14, fontWeight: '600', color: C.ink },
  sheetDiscoShort: { fontSize: 11, color: grey },
});
