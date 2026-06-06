import { apiRequest } from './client';

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
  data?: Record<string, unknown>;
};

type NotificationsResponse = {
  success: boolean;
  data: AppNotification[];
  unread_count: number;
};

export async function getNotifications(userId: number, token: string | null) {
  const res = await apiRequest<NotificationsResponse>(`/users/${userId}/notifications`, {
    method: 'GET',
    token,
  });
  return {
    items: res.data ?? [],
    unreadCount: res.unread_count ?? 0,
  };
}

export async function markAllNotificationsRead(userId: number, token: string | null) {
  await apiRequest<{ success: boolean }>(`/users/${userId}/notifications/read`, {
    method: 'POST',
    token,
    body: JSON.stringify({}),
  });
}

export function formatNotificationTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  if (d.getTime() >= startOfToday.getTime()) return 'Today';
  if (d.getTime() >= startOfYesterday.getTime()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}
