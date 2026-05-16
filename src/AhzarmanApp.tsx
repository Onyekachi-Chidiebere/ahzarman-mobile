import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native';
import { fetchMe, type AuthUser } from './app/api/auth';
import { C } from './app/constants';
import { SAMPLE_TXS } from './app/data';
import { computeBalanceFromTransactions, parsePtsFromTx } from './app/points';
import { BottomNav } from './app/components';
import {
  AirtimeScreen,
  BeneficiariesScreen,
  BettingScreen,
  ContactUsScreen,
  DataScreen,
  ElectricityScreen,
  ElecSuccessScreen,
  ESIMScreen,
  EstateAccountScreen,
  FlightsScreen,
  GiftCardsScreen,
  GenericScreen,
  HomeScreen,
  HistoryScreen,
  NotificationsScreen,
  OnboardingScreen,
  PaymentSettingsScreen,
  PersonalInfoScreen,
  ProfileScreen,
  RedeemPointsScreen,
  ReferScreen,
  RewardsScreen,
  SecurityScreen,
  SharePointsScreen,
  ServicesScreen,
  SignInScreen,
  SignUpScreen,
  SuccessSimpleScreen,
  TVScreen,
  TermsScreen,
} from './app/screens/index';
import type { AppScreen, Beneficiary, DataState, ElecPurchaseSummary, Estate, Tx } from './app/types';

const AUTH_TOKEN_KEY = 'auth_token';
const POINTS_BALANCE_KEY = 'points_balance';

