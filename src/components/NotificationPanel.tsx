'use client';
import React, { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Copy, Trash2 } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

// Local notification type (avoid colliding with the DOM `Notification` global type)
type AppNotification = {
  _id: string;
  type?: 'otp' | 'booking_update' | 'general' | string;
  title?: string;
  message?: string;
  data?: any;
  read?: boolean;
  createdAt?: string;
};

interface NotificationPanelProps {
  isMobile?: boolean;
  onClose?: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isMobile = false, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAllNotifications, fetchNotifications } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close panel when clicking outside (desktop only)
  useEffect(() => {
    if (isMobile) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isMobile]);

  const copyToClipboard = async (otp: string) => {
    try {
      await navigator.clipboard.writeText(otp);
      setCopiedOtp(otp);
      setTimeout(() => setCopiedOtp(null), 2000);
    } catch (err) {
      console.error('Failed to copy OTP:', err);
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getNotificationIcon = (notification: AppNotification) => {
    if (notification?.type === 'otp') {
      const otpType = notification.data?.otpType;
      return otpType === 'start' ? '🚀' : '✅';
    }
    switch (notification?.type) {
      case 'booking_update':
        return '📋';
      default:
        return '📢';
    }
  };

  if (isMobile) {
    return (
      <div className="w-full h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50 rounded-t-3xl">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                title="Clear all notifications"
              >
                <Trash2 size={16} />
              </button>
            )}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                title="Mark all as read"
              >
                <CheckCheck size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No notifications yet</p>
              <p className="text-sm text-gray-400 mt-1">We'll notify you when something happens</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification: AppNotification) => (
                <div
                  key={notification._id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => !notification.read && markAsRead(notification._id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">{getNotificationIcon(notification)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm text-gray-900 leading-tight">{notification.title}</h4>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">{notification.message}</p>
                      {notification.type === 'otp' && notification.data?.otp && (
                        <div className="mt-3">
                          <div className="text-xs font-medium text-gray-700 mb-2 text-center">
                            {notification.data.otpType === 'start' ? '🚀 Start Service Code' : '✅ Completion Code'}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(notification.data.otp);
                            }}
                            className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 active:scale-95 transition-all duration-200 group"
                          >
                            <div className="flex items-center justify-center gap-3">
                              <span className="font-mono text-2xl font-bold text-blue-600 tracking-wider">
                                {notification.data.otp}
                              </span>
                              {copiedOtp === notification.data.otp ? (
                                <div className="flex items-center gap-1 text-green-600">
                                  <Check className="w-5 h-5" />
                                  <span className="text-sm font-medium">Copied!</span>
                                </div>
                              ) : (
                                <Copy className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                              )}
                            </div>
                            <div className="text-xs text-gray-600 mt-2 font-medium">
                              {copiedOtp === notification.data.otp ? 'Code copied to clipboard' : 'Tap to copy code'}
                            </div>
                          </button>
                        </div>
                      )}
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification._id);
                          }}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium"
                        >
                          <Check className="w-3 h-3" />
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <Bell size={22} className={`transition-transform ${isOpen ? 'scale-110' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-lg animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-80 sm:w-[calc(100vw-2rem)] sm:right-4 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  title="Clear all notifications"
                >
                  <Trash2 size={16} />
                </button>
              )}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck size={16} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No notifications yet</p>
                <p className="text-sm text-gray-400 mt-1">We'll notify you when something happens</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => !notification.read && markAsRead(notification._id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">{getNotificationIcon(notification)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm text-gray-900 leading-tight">{notification.title}</h4>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">{notification.message}</p>
                        {notification?.type === 'otp' && notification.data?.otp && (
                          <div className="mt-3">
                            <div className="text-xs font-medium text-gray-700 mb-2 text-center">
                              {notification.data.otpType === 'start' ? '🚀 Start Service Code' : '✅ Completion Code'}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(notification.data.otp);
                              }}
                              className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 active:scale-95 transition-all duration-200 group"
                            >
                              <div className="flex items-center justify-center gap-3">
                                <span className="font-mono text-2xl font-bold text-blue-600 tracking-wider">
                                  {notification.data.otp}
                                </span>
                                {copiedOtp === notification.data.otp ? (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <Check className="w-5 h-5" />
                                    <span className="text-sm font-medium">Copied!</span>
                                  </div>
                                ) : (
                                  <Copy className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                                )}
                              </div>
                              <div className="text-xs text-gray-600 mt-2 font-medium">
                                {copiedOtp === notification.data.otp ? 'Code copied to clipboard' : 'Tap to copy code'}
                              </div>
                            </button>
                          </div>
                        )}
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification._id);
                            }}
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium"
                          >
                            <Check className="w-3 h-3" />
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;