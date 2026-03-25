import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { PaymentPinModal, ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen } from '../types';

const grey = C.muted;
const MAX_PTS = 1850;

const CONTACTS = [
  { name: 'Mum', phone: '08034567890' },
  { name: 'Office', phone: '09012345678' },
  { name: 'Ahmed', phone: '07055443322' },
];

export function SharePointsScreen({ goTo }: { goTo: (s: AppScreen) => void }) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [pts, setPts] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [done, setDone] = useState(false);

  const ptsNum = parseInt(pts || '0', 10);
  const valid = phone.length === 11 && ptsNum >= 10 && ptsNum <= MAX_PTS;

  const handleSuccess = () => {
    setShowPin(false);
    setDone(true);
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
          <Text style={styles.doneTitle}>{pts} pts sent!</Text>
          <Text style={styles.doneSub}>
            Points transferred to{'\n'}
            <Text style={styles.doneStrong}>{name || phone}</Text>
          </Text>
        </View>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceBig}>{(MAX_PTS - ptsNum).toLocaleString()} pts</Text>
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
              1,850 <Text style={styles.heroPts}>pts</Text>
            </Text>
          </View>
          <View style={styles.heroPill}>
            <Text style={styles.heroPillTxt}>= ₦1,850</Text>
          </View>
        </View>

        <Text style={styles.secLbl}>Quick Select</Text>
        <View style={styles.quickRow}>
          {CONTACTS.map(c => {
            const sel = phone === c.phone;
            return (
              <Pressable key={c.phone} onPress={() => { setPhone(c.phone); setName(c.name); }} style={styles.quickItem}>
                <View style={styles.quickRingWrap}>
                  <View style={[styles.quickAvatar, sel && styles.quickAvatarOn]}>
                    <Text style={styles.quickAvatarTxt}>{c.name[0]}</Text>
                  </View>
                  {sel ? <View style={styles.quickRing} /> : null}
                </View>
                <Text style={[styles.quickLabel, sel && { color: C.olive, fontWeight: '600' }]}>{c.name}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.fieldLbl}>Recipient Phone Number</Text>
        <View style={styles.fieldWrap}>
          <TextInput
            style={styles.input}
            placeholder="08000000000"
            placeholderTextColor={C.placeholder}
            value={phone}
            onChangeText={v => setPhone(v.replace(/\D/g, '').slice(0, 11))}
            keyboardType="phone-pad"
          />
          {phone.length === 11 ? (
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
        <Text style={styles.hint}>11-digit Ahzarman registered number</Text>

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
          Min 10 pts · Max {MAX_PTS.toLocaleString()} pts
          {ptsNum > MAX_PTS ? <Text style={{ color: C.error }}> — Not enough points</Text> : null}
        </Text>
        {pts && ptsNum >= 10 && ptsNum <= MAX_PTS ? (
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

        <Pressable disabled={!valid} onPress={() => valid && setShowPin(true)} style={[styles.primaryBtn, !valid && styles.btnDisabled]}>
          <Text style={styles.primaryBtnTxt}>
            {valid ? `Send ${ptsNum.toLocaleString()} pts →` : 'Enter recipient and amount'}
          </Text>
        </Pressable>
      </ScrollView>

      <PaymentPinModal
        visible={showPin}
        amountLabel={`${ptsNum.toLocaleString()} pts`}
        onDismiss={() => setShowPin(false)}
        onConfirm={handleSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32, gap: 0 },
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
  secLbl: {
    fontSize: 11,
    fontWeight: '500',
    color: grey,
    marginBottom: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  quickRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  quickItem: { alignItems: 'center', gap: 5 },
  quickRingWrap: { position: 'relative' },
  quickAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAvatarOn: {},
  quickRing: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: C.primary,
  },
  quickAvatarTxt: { fontSize: 20, fontWeight: '700', color: C.ink },
  quickLabel: { fontSize: 11, color: grey },
  fieldLbl: { fontSize: 11, fontWeight: '500', color: grey, marginBottom: 6, letterSpacing: 0.3 },
  fieldWrap: { position: 'relative' },
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
  inputMulti: { height: 88, paddingTop: 12, textAlignVertical: 'top' },
  check: { position: 'absolute', right: 12, top: 16 },
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
});
