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
import type { AuthUser } from '../api/auth';
import { ApiError } from '../api/client';
import { completePointsPurchase, initializePointsPurchase } from '../api/pointsPurchase';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen, Tx } from '../types';
import { Paystack } from './ElectricityPaystackModal';

const grey = C.muted;
const PRESETS = [500, 1000, 2000, 5000, 10000];

export function BuyPointsScreen({
  goTo,
  authUser,
  userPoints,
  onAddTx,
  onPurchaseComplete,
}: {
  goTo: (s: AppScreen) => void;
  authUser: AuthUser | null;
  userPoints: number;
  onAddTx: (tx: Tx) => void;
  onPurchaseComplete: (pointsEarned: number) => void;
}) {
  const [selAmt, setSelAmt] = useState<number | null>(0);
  const [customAmt, setCustomAmt] = useState('');
  const [paying, setPaying] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payCheckout, setPayCheckout] = useState<{
    reference: string;
    email: string;
    checkoutUrl: string;
    points: number;
  } | null>(null);

  const finalAmt =
    selAmt !== null ? PRESETS[selAmt] : Math.min(500000, Math.max(0, parseInt(customAmt || '0', 10) || 0));
  const canContinue = finalAmt >= 500;

  const dismissPayModal = () => {
    setShowPayModal(false);
    setPayCheckout(null);
  };

  const startCheckout = () => {
    if (!canContinue) return;
    if (!authUser) {
      Alert.alert('Sign in required', 'Please sign in to buy points.');
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
        const init = await initializePointsPurchase({
          user_id: authUser.id,
          amount: finalAmt,
          email: authUser.email,
          name: authUser.name,
        });
        const reference = init.data?.reference;
        const checkoutUrl = init.data?.authorization_url?.trim() || '';
        if (!reference) throw new Error('Server did not return payment reference');
        if (!checkoutUrl) throw new Error('Server did not return TransactPay checkout URL');
        setPayCheckout({
          reference,
          email,
          checkoutUrl,
          points: init.data.points_credited || finalAmt,
        });
        setShowPayModal(true);
      } catch (e) {
        Alert.alert(
          'Checkout failed',
          e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Could not start checkout',
        );
      } finally {
        setPaying(false);
      }
    })();
  };

  return (
    <View style={styles.page}>
      <ScreenHeader title="Buy Points" onBack={() => goTo('rewards')} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <Text style={styles.heroLbl}>CURRENT BALANCE</Text>
          <Text style={styles.heroBig}>
            {userPoints.toLocaleString()} <Text style={styles.heroPts}>pts</Text>
          </Text>
          <Text style={styles.heroSub}>₦1 = 1 pt · spend on airtime, data, electricity & TV</Text>
        </View>

        <Text style={styles.sectionLabel}>AMOUNT (MIN ₦500)</Text>
        <View style={styles.presetRow}>
          {PRESETS.map((p, i) => (
            <Pressable
              key={p}
              onPress={() => {
                setSelAmt(i);
                setCustomAmt('');
              }}
              style={[styles.preset, selAmt === i && styles.presetOn]}
            >
              <Text style={[styles.presetTxt, selAmt === i && styles.presetTxtOn]}>
                ₦{p.toLocaleString()}
              </Text>
              <Text style={[styles.presetPts, selAmt === i && styles.presetTxtOn]}>{p.toLocaleString()} pts</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>CUSTOM AMOUNT</Text>
        <TextInput
          value={customAmt}
          onChangeText={t => {
            setCustomAmt(t.replace(/[^0-9]/g, ''));
            setSelAmt(null);
          }}
          placeholder="Enter amount in naira"
          placeholderTextColor={C.placeholder}
          keyboardType="number-pad"
          style={[styles.input, customAmt ? { borderColor: C.primary } : null]}
        />

        {canContinue ? (
          <View style={styles.summary}>
            <Text style={styles.summaryTxt}>
              You will receive{' '}
              <Text style={styles.summaryStrong}>{finalAmt.toLocaleString()} pts</Text>
            </Text>
          </View>
        ) : null}

        <Pressable
          disabled={!canContinue || paying || showPayModal}
          onPress={startCheckout}
          style={[styles.cta, (!canContinue || paying || showPayModal) && styles.ctaDisabled]}
        >
          {paying ? (
            <ActivityIndicator color={C.ink} />
          ) : (
            <Text style={styles.ctaTxt}>
              {canContinue ? `Pay ₦${finalAmt.toLocaleString()} → ${finalAmt.toLocaleString()} pts` : 'Enter at least ₦500'}
            </Text>
          )}
        </Pressable>
      </ScrollView>

      {payCheckout ? (
        <Paystack
          visible={showPayModal}
          checkoutUrl={payCheckout.checkoutUrl}
          amount={finalAmt}
          billingEmail={payCheckout.email}
          reference={payCheckout.reference}
          metadata={{ type: 'points_purchase', user_id: authUser?.id }}
          onSuccess={async res => {
            const ref = res?.reference?.trim() ? res.reference : payCheckout.reference;
            setPaying(true);
            try {
              const done = await completePointsPurchase({ reference: ref });
              const credited = done.data?.points_credited || payCheckout.points;
              dismissPayModal();
              onAddTx({
                id: String(done.data?.transaction_id ?? Date.now()),
                type: 'points',
                title: `Bought ${credited.toLocaleString()} pts`,
                amount: `₦${finalAmt.toLocaleString()}`,
                pts: `+${credited} pts`,
                date: 'Just now',
                status: 'Successful',
              });
              onPurchaseComplete(credited);
            } catch (e) {
              Alert.alert(
                'Purchase failed',
                e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Could not credit points',
              );
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
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
  hero: {
    backgroundColor: '#1A1A3A',
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
  },
  heroLbl: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.55)', letterSpacing: 0.5 },
  heroBig: { fontSize: 32, fontWeight: '800', color: C.white, marginTop: 6 },
  heroPts: { fontSize: 18, fontWeight: '600', color: C.primary },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 8, lineHeight: 17 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: grey,
    marginBottom: 8,
    marginTop: 8,
    letterSpacing: 0.4,
  },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  preset: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
    minWidth: '30%',
    flexGrow: 1,
  },
  presetOn: { borderColor: C.primary, backgroundColor: C.primFaint },
  presetTxt: { fontSize: 14, fontWeight: '700', color: C.ink },
  presetPts: { fontSize: 11, color: grey, marginTop: 2 },
  presetTxtOn: { color: C.ink },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: C.ink,
    backgroundColor: C.white,
  },
  summary: {
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F3F5EF',
  },
  summaryTxt: { fontSize: 13, color: C.muted },
  summaryStrong: { fontWeight: '700', color: C.olive },
  cta: {
    marginTop: 20,
    height: 52,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: { opacity: 0.45 },
  ctaTxt: { fontSize: 15, fontWeight: '700', color: C.ink },
});
