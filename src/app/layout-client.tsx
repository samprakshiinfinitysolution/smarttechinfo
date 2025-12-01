"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Login from "./login/page";
import Signup from "./signup/page";

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
    <>
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

      {children}

      <Footer />
    </>
  );
}
