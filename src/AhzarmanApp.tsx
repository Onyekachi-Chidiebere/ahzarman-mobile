import { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { C } from './app/constants';
import { SAMPLE_TXS } from './app/data';
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
import type { AppScreen, Beneficiary, DataState, Estate, Tx } from './app/types';

export function AhzarmanApp() {
  const [screen, setScreen] = useState<AppScreen>('onboarding');
  const [stack, setStack] = useState<AppScreen[]>(['onboarding']);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([
    { id: 1, name: 'Mum', phone: '08034567890', network: 'MTN' },
    { id: 2, name: 'Office', phone: '09012345678', network: 'Airtel' },
  ]);
  const [transactions, setTransactions] = useState<Tx[]>(SAMPLE_TXS);
  const [dataState, setDataState] = useState<DataState>({
    tab: 'hot',
    network: 'MTN',
    plan: null,
    phone: '',
  });
  const [successPts, setSuccessPts] = useState(30);
  const [userEstate, setUserEstate] = useState<Estate | null>(null);
  const [estatePoints, setEstatePoints] = useState(0);

  const onAddTx = (tx: Tx) => {
    setTransactions(prev => [tx, ...prev]);
    if (userEstate && tx.pts) {
      const n = parseInt((tx.pts || '').replace(/\D/g, ''), 10) || 0;
      if (n > 0) setEstatePoints(p => p + Math.floor(n * 0.1));
    }
  };
  const showBottomNav = ['home', 'services', 'rewards', 'profile'].includes(screen);

  const goTo = (next: AppScreen) => {
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

  return (
    <SafeAreaView style={styles.root}>
      {screen === 'onboarding' ? <OnboardingScreen goTo={goTo} /> : null}
      {screen === 'sign_up' ? <SignUpScreen goTo={goTo} /> : null}
      {screen === 'sign_in' ? <SignInScreen goTo={goTo} /> : null}

      {screen === 'home' ? (
        <HomeScreen goTo={goTo} transactions={transactions} userEstate={userEstate} />
      ) : null}
      {screen === 'services' ? <ServicesScreen goTo={goTo} /> : null}
      {screen === 'rewards' ? (
        <RewardsScreen goTo={goTo} userEstate={userEstate} estatePoints={estatePoints} />
      ) : null}
      {screen === 'profile' ? <ProfileScreen goTo={goTo} userEstate={userEstate} /> : null}

      {screen === 'notifications' ? <NotificationsScreen goTo={goTo} fromProfile={false} /> : null}
      {screen === 'notifications_from_profile' ? (
        <NotificationsScreen goTo={goTo} fromProfile />
      ) : null}
      {screen === 'history' ? <HistoryScreen goTo={goTo} transactions={transactions} /> : null}
      {screen === 'share_points' ? <SharePointsScreen goTo={goTo} /> : null}
      {screen === 'redeem_points' ? <RedeemPointsScreen goTo={goTo} /> : null}
      {screen === 'refer' ? <ReferScreen goTo={goTo} goBack={goBack} /> : null}
      {screen === 'estate_account' ? (
        <EstateAccountScreen
          goBack={goBack}
          userEstate={userEstate}
          estatePoints={estatePoints}
          onSetEstate={setUserEstate}
        />
      ) : null}
      {screen === 'electricity' ? <ElectricityScreen goTo={goTo} onAddTx={onAddTx} /> : null}
      {screen === 'elec_success' ? <ElecSuccessScreen goTo={goTo} /> : null}
      {screen === 'airtime' ? (
        <AirtimeScreen
          goTo={goTo}
          beneficiaries={beneficiaries}
          onSaveBenef={b => setBeneficiaries(p => [...p, b])}
          onAddTx={onAddTx}
          onPurchaseComplete={finishPurchase}
        />
      ) : null}
      {screen === 'data' ? (
        <DataScreen
          goTo={goTo}
          dataState={dataState}
          setDataState={setDataState}
          onAddTx={onAddTx}
          onPurchaseComplete={finishPurchase}
        />
      ) : null}
      {screen === 'tv' ? (
        <TVScreen goTo={goTo} onAddTx={onAddTx} onPurchaseComplete={finishPurchase} />
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
      {screen === 'success_simple' ? <SuccessSimpleScreen goTo={goTo} pts={successPts} /> : null}
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
});

