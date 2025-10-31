'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bell, Check, MessageSquare, Heart, UserPlus, BookOpen } from 'lucide-react';
import { logError } from '@/lib/error-logger';


type NotificationFilter = 'all' | 'unread' | 'mentions' | 'interactions';

type ApiNotificationType = 'COMMENT' | 'LIKE' | 'FOLLOW' | 'MENTION' | 'WORK' | 'SYSTEM';
type UiNotificationType = 'comment' | 'like' | 'follow' | 'mention' | 'work' | 'system';

interface ApiNotification {
  id: string;
  type: ApiNotificationType;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

interface Notification {
  id: string;
  type: UiNotificationType;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

function toUiType(t: ApiNotificationType): UiNotificationType {
  switch (t) {
    case 'COMMENT':
      return 'comment';
    case 'LIKE':
      return 'like';
    case 'FOLLOW':
      return 'follow';
    case 'MENTION':
      return 'mention';
    case 'WORK':
      return 'work';
    default:
      return 'system';
  }
}

function formatRelativeTime(dateStr: string): string {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} minute${min === 1 ? '' : 's'} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} day${day === 1 ? '' : 's'} ago`;
  return d.toLocaleDateString();
}

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchNotifications(filter: NotificationFilter) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/notifications?filter=${filter}`);
      if (!res.ok) throw new Error('Failed to load notifications');
      const data: { items: ApiNotification[]; total: number; unreadCount: number } = await res.json();
      const items: Notification[] = data.items.map((n) => ({
        id: n.id,
        type: toUiType(n.type),
        message: n.message,
        link: n.link,
        read: n.read,
        time: formatRelativeTime(n.createdAt),
      }));
      setNotifications(items);
      setUnreadCount(data.unreadCount);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unable to fetch notifications';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotifications(activeFilter);
  }, [activeFilter]);

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      if (!res.ok) throw new Error('Failed to mark all as read');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      logError('Error', e);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      });
      if (!res.ok) throw new Error('Failed to mark as read');
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      logError('Error', e);
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'comment':
        return <MessageSquare size={20} className="text-blue-600" />;
      case 'like':
        return <Heart size={20} className="text-red-600" />;
      case 'follow':
        return <UserPlus size={20} className="text-green-600" />;
      case 'mention':
        return <Bell size={20} className="text-purple-600" />;
      case 'work':
        return <BookOpen size={20} className="text-accent" />;
      default:
        return <Bell size={20} className="text-gray-600" />;
    }
  };

  const filteredNotifications = useMemo(() => notifications.filter(n => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'mentions') return n.type === 'mention';
    if (activeFilter === 'interactions') return ['comment', 'like'].includes(n.type);
    return true;
  }), [notifications, activeFilter]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-medium text-black mb-2">
              Notifications
            </h1>
            <p className="text-gray-600">
              Stay updated with your community activity
              {unreadCount > 0 && (
                <span className="ml-2 text-accent font-medium">
                  ({unreadCount} unread)
                </span>
              )}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 border-2 border-black text-sm font-medium hover:bg-black hover:text-white transition-colors"
            >
              <Check size={16} />
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="border-b-2 border-black mb-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeFilter === 'all'
                  ? 'border-b-2 border-black -mb-0.5 text-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeFilter === 'unread'
                  ? 'border-b-2 border-black -mb-0.5 text-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-accent text-white text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveFilter('mentions')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeFilter === 'mentions'
                  ? 'border-b-2 border-black -mb-0.5 text-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Mentions
            </button>
            <button
              onClick={() => setActiveFilter('interactions')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeFilter === 'interactions'
                  ? 'border-b-2 border-black -mb-0.5 text-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Interactions
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-2">
          {error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : loading ? (
            <div className="text-center py-12 text-gray-600">Loading…</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <Bell size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg mb-2">No notifications</p>
              <p className="text-sm">
                {activeFilter === 'unread' 
                  ? "You're all caught up!"
                  : "Notifications will appear here when there's activity"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-2 border-black flex items-start gap-4 hover:bg-gray-50 transition-colors ${
                  !notification.read ? 'bg-blue-50' : 'bg-white'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-black mb-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500">{notification.time}</p>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="flex-shrink-0 p-2 hover:bg-white rounded transition-colors"
                    title="Mark as read"
                  >
                    <Check size={16} className="text-gray-600" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Settings */}
        <div className="mt-12 p-6 bg-gray-50 border-2 border-gray-200">
          <h3 className="font-medium text-black mb-2">Notification Settings</h3>
          <p className="text-sm text-gray-600 mb-4">
            Manage how you receive notifications and what activities trigger them.
          </p>
          <button className="px-4 py-2 border-2 border-black text-sm font-medium hover:bg-black hover:text-white transition-colors">
            Configure Settings
          </button>
        </div>
      </div>
    </div>
  );
}
