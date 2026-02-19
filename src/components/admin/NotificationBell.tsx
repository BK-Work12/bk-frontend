'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getToken } from '@/lib/auth';
import {
  getAdminNotifications,
  getAdminUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  type AdminNotification,
} from '@/lib/adminApi';
import { AdminSocketClient, type AdminNotificationPayload } from '@/lib/socket';

const TYPE_ICONS: Record<string, string> = {
  new_user: '👤',
  new_deposit: '💰',
  new_subscription: '📦',
};

const TYPE_COLORS: Record<string, string> = {
  new_user: 'bg-blue-500/20 text-blue-400',
  new_deposit: 'bg-green-500/20 text-green-400',
  new_subscription: 'bg-purple-500/20 text-purple-400',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<AdminSocketClient | null>(null);

  // Fetch unread count on mount
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    getAdminUnreadCount(token).then(setUnreadCount);
  }, []);

  // Connect to Socket.IO for real-time notifications
  useEffect(() => {
    const client = new AdminSocketClient();
    client.connect();
    client.subscribeAdmin();
    socketRef.current = client;

    const unsub = client.onAdminNotification((payload: AdminNotificationPayload) => {
      // Add to the top of the list
      const newNotif: AdminNotification = {
        id: payload.id,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        relatedUser: payload.relatedUser
          ? { id: payload.relatedUser, firstName: '', lastName: '', email: '' }
          : undefined,
        relatedId: payload.relatedId,
        meta: payload.meta,
        read: false,
        createdAt: payload.createdAt,
      };
      setNotifications((prev) => [newNotif, ...prev].slice(0, 50));
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      unsub();
      client.disconnect();
    };
  }, []);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch notifications when dropdown opens
  const fetchNotifications = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    const res = await getAdminNotifications(token, 1, 30);
    if (res) {
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    }
    setLoading(false);
  }, []);

  const handleToggle = () => {
    if (!open) fetchNotifications();
    setOpen((prev) => !prev);
  };

  const handleMarkRead = async (id: string) => {
    const token = getToken();
    if (!token) return;
    const ok = await markNotificationRead(token, id);
    if (ok) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllRead = async () => {
    const token = getToken();
    if (!token) return;
    const ok = await markAllNotificationsRead(token);
    if (ok) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell button */}
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-lg hover:bg-[#FFFFFF14] transition-colors"
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#FFFFFF80] hover:text-white transition-colors"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold font-ui leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="fixed sm:absolute right-2 sm:right-0 top-14 sm:top-full sm:mt-2 w-[calc(100vw-16px)] sm:w-[360px] max-h-[480px] rounded-xl border border-[#FFFFFF14] bg-[#111111] shadow-2xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#FFFFFF14]">
            <span className="text-sm font-medium font-ui text-white">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-ui text-[#8EDD23] hover:text-[#a4f044] transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-6 text-center text-sm font-ui text-[#FFFFFF60]">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-sm font-ui text-[#FFFFFF60]">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.read && handleMarkRead(n.id)}
                  className={`w-full text-left px-4 py-3 flex gap-3 border-b border-[#FFFFFF08] hover:bg-[#FFFFFF08] transition-colors ${
                    !n.read ? 'bg-[#FFFFFF05]' : ''
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm ${
                      TYPE_COLORS[n.type] ?? 'bg-[#FFFFFF14] text-white'
                    }`}
                  >
                    {TYPE_ICONS[n.type] ?? '🔔'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium font-ui text-white truncate">
                        {n.title}
                      </span>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-[#8EDD23] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs font-ui text-[#FFFFFF80] mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                    <span className="text-[10px] font-ui text-[#FFFFFF40] mt-1 block">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