export function AhzarmanApp() {
  const [booting, setBooting] = useState(true);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [screen, setScreen] = useState<AppScreen>('onboarding');
  const [stack, setStack] = useState<AppScreen[]>(['onboarding']);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([
    { id: 1, name: 'Mum', phone: '08034567890', network: 'MTN' },
    { id: 2, name: 'Office', phone: '09012345678', network: 'Airtel' },
  ]);
  const [transactions, setTransactions] = useState<Tx[]>(SAMPLE_TXS);
  const [dataState, setDataState] = useState<DataState>({
    tab: 'daily',
    network: 'MTN',
    plan: null,
    phone: '',
  });
  const [successPts, setSuccessPts] = useState(30);
  const [userPoints, setUserPoints] = useState(() => computeBalanceFromTransactions(SAMPLE_TXS));
  const [userEstate, setUserEstate] = useState<Estate | null>(null);
  const [estatePoints, setEstatePoints] = useState(0);
  const [elecSuccessSummary, setElecSuccessSummary] = useState<ElecPurchaseSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const t = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (!t) return;
        const me = await fetchMe(t);
        if (cancelled) return;
        setAuthUser(me);
        setScreen('home');
        setStack(['home']);
      } catch {
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const balance = computeBalanceFromTransactions(transactions);
    setUserPoints(balance);
    void AsyncStorage.setItem(POINTS_BALANCE_KEY, String(balance));
  }, [transactions]);

  const onAuthSuccess = async (token: string, user: AuthUser) => {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    setAuthUser(user);
    setScreen('home');
    setStack(['home']);
  };

  const onAddTx = (tx: Tx) => {
    setTransactions(prev => [tx, ...prev]);
    if (userEstate && tx.status === 'Successful') {
      const earned = parsePtsFromTx(tx.pts);
      if (earned > 0) setEstatePoints(p => p + Math.floor(earned * 0.1));
    }
  };

  const recordPointsSpend = (title: string, amount: number) => {
    if (amount <= 0) return;
    onAddTx({
      id: String(Date.now()),
      type: 'points',
      title,
      amount: '',
      pts: `-${amount} pts`,
      date: 'Just now',
      status: 'Successful',
    });
  };
  const showBottomNav = ['home', 'services', 'rewards', 'profile'].includes(screen);

  const goTo = (next: AppScreen) => {
    if (next === 'home') {
      setElecSuccessSummary(null);
    }
    // Match Claude file behavior: notifications from profile routes to a special key.
    if (next === 'notifications' && screen === 'profile') {
      setScreen('notifications_from_profile');
      setStack(p => [...p, 'notifications_from_profile']);
      return;
    }
    setScreen(next);
    setStack(p => [...p, next]);
  };

  const finishPurchase = (pts: number) => {
    setSuccessPts(pts);
    goTo('success_simple');
  };

  const goBack = () => {
    setStack(p => {
      if (p.length <= 1) {
        setScreen(p[0] ?? 'onboarding');
        return p;
      }
      const nextStack = p.slice(0, -1);
      const nextScreen = nextStack[nextStack.length - 1] ?? 'onboarding';
      setScreen(nextScreen);
      return nextStack;
    });
  };

  if (booting) {
    return (
      <SafeAreaView style={[styles.root, styles.boot]}>
        <View style={styles.bootInner}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      {screen === 'onboarding' ? <OnboardingScreen goTo={goTo} /> : null}
      {screen === 'sign_up' ? <SignUpScreen goTo={goTo} onAuthSuccess={onAuthSuccess} /> : null}
      {screen === 'sign_in' ? <SignInScreen goTo={goTo} onAuthSuccess={onAuthSuccess} /> : null}

      {screen === 'home' ? (
        <HomeScreen
          goTo={goTo}
          transactions={transactions}
          userEstate={userEstate}
          authUser={authUser}
          userPoints={userPoints}
        />
      ) : null}
      {screen === 'services' ? <ServicesScreen goTo={goTo} /> : null}
      {screen === 'rewards' ? (
        <RewardsScreen
          goTo={goTo}
          userEstate={userEstate}
          estatePoints={estatePoints}
          userPoints={userPoints}
          transactions={transactions}
        />
      ) : null}
      {screen === 'profile' ? (
        <ProfileScreen goTo={goTo} userEstate={userEstate} authUser={authUser} userPoints={userPoints} />
      ) : null}

      {screen === 'notifications' ? <NotificationsScreen goTo={goTo} fromProfile={false} /> : null}
      {screen === 'notifications_from_profile' ? (
        <NotificationsScreen goTo={goTo} fromProfile />
      ) : null}
      {screen === 'history' ? <HistoryScreen goTo={goTo} transactions={transactions} /> : null}
      {screen === 'share_points' ? (
        <SharePointsScreen goTo={goTo} userPoints={userPoints} onSpendPoints={recordPointsSpend} />
      ) : null}
      {screen === 'redeem_points' ? (
        <RedeemPointsScreen goTo={goTo} userPoints={userPoints} onSpendPoints={recordPointsSpend} />
      ) : null}
      {screen === 'refer' ? <ReferScreen goTo={goTo} goBack={goBack} /> : null}
      {screen === 'estate_account' ? (
        <EstateAccountScreen
          goBack={goBack}
          userEstate={userEstate}
          estatePoints={estatePoints}
          onSetEstate={setUserEstate}
        />
      ) : null}
      {screen === 'electricity' ? (
        <ElectricityScreen
          goTo={goTo}
          onAddTx={onAddTx}
          authUser={authUser}
          onPurchaseSuccess={sum => {
            setElecSuccessSummary(sum);
            goTo('elec_success');
          }}
        />
      ) : null}
      {screen === 'elec_success' ? (
        <ElecSuccessScreen goTo={goTo} summary={elecSuccessSummary} />
      ) : null}
      {screen === 'airtime' ? (
        <AirtimeScreen
          goTo={goTo}
          beneficiaries={beneficiaries}
          onSaveBenef={b => setBeneficiaries(p => [...p, b])}
          onAddTx={onAddTx}
          onPurchaseComplete={finishPurchase}
          authUser={authUser}
        />
      ) : null}
      {screen === 'data' ? (
        <DataScreen
          goTo={goTo}
          dataState={dataState}
          setDataState={setDataState}
          onAddTx={onAddTx}
          onPurchaseComplete={finishPurchase}
          authUser={authUser}
        />
      ) : null}
      {screen === 'tv' ? (
        <TVScreen
          goTo={goTo}
          onAddTx={onAddTx}
          onPurchaseComplete={finishPurchase}
          authUser={authUser}
        />
      ) : null}
      {screen === 'giftcards' ? (
        <GiftCardsScreen goTo={goTo} onAddTx={onAddTx} onPurchaseComplete={finishPurchase} />
      ) : null}
      {screen === 'flights' ? (
        <FlightsScreen goTo={goTo} onAddTx={onAddTx} onPurchaseComplete={finishPurchase} />
      ) : null}
      {screen === 'betting' ? (
        <BettingScreen goTo={goTo} onAddTx={onAddTx} onPurchaseComplete={finishPurchase} />
      ) : null}
      {screen === 'esim' ? (
        <ESIMScreen goTo={goTo} onAddTx={onAddTx} onPurchaseComplete={finishPurchase} />
      ) : null}
      {screen === 'success_simple' ? (
        <SuccessSimpleScreen goTo={goTo} pts={successPts} userPoints={userPoints} />
      ) : null}
      {screen === 'contact_us' ? <ContactUsScreen goTo={goTo} /> : null}
      {screen === 'payment_settings' ? <PaymentSettingsScreen goTo={goTo} /> : null}
      {screen === 'beneficiaries' ? (
        <BeneficiariesScreen
          goTo={goTo}
          beneficiaries={beneficiaries}
          onSave={b => setBeneficiaries(p => [...p, b])}
          onDelete={id => setBeneficiaries(p => p.filter(x => x.id !== id))}
        />
      ) : null}
      {screen === 'personal_info' ? <PersonalInfoScreen goTo={goTo} /> : null}
      {screen === 'security' ? <SecurityScreen goTo={goTo} /> : null}
      {screen === 'terms' ? <TermsScreen goTo={goTo} /> : null}

      {[
        'onboarding',
        'sign_up',
        'sign_in',
        'home',
        'services',
        'rewards',
        'profile',
        'notifications',
        'notifications_from_profile',
        'history',
        'share_points',
        'redeem_points',
        'refer',
        'electricity',
        'elec_success',
        'airtime',
        'data',
        'tv',
        'giftcards',
        'flights',
        'betting',
        'esim',
        'success_simple',
        'contact_us',
        'payment_settings',
        'beneficiaries',
        'personal_info',
        'security',
        'terms',
        'estate_account',
      ].includes(screen)
        ? null
        : <GenericScreen screen={screen} />}

      {showBottomNav ? <BottomNav active={screen} goTo={goTo} /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.surface },
  boot: { justifyContent: 'center', alignItems: 'center' },
  bootInner: { padding: 24 },
});

