import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { AuthUser } from '../api/auth';
import { getTierForBalance } from '../points';
import type { AppScreen, Estate } from '../types';
import UserIcon from '../assets/icons/user.svg';
import UsersIcon from '../assets/icons/users.svg';
import SendIcon from '../assets/icons/send.svg';
import LockIcon from '../assets/icons/lock.svg';
import ChatIcon from '../assets/icons/chat.svg';
import HouseIcon from '../assets/icons/estate.svg';
import DocumentIcon from '../assets/icons/document.svg';
import CardIcon from '../assets/icons/card.svg';

export function ProfileScreen({
  goTo,
  userEstate,
  authUser,
  userPoints,
  onLogout,
}: {
  goTo: (s: AppScreen) => void;
  userEstate: Estate | null;
  authUser?: AuthUser | null;
  userPoints: number;
  onLogout: () => void | Promise<void>;
}) {
  const confirmLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to sign out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          void onLogout();
        },
      },
    ]);
  };
  const { tier } = getTierForBalance(userPoints);
  const baseRows = [
    { label: 'Personal Info', sub: 'Name, email, phone', screen: 'personal_info' as const, icon: <UserIcon /> },
    { label: 'Security', sub: 'Change PIN, password', screen: 'security' as const, icon: <LockIcon /> },
    { label: 'Notifications', sub: 'Alerts & prefs', screen: 'notifications' as const, icon: '🔔' },
    { label: 'Payment Settings', sub: 'Methods, limits, receipts', screen: 'payment_settings' as const, icon: <CardIcon /> },
    { label: 'Beneficiaries', sub: 'Saved contacts', screen: 'beneficiaries' as const, icon: <UsersIcon /> },
  ] as const;

  const midRows = [
    { label: 'Refer & Earn', sub: 'Invite friends · ₦2,500 pts each', screen: 'refer' as const, icon: <SendIcon /> },
    userEstate
      ? ({
          label: userEstate.name,
          sub: `Estate account · ${userEstate.members} residents`,
          screen: 'estate_account' as const,
          icon: '🏘️',
          estateEmoji: userEstate.emoji,
          estateColor: userEstate.color,
        } as const)
      : ({
          label: 'Join an Estate',
          sub: 'Link your home · earn community pts',
          screen: 'estate_account' as const,
          icon: <HouseIcon />,
        } as const),
  ] as const;

  const tailRows = [
    { label: 'Contact Us', sub: 'WhatsApp, email, phone', screen: 'contact_us' as const, icon: <ChatIcon /> },
    { label: 'Terms & Privacy', sub: 'Legal documents', screen: 'terms' as const, icon: <DocumentIcon /> },
  ] as const;

  const rows = [...baseRows, ...midRows, ...tailRows];

  return (
    <View style={styles.page}>
      <ScreenHeader title="Profile" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{(authUser?.name?.trim()?.[0] ?? 'U').toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{authUser?.name?.trim() || 'Ahzarman user'}</Text>
            <Text style={styles.email}>{authUser?.email ?? ''}</Text>
            <View style={styles.pill}>
              <Text style={styles.pillTxt}>
                {tier.name} · {userPoints.toLocaleString()} pts
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.card}>
          {rows.map((r, i) => (
            <View key={r.label}>
              <Pressable onPress={() => goTo(r.screen)} style={styles.row}>
                <View
                  style={[
                    styles.iconWrap,
                    'estateColor' in r && r.estateColor ? { backgroundColor: r.estateColor } : null,
                  ]}
                >
                  {'estateEmoji' in r && r.estateEmoji ? (
                    <Text style={styles.estateEmoji}>{r.estateEmoji}</Text>
                  ) : (
                    <Text>{r.icon}</Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{r.label}</Text>
                  <Text style={styles.sub}>{r.sub}</Text>
                </View>
                <Text style={styles.chev}>›</Text>
              </Pressable>
              {i < rows.length - 1 ? <View style={styles.sep} /> : null}
            </View>
          ))}
        </View>
        <Pressable onPress={confirmLogout} style={styles.logoutBtn} accessibilityRole="button">
          <Text style={styles.logoutTxt}>Log out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },
  topCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: C.primXlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { color: '#919E2D', fontSize: 22, fontWeight: '700' },
  name: { color: C.ink, fontSize: 16, fontWeight: '600' },
  email: { color: C.muted, fontSize: 12, marginTop: 2 },
  pill: {
    marginTop: 6,
    backgroundColor: C.primXlt,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  pillTxt: { color: '#919E2D', fontSize: 10, fontWeight: '600' },
  card: { backgroundColor: C.white, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 10 },
  row: { paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.disabled,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  estateEmoji: { fontSize: 18 },
  label: { color: C.ink, fontSize: 13, fontWeight: '600' },
  sub: { color: C.muted, fontSize: 11, marginTop: 2 },
  chev: { color: C.muted, fontSize: 18, fontWeight: '600' },
  sep: { height: 1, backgroundColor: C.border },
  logoutBtn: {
    marginTop: 16,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.errorBorder,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutTxt: { fontSize: 15, fontWeight: '600', color: C.error },
});
