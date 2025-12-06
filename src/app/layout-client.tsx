"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Login from "./login/page";
import Signup from "./signup/page";
import { NotificationProvider } from "../contexts/NotificationContext";
import MobileBottomNav from "../components/MobileBottomNav";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const [openLogin, setOpenLogin] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();
  const pathname = usePathname() || "/";

  // If we're on any admin route, render children only (no site navbar/footer or modals)
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  if (isAdminRoute) return <>{children}</>;

  // Show mobile nav on specific pages
  const showMobileNav = pathname === '/dashboard' || pathname === '/profile' || pathname === '/book' || pathname === '/services' || pathname === '/user-login';

  const handleLoginSuccess = () => {
    setOpenLogin(false);
    setOpenSignup(false);
    setRefreshKey(prev => prev + 1);
    router.push("/dashboard");
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setRefreshKey(prev => prev + 1);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <NotificationProvider>
      <Navbar 
        key={refreshKey}
        onDashboardClick={() => setOpenLogin(true)} 
      />

      {openLogin && (
        <Login 
          onClose={() => setOpenLogin(false)} 
          onLoginSuccess={handleLoginSuccess}
          onOpenSignup={() => { setOpenLogin(false); setOpenSignup(true); }}
        />
      )}

      {openSignup && (
        <Signup
          onClose={() => setOpenSignup(false)} 
          onSignupSuccess={handleLoginSuccess}
          onOpenLogin={() => { setOpenSignup(false); setOpenLogin(true); }}
        />
      )}

      <div className={showMobileNav ? 'pb-20 md:pb-0' : ''}>
        {children}
      </div>

      {/* Mobile Bottom Navigation */}
      {showMobileNav && <MobileBottomNav />}

      <Footer />
    </NotificationProvider>
  );
}
