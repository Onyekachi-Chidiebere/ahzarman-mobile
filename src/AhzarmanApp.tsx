import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native';
import {
  AUTH_TOKEN_KEY,
  clearAuthSession,
  fetchMe,
  POINTS_BALANCE_KEY,
  type AuthUser,
} from './app/api/auth';
import { getUserTransactions } from './app/api/transactions';
import { C } from './app/constants';
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

export function AhzarmanApp() {
  const [booting, setBooting] = useState(true);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [screen, setScreen] = useState<AppScreen>('onboarding');
  const [stack, setStack] = useState<AppScreen[]>(['onboarding']);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([
    { id: 1, name: 'Mum', phone: '08034567890', network: 'MTN' },
    { id: 2, name: 'Office', phone: '09012345678', network: 'Airtel' },
  ]);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [dataState, setDataState] = useState<DataState>({
    tab: 'daily',
    network: 'MTN',
    plan: null,
    phone: '',
  });
  const [successPts, setSuccessPts] = useState(30);
  const [userPoints, setUserPoints] = useState(0);
  const [userEstate, setUserEstate] = useState<Estate | null>(null);
  const [estatePoints, setEstatePoints] = useState(0);
  const [elecSuccessSummary, setElecSuccessSummary] = useState<ElecPurchaseSummary | null>(null);

  const refreshTransactions = useCallback(async () => {
    if (!authUser?.id) return;
    setTxLoading(true);
    try {
      const token = authToken ?? (await AsyncStorage.getItem(AUTH_TOKEN_KEY));
      const list = await getUserTransactions(authUser.id, token, { limit: 50 });
      setTransactions(list);
    } catch {
      // Keep existing list on transient errors
    } finally {
      setTxLoading(false);
    }
  }, [authUser?.id, authToken]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const t = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (!t) return;
        const me = await fetchMe(t);
        if (cancelled) return;
        setAuthToken(t);
        setAuthUser(me);
        setScreen('home');
        setStack(['home']);
        setTxLoading(true);
        try {
          const list = await getUserTransactions(me.id, t, { limit: 50 });
          if (!cancelled) setTransactions(list);
        } catch {
          if (!cancelled) setTransactions([]);
        } finally {
          if (!cancelled) setTxLoading(false);
        }
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
    if (userEstate) {
      const contrib = transactions
        .filter(t => t.status === 'Successful')
        .reduce((sum, t) => sum + Math.max(0, Math.floor(parsePtsFromTx(t.pts) * 0.1)), 0);
      setEstatePoints(contrib);
    }
  }, [transactions, userEstate]);

  useEffect(() => {
    if ((screen === 'home' || screen === 'history') && authUser?.id) {
      void refreshTransactions();
    }
  }, [screen, authUser?.id, refreshTransactions]);

  const onAuthSuccess = async (token: string, user: AuthUser) => {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    setAuthToken(token);
    setAuthUser(user);
    setScreen('home');
    setStack(['home']);
    setTxLoading(true);
    try {
      const list = await getUserTransactions(user.id, token, { limit: 50 });
      setTransactions(list);
    } catch {
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  };

  const onLogout = async () => {
    await clearAuthSession();
    setAuthToken(null);
    setAuthUser(null);
    setTransactions([]);
    setUserPoints(0);
    setUserEstate(null);
    setEstatePoints(0);
    setElecSuccessSummary(null);
    setScreen('sign_in');
    setStack(['sign_in']);
  };

  const onAddTx = (tx: Tx) => {
    const serverBacked = ['airtime', 'data', 'electricity', 'tv'].includes(tx.type);
    if (serverBacked) {
      void refreshTransactions();
    } else {
      setTransactions(prev => [tx, ...prev]);
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
    void refreshTransactions();
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
          txLoading={txLoading}
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
        <ProfileScreen
          goTo={goTo}
          userEstate={userEstate}
          authUser={authUser}
          userPoints={userPoints}
          onLogout={onLogout}
        />
      ) : null}

      {screen === 'notifications' ? <NotificationsScreen goTo={goTo} fromProfile={false} /> : null}
      {screen === 'notifications_from_profile' ? (
        <NotificationsScreen goTo={goTo} fromProfile />
      ) : null}
      {screen === 'history' ? (
        <HistoryScreen goTo={goTo} transactions={transactions} txLoading={txLoading} />
      ) : null}
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
          authToken={authToken}
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
      {screen === 'personal_info' ? (
        <PersonalInfoScreen
          goTo={goTo}
          authUser={authUser}
          authToken={authToken}
          onUserUpdated={setAuthUser}
        />
      ) : null}
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

