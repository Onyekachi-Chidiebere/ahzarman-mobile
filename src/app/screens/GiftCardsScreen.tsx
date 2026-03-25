import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { PaymentPinModal, ScreenHeader } from '../components';
import { C } from '../constants';
import { CARD_COLORS, GIFT_COUNTRIES, type GiftCountry } from '../giftCountries';
import type { AppScreen, Tx } from '../types';

const grey = C.muted;

export function GiftCardsScreen({
  goTo,
  onAddTx,
  onPurchaseComplete,
}: {
  goTo: (s: AppScreen) => void;
  onAddTx: (tx: Tx) => void;
  onPurchaseComplete: (pts: number) => void;
}) {
  const [country, setCountry] = useState<GiftCountry>(GIFT_COUNTRIES[0]);
  const [showSheet, setShowSheet] = useState(false);
  const [q, setQ] = useState('');
  const [card, setCard] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [showPin, setShowPin] = useState(false);

  const list = useMemo(
    () =>
      GIFT_COUNTRIES.filter(
        c =>
          c.name.toLowerCase().includes(q.toLowerCase()) ||
          c.currency.toLowerCase().includes(q.toLowerCase()),
      ),
    [q],
  );

  const canContinue = !!card && !!amount && !!email;

  const handleSuccess = () => {
    if (!card) return;
    onAddTx({
      id: String(Date.now()),
      type: 'giftcard',
      title: `${card} Gift Card`,
      amount: `-₦${parseInt(amount || '0', 10).toLocaleString()}`,
      pts: '+400 pts',
      date: 'Just now',
      status: 'Successful',
    });
    setShowPin(false);
    onPurchaseComplete(400);
  };

  return (
    <View style={styles.page}>
      <ScreenHeader title="Gift Cards" onBack={() => goTo('services')} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>COUNTRY</Text>
        <Pressable onPress={() => setShowSheet(true)} style={styles.countryRow}>
          <Text style={{ fontSize: 24 }}>{country.flag}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.cname}>{country.name}</Text>
            <Text style={styles.csub}>
              {country.currency} · {country.cards.length} cards
            </Text>
          </View>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M6 9l6 6 6-6" stroke={grey} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>

        <Text style={styles.label}>{country.name.toUpperCase()} CARDS</Text>
        <View style={styles.grid}>
          {country.cards.map(c => {
            const col = CARD_COLORS[c] ?? '#333';
            const sel = card === c;
            return (
              <Pressable
                key={c}
                onPress={() => setCard(c)}
                style={[
                  styles.cardCell,
                  {
                    backgroundColor: sel ? col : C.white,
                    borderColor: sel ? col : C.border,
                  },
                ]}
              >
                <Text style={[styles.cardLbl, { color: sel ? C.white : C.ink }]} numberOfLines={2}>
                  {c}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>AMOUNT</Text>
        <View style={styles.amtRow}>
          <Text style={styles.curr}>{country.currency}</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={C.placeholder}
            keyboardType="number-pad"
            value={amount}
            onChangeText={v => setAmount(v.replace(/\D/g, ''))}
          />
        </View>

        <Text style={styles.label}>RECIPIENT EMAIL</Text>
        <TextInput
          style={styles.inputFull}
          placeholder="name@email.com"
          placeholderTextColor={C.placeholder}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Pressable disabled={!canContinue} onPress={() => canContinue && setShowPin(true)} style={[styles.btn, !canContinue && styles.btnDis]}>
          <Text style={styles.btnTxt}>
            {canContinue ? `Buy ${card} — ${country.currency} ${amount}` : 'Complete all fields'}
          </Text>
        </Pressable>
      </ScrollView>

      <Modal visible={showSheet} transparent animationType="slide" onRequestClose={() => setShowSheet(false)}>
        <Pressable style={styles.sheetBg} onPress={() => setShowSheet(false)}>
          <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
            <View style={styles.grab} />
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle}>Select Country</Text>
              <Pressable onPress={() => setShowSheet(false)} style={styles.closeBtn}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Path d="M18 6L6 18M6 6l12 12" stroke={grey} strokeWidth={2} strokeLinecap="round" />
                </Svg>
              </Pressable>
            </View>
            <TextInput
              style={styles.search}
              placeholder="Search countries…"
              placeholderTextColor={C.placeholder}
              value={q}
              onChangeText={setQ}
            />
            <ScrollView>
              {list.map(c => {
                const sel = country.code === c.code;
                return (
                  <Pressable
                    key={c.code}
                    onPress={() => {
                      setCountry(c);
                      setCard(null);
                      setShowSheet(false);
                    }}
                    style={[styles.sheetItem, sel && { backgroundColor: C.primFaint }]}
                  >
                    <Text style={{ fontSize: 26 }}>{c.flag}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sheetName}>{c.name}</Text>
                      <Text style={styles.sheetMeta}>
                        {c.currency} · {c.cards.length} cards
                      </Text>
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
        amountLabel={`${country.currency} ${amount}`}
        onDismiss={() => setShowPin(false)}
        onConfirm={handleSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32 },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: grey,
    marginBottom: 8,
    marginTop: 12,
    letterSpacing: 0.4,
  },
  countryRow: {
    height: 56,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C8D080',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    backgroundColor: C.white,
  },
  cname: { fontSize: 15, fontWeight: '600', color: C.ink },
  csub: { fontSize: 11, color: grey, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cardCell: {
    width: '31%',
    height: 64,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cardLbl: { fontSize: 11, fontWeight: '700', textAlign: 'center', lineHeight: 14 },
  amtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 12,
    backgroundColor: C.white,
  },
  curr: { fontSize: 14, fontWeight: '600', marginRight: 8, color: C.ink },
  input: { flex: 1, fontSize: 15, color: C.ink },
  inputFull: {
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 14,
    fontSize: 15,
    color: C.ink,
    backgroundColor: C.white,
  },
  btn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  btnDis: { opacity: 0.45 },
  btnTxt: { fontSize: 16, fontWeight: '700', color: C.ink },
  sheetBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.52)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '72%',
    paddingBottom: 24,
  },
  grab: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0', marginTop: 10 },
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
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.disabled,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    marginHorizontal: 16,
    marginVertical: 10,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F5F6F1',
    paddingHorizontal: 12,
    fontSize: 14,
    color: C.ink,
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  sheetName: { fontSize: 15, color: C.ink },
  sheetMeta: { fontSize: 11, color: grey, marginTop: 2 },
});
