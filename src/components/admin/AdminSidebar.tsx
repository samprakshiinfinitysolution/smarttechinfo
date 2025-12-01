"use client"
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import logo from "../../assets/logo.jpeg";

const navItems = [
  { key: "dashboard", label: "Dashboard", href: "/admin/dashboard" },
  { key: "bookings", label: "Bookings", href: "/admin/bookings" },
  { key: "services", label: "Services", href: "/admin/services" },
  { key: "technicians", label: "Technicians", href: "/admin/technicians" },
  { key: "users", label: "Users", href: "/admin/users" },
  { key: "analytics", label: "Analytics", href: "/admin/analytics" },
];

export default function AdminSidebar() {
  const pathname = usePathname() || "/admin";
  const router = useRouter();
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  return (
    <aside className="w-72 bg-white border-r border-slate-200 h-screen sticky top-0 p-6 shadow-sm">
      <div className="mb-8 flex items-center gap-3 pb-6 border-b border-slate-100">
        <div className="flex items-center">
          <Image src={logo} alt="SmartTech logo" className="h-12 w-12 rounded-xl object-cover shadow-md" />
        </div>
        <div>
          <div className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">SmartTech</div>
          <div className="text-xs text-slate-500 mt-0.5">Admin Panel</div>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname === item.href + "/" || pathname.startsWith(item.href + "/");
          return (
            <button
              key={item.key}
              onClick={() => router.push(item.href)}
              className={
                `w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ` +
                (active
                  ? "bg-gradient-to-r from-[#0b3b5c] to-[#1d4b6b] text-white shadow-lg scale-105"
                  : "text-slate-700 hover:bg-slate-50 hover:scale-102")
              }
              aria-current={active ? "page" : undefined}
            >
              <span className="w-6 h-6 flex items-center justify-center">
                {getIcon(item.key, active)}
              </span>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="absolute bottom-6 left-6 right-6 pt-6 border-t border-slate-100">
        <button
          onClick={() => setShowLogoutPopup(true)}
          className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium text-red-600 hover:bg-red-50 hover:scale-102"
        >
          <span className="w-6 h-6 flex items-center justify-center">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
            </svg>
          </span>
          <span>Logout</span>
        </button>
      </div>

      {showLogoutPopup &&
        typeof document !== "undefined" &&
        createPortal(
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
                    // clear client auth and redirect to admin login route
                    try {
                      if (typeof window !== "undefined") {
                        // Clear both user and admin tokens to fully logout
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        localStorage.removeItem("adminToken");
                          localStorage.removeItem("adminUser");
                          // notify other components/tabs
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
    </aside>
  );
}

function getIcon(key: string, active: boolean) {
  const color = active ? "text-white" : "text-slate-500";
  switch (key) {
    case "dashboard":
      return (
        <svg className={`${color} w-5 h-5`} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zM13 21h8V11h-8v10zm0-18v6h8V3h-8z" />
        </svg>
      );
    case "bookings":
      return (
        <svg className={`${color} w-5 h-5`} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H5V8h14v11z" />
        </svg>
      );
    case "technicians":
      return (
        <svg className={`${color} w-5 h-5`} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm6 2h-2a4 4 0 0 0-8 0H6a6 6 0 0 0-6 6v1h24v-1a6 6 0 0 0-6-6z" />
        </svg>
      );
    case "users":
      return (
        <svg className={`${color} w-5 h-5`} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V20h6v-3.5C23 14.17 18.33 13 16 13z" />
        </svg>
      );
    case "services":
      return (
        <svg className={`${color} w-5 h-5`} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case "analytics":
      return (
        <svg className={`${color} w-5 h-5`} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 13h4v8H3v-8zm7-6h4v14h-4V7zm7-4h4v18h-4V3z" />
        </svg>
      );
    default:
      return null;
  }
}
