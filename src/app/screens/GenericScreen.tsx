import { StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen } from '../types';

export function getPlaceholderTitle(screen: AppScreen): string {
  const labels: Record<AppScreen, string> = {
    onboarding: 'Onboarding',
    sign_up: 'Sign Up',
    sign_in: 'Sign In',
    home: 'Home',
    services: 'Services',
    rewards: 'Rewards',
    profile: 'Profile',
    history: 'History',
    notifications: 'Notifications',
    notifications_from_profile: 'Notifications',
    airtime: 'Airtime',
    data: 'Data',
    electricity: 'Electricity',
    elec_success: 'Electricity Success',
    tv: 'Cable TV',
    giftcards: 'Gift Cards',
    flights: 'Flights',
    betting: 'Betting',
    esim: 'eSIM',
    success_simple: 'Success',
    share_points: 'Share Points',
    redeem_points: 'Redeem Points',
    refer: 'Refer & Earn',
    contact_us: 'Contact Us',
    payment_settings: 'Payment Settings',
    beneficiaries: 'Beneficiaries',
    personal_info: 'Personal Info',
    security: 'Security',
    terms: 'Terms',
  };
  return labels[screen];
}

export function GenericScreen({ screen }: { screen: AppScreen }) {
  const title = getPlaceholderTitle(screen);
  return (
    <View style={styles.page}>
      <ScreenHeader title={title} />
      <View style={styles.center}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>This screen is queued for migration.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  title: { color: C.ink, fontSize: 20, fontWeight: '700', marginBottom: 6 },
  sub: { color: C.muted, fontSize: 13, textAlign: 'center' },
});

