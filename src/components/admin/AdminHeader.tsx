"use client"
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function AdminHeader() {
  const pathname = usePathname();
  const [admin, setAdmin] = useState<{ id?: string; name?: string; email?: string } | null>(null);

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

  const getPageTitle = () => {
    if (pathname?.includes("/dashboard")) return "Dashboard";
    if (pathname?.includes("/bookings")) return "Bookings Management";
    if (pathname?.includes("/technicians")) return "Technicians Management";
    if (pathname?.includes("/users")) return "Users Management";
    if (pathname?.includes("/analytics")) return "Analytics";
    return "Administrator";
  };

  return (
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
          <button aria-label="notifications" className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zM18 16v-5c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button aria-label="settings" className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.027 7.027 0 0 0-1.6-.94l-.36-2.54A.5.5 0 0 0 13.5 2h-3a.5.5 0 0 0-.49.42l-.36 2.54c-.57.22-1.1.52-1.6.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 8.9a.5.5 0 0 0 .12.64L4.86 11.1c-.04.31-.06.63-.06.94s.02.63.06.94L2.95 14.56a.5.5 0 0 0-.12.64l1.92 3.32c.14.24.43.34.68.24l2.39-.96c.5.42 1.03.72 1.6.94l.36 2.54c.05.28.28.49.56.49h3c.28 0 .51-.21.56-.49l.36-2.54c.57-.22 1.1-.52 1.6-.94l2.39.96c.25.1.54 0 .68-.24l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z" />
            </svg>
          </button>
          <div className="w-px h-8 bg-slate-200 mx-1"></div>
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right">
              <div className="text-sm font-medium text-slate-900">{admin?.name || 'Administrator'}</div>
              <div className="text-xs text-slate-500">{admin?.email || 'Administrator'}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md">
              {admin?.name ? admin.name.split(' ').map(n=>n.charAt(0)).slice(0,2).join('').toUpperCase() : 'AD'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
