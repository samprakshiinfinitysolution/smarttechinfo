'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Calendar, User, Bell, Wrench } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationPanel from './NotificationPanel';

const MobileBottomNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { unreadCount } = useNotifications();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [pathname]);

  const handleNotificationClick = () => {
    if (isLoggedIn) {
      setShowNotifications(!showNotifications);
    }
  };

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard', key: 'dashboard' },
    { icon: Calendar, label: 'Book', path: '/book', key: 'book' },
    { icon: Bell, label: 'Notifications', key: 'notifications', badge: unreadCount, onClick: handleNotificationClick },
    { icon: Wrench, label: 'Services', path: '/services', key: 'services' },
    { icon: User, label: isLoggedIn ? 'Account' : 'Login', path: isLoggedIn ? '/profile' : '/user-login', key: 'account' }
  ];

  const isActive = (key: string) => {
    if (key === 'dashboard') return pathname === '/dashboard';
    if (key === 'account') return pathname === '/profile' || pathname === '/user-login';
    if (key === 'book') return pathname === '/book';
    if (key === 'services') return pathname === '/services';
    if (key === 'notifications') return showNotifications;
    return false;
  };

  return (
    <>
      {/* Safe area for bottom navigation */}
      <div className="md:hidden h-20"></div>
      
      {/* Mobile Notification Panel */}
      {showNotifications && isLoggedIn && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-[60] animate-fade-in" onClick={() => setShowNotifications(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl h-[75vh] animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <NotificationPanel isMobile onClose={() => setShowNotifications(false)} />
          </div>
        </div>
      )}
      
      {/* Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 z-50 safe-area-inset-bottom">
        <div className="flex items-center justify-around py-2 pb-safe">
          {navItems.map(({ icon: Icon, label, path, key, badge, onClick }) => (
            <button
              key={key}
              onClick={() => onClick ? onClick() : path && router.push(path)}
              className={`relative flex flex-col items-center py-3 px-4 rounded-xl transition-all duration-200 min-w-[60px] ${
                isActive(key)
                  ? 'text-blue-600 bg-blue-50 scale-105 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:scale-95'
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 mb-1 transition-all ${
                  isActive(key) ? 'scale-110' : ''
                }`} />
                {badge !== undefined && badge > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 rounded-full h-2 w-2 animate-pulse"></span>
                )}
              </div>
              <span className={`text-xs font-medium transition-all ${
                isActive(key) ? 'font-semibold' : ''
              }`}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default MobileBottomNav;