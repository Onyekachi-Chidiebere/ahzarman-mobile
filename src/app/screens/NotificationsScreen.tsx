import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  formatNotificationTime,
  markAllNotificationsRead,
  type AppNotification,
} from '../api/notifications';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen } from '../types';

export function NotificationsScreen({
  goTo,
  fromProfile,
  authUserId,
  authToken,
  notifications,
  loading,
  onRefresh,
}: {
  goTo: (s: AppScreen) => void;
  fromProfile: boolean;
  authUserId: number | null;
  authToken: string | null;
  notifications: AppNotification[];
  loading?: boolean;
  onRefresh: () => void | Promise<void>;
}) {
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    void onRefresh();
  }, [onRefresh]);

  const markRead = async () => {
    if (!authUserId || !authToken) return;
    setMarking(true);
    try {
      await markAllNotificationsRead(authUserId, authToken);
      await onRefresh();
    } finally {
      setMarking(false);
    }
  };

  const hasUnread = notifications.some(n => !n.read);

  return (
    <View style={styles.page}>
      <ScreenHeader
        title="Notifications"
        onBack={() => goTo(fromProfile ? 'profile' : 'home')}
        rightSlot={
          hasUnread ? (
            <Pressable onPress={() => void markRead()} disabled={marking} hitSlop={8}>
              <Text style={styles.markRead}>{marking ? '…' : 'Mark read'}</Text>
            </Pressable>
          ) : null
        }
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {loading && notifications.length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={C.primary} />
            <Text style={styles.loadingTxt}>Loading notifications…</Text>
          </View>
        ) : notifications.length > 0 ? (
          notifications.map(n => (
            <View key={n.id} style={[styles.row, !n.read ? styles.rowUnread : null]}>
              {!n.read ? <View style={styles.dot} /> : <View style={styles.dotRead} />}
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{n.title}</Text>
                <Text style={styles.sub}>{n.body}</Text>
              </View>
              <Text style={styles.time}>{formatNotificationTime(n.created_at)}</Text>
            </View>
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>You're all caught up</Text>
            <Text style={styles.emptySub}>No new notifications.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 10, paddingBottom: 32 },
  markRead: { fontSize: 12, fontWeight: '600', color: C.olive },
  row: {
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  rowUnread: { borderColor: C.primary, backgroundColor: C.primFaint },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary, marginTop: 5 },
  dotRead: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.border, marginTop: 5 },
  title: { color: C.ink, fontSize: 13, fontWeight: '700' },
  sub: { color: C.muted, fontSize: 12, marginTop: 2, lineHeight: 18 },
  time: { color: C.muted, fontSize: 10, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: C.ink, textAlign: 'center' },
  emptySub: { fontSize: 13, color: C.muted, marginTop: 8, textAlign: 'center' },
  loadingBox: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  loadingTxt: { fontSize: 14, color: C.muted },
});
