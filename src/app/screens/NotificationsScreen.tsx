import { StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen } from '../types';

export function NotificationsScreen({
  goTo,
  fromProfile,
}: {
  goTo: (s: AppScreen) => void;
  fromProfile: boolean;
}) {
  const notifs = [
    { id: '1', title: 'Points earned', sub: 'You earned +250 pts from electricity payment', time: 'Today' },
    { id: '2', title: 'Promo', sub: 'Refer friends and get ₦2,500 points', time: 'Yesterday' },
  ];
  return (
    <View style={styles.page}>
      <ScreenHeader title="Notifications" onBack={() => goTo(fromProfile ? 'profile' : 'home')} />
      <View style={styles.content}>
        {notifs.map(n => (
          <View key={n.id} style={styles.row}>
            <View style={styles.dot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{n.title}</Text>
              <Text style={styles.sub}>{n.sub}</Text>
            </View>
            <Text style={styles.time}>{n.time}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  content: { padding: 16, gap: 10 },
  row: { backgroundColor: C.white, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary, marginTop: 5 },
  title: { color: C.ink, fontSize: 13, fontWeight: '700' },
  sub: { color: C.muted, fontSize: 12, marginTop: 2 },
  time: { color: C.muted, fontSize: 10, fontWeight: '600' },
});

