import { io, type Socket } from 'socket.io-client';
import { SOCKET_BASE_URL } from '../config';
import type { AppNotification } from './notifications';

export type NotificationNewPayload = {
  notification: AppNotification;
  unread_count: number;
};

export type NotificationsSocketHandlers = {
  onNotificationNew: (payload: NotificationNewPayload) => void;
  onPointsReceived?: () => void;
};

/**
 * Connect to the server Socket.IO namespace for realtime notifications.
 * Returns a disconnect function.
 */
export function connectNotificationsSocket(
  token: string,
  handlers: NotificationsSocketHandlers,
): () => void {
  const socket: Socket = io(SOCKET_BASE_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });

  socket.on('notification:new', handlers.onNotificationNew);
  socket.on('points:received', () => {
    handlers.onPointsReceived?.();
  });

  return () => {
    socket.off('notification:new');
    socket.off('points:received');
    socket.disconnect();
  };
}
