"use client"
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<{ id?: string; name?: string; email?: string } | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    try {
      const s = localStorage.getItem('adminUser');
      if (s) setAdmin(JSON.parse(s));
    } catch (e) {
      console.error('Failed to read adminUser from localStorage', e);
    }

    const onStorage = (e: StorageEvent | Event) => {
      try {
        const s = localStorage.getItem('adminUser');
        if (s) setAdmin(JSON.parse(s));
        else setAdmin(null);
      } catch (err) {
        console.error('Failed to parse adminUser from storage event', err);
      }
    };

    window.addEventListener('storage', onStorage as any);
    return () => window.removeEventListener('storage', onStorage as any);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[aria-label="notifications"]') && !target.closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
      if (!target.closest('.profile-section')) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (token) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/admin/notifications`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setNotifications(data.notifications || []);
          }
        }
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    if (pathname?.includes("/dashboard")) return "Dashboard";
    if (pathname?.includes("/bookings")) return "Bookings Management";
    if (pathname?.includes("/technicians")) return "Technicians Management";
    if (pathname?.includes("/users")) return "Users Management";
    if (pathname?.includes("/analytics")) return "Analytics";
    return "Administrator";
  };

  return (
    <>
    <header className="w-full sticky top-0 bg-white border-b border-slate-200 z-20 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-xl font-semibold text-slate-900">Welcome back, {admin?.name ? admin.name.split(' ')[0] : 'Admin'}! 👋</div>
          <div className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
            <span>{getPageTitle()}</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="notifications" 
              className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zM18 16v-5c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </svg>
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
            {showNotifications && (
              <div className="notification-dropdown absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50">
                <div className="p-4 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <svg className="w-12 h-12 text-slate-300 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zM18 16v-5c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                      </svg>
                      <p className="text-sm text-slate-500">No new notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif, i) => (
                      <div key={i} className="p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
                        <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                        <p className="text-xs text-slate-600 mt-1">{notif.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="w-px h-8 bg-slate-200 mx-1"></div>
          <div className="relative profile-section">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 pl-2 hover:bg-slate-50 rounded-xl p-2 transition-all"
            >
              <div className="text-right">
                <div className="text-sm font-medium text-slate-900">{admin?.name || 'Administrator'}</div>
                <div className="text-xs text-slate-500">{admin?.email || 'Administrator'}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md">
                {admin?.name ? admin.name.split(' ').map(n=>n.charAt(0)).slice(0,2).join('').toUpperCase() : 'AD'}
              </div>
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-50">
                <div className="p-2">
                  <button 
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowLogoutPopup(true);
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 flex items-center gap-3 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1" />
                    </svg>
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>

    {showLogoutPopup && typeof document !== "undefined" && createPortal(
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
              </svg>
            </div>
            <h2 className="text-white text-xl font-semibold">Confirm Logout</h2>
            <p className="text-white/70 text-sm mt-2 text-center">Are you sure you want to logout?</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowLogoutPopup(false)}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-full transition-colors border border-white/30"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                try {
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    localStorage.removeItem("adminToken");
                    localStorage.removeItem("adminUser");
                    window.dispatchEvent(new Event('storage'));
                  }
                } catch (e) {
                  console.warn("Failed to clear local storage on logout", e);
                }
                setShowLogoutPopup(false);
                router.push("/admin/login");
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-full transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  );
}
