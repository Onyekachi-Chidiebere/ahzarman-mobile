import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen } from '../types';

const grey = C.muted;

const SECTIONS = [
  {
    heading: 'Terms of Service',
    body:
      'By using Ahzarman, you agree to use the platform solely for lawful bill payments, airtime, data, and related services. Ahzarman reserves the right to suspend accounts engaged in fraudulent activity. All transactions are final unless a dispute is raised within 24 hours.',
  },
  {
    heading: 'Privacy Policy',
    body:
      'Ahzarman collects your phone number, email, and transaction data to deliver services and improve your experience. We do not sell your data to third parties. Data is encrypted at rest and in transit using AES-256 and TLS 1.3.',
  },
  {
    heading: 'Points & Rewards',
    body:
      'Points are earned on qualifying transactions and expire after 12 months of account inactivity. Ahzarman reserves the right to adjust point values with 30 days\' notice.',
  },
  {
    heading: 'Contact',
    body: 'For legal enquiries, contact legal@ahzarman.app or call 08039930607.',
  },
];

export function TermsScreen({ goTo }: { goTo: (s: AppScreen) => void }) {
  return (
    <View style={styles.page}>
      <ScreenHeader title="Terms & Privacy" onBack={() => goTo('profile')} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {SECTIONS.map(s => (
          <View key={s.heading} style={styles.card}>
            <Text style={styles.heading}>{s.heading}</Text>
            <Text style={styles.body}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32, gap: 16 },
  card: {
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  heading: { fontSize: 14, fontWeight: '700', color: C.ink, marginBottom: 8 },
  body: { fontSize: 13, color: grey, lineHeight: 22 },
});
