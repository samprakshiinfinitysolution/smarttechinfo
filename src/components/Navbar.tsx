"use client";

import { useEffect, useRef, useState } from "react";
import { Phone, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import NotificationPanel from "./NotificationPanel";
import { useNotifications } from "../contexts/NotificationContext";

export default function Navbar({
  onDashboardClick,
}: {
  onDashboardClick: () => void;
}) {
  const router = useRouter();
  const { fetchNotifications } = useNotifications();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const menuItemsRef = useRef<(HTMLLIElement | null)[]>([]);
  const phoneRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLButtonElement>(null);

  // Check login status on mount and when component updates
  useEffect(() => {
    setMounted(true);
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      if (token && user) {
        setIsLoggedIn(true);
        const userData = JSON.parse(user);
        setUserName(userData.name || "User");
      } else {
        setIsLoggedIn(false);
        setUserName("");
      }
      setLoading(false);
    };
    checkAuth();
  }, []);



  // Mobile Menu Animation
  useEffect(() => {
    if (!mounted) return;
    if (!open || !mobileMenuRef.current) return;

    gsap.fromTo(
      mobileMenuRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }
    );
  }, [open, mounted]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showUserMenu && !(e.target as Element).closest('.relative')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserName("");
    setShowUserMenu(false);
    window.dispatchEvent(new Event("storage"));
    router.push("/");
  };

  const handleDashboardClick = () => {
    if (isLoggedIn) {
      router.push("/dashboard");
    } else {
      onDashboardClick();
    }
  };

  return (
    <nav ref={navbarRef} className="w-full bg-white/95 backdrop-blur-lg text-black shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img
            ref={logoRef}
            src="/LOGO1.png"
            className="w-14 h-14 object-contain"
            alt="Logo"
          />
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-10 text-gray-700 font-medium">
          <li ref={(el) => { if (el) menuItemsRef.current[0] = el; }}>
            <Link href="/">Home</Link>
          </li>

          <li
            ref={(el) => { if (el) menuItemsRef.current[1] = el; }}
            className="cursor-pointer hover:text-blue-700"
          >
            <Link href="/services">Services</Link>
          </li>

          {!isLoggedIn ? (
            <li
              ref={(el) => { if (el) menuItemsRef.current[2] = el; }}
              className="hover:text-blue-700 cursor-pointer"
              onClick={onDashboardClick}
            >
              Login
            </li>
          ) : (
            <li
              ref={(el) => { if (el) menuItemsRef.current[2] = el; }}
              className="hover:text-blue-700 cursor-pointer"
              onClick={() => router.push("/dashboard")}
            >
              Dashboard
            </li>
          )}

          {!isLoggedIn && (
            <li ref={(el) => { if (el) menuItemsRef.current[3] = el; }}>
              <a href="#testimonials">Happy Customers</a>
            </li>
          )}
        </ul>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-6">
          <div ref={phoneRef} className="flex items-center gap-1 text-gray-700">
            <Phone className="w-4 h-4" />
            <a href="tel:919685530890" className="underline">
              9685530890
            </a>
          </div>

          <button
            ref={bookRef}
            onClick={() => {
              const token = localStorage.getItem("token");
              if (!token) {
                router.push("/user-login?redirect=/book");
              } else {
                router.push("/book");
              }
            }}
            className="bg-[#0C1B33] text-white px-5 py-2 rounded-lg inline-block hover:bg-[#16294d] transition-colors"
          >
            Book Now
          </button>

          {/* Notifications */}
          {isLoggedIn && <NotificationPanel />}

          {/* User Menu */}
          {loading ? (
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg animate-pulse">
              <div className="w-8 h-8 rounded-full bg-gray-300"></div>
              <div className="w-20 h-4 bg-gray-300 rounded"></div>
            </div>
          ) : isLoggedIn && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                  {userName.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-700">{userName}</span>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      router.push("/profile");
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      router.push("/dashboard");
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    My Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors" 
          onClick={() => setOpen(!open)}
          aria-label="Toggle mobile menu"
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mounted && (
        <div
          ref={mobileMenuRef}
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          } bg-white border-t shadow-lg`}
        >
          <div className="py-4 px-4">
            {/* Navigation Links */}
            <div className="space-y-1 mb-6">
              <Link 
                href="/" 
                className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors font-medium"
                onClick={() => setOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/services" 
                className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors font-medium"
                onClick={() => setOpen(false)}
              >
                Services
              </Link>
              {!isLoggedIn ? (
                <button 
                  onClick={() => { onDashboardClick(); setOpen(false); }} 
                  className="w-full text-left px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors font-medium"
                >
                  Login
                </button>
              ) : (
                <button 
                  onClick={() => { router.push("/dashboard"); setOpen(false); }} 
                  className="w-full text-left px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors font-medium"
                >
                  Dashboard
                </button>
              )}
              {!isLoggedIn && (
                <a 
                  href="#testimonials" 
                  className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors font-medium"
                  onClick={() => setOpen(false)}
                >
                  Happy Customers
                </a>
              )}
            </div>

            {/* Contact & Actions */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <a 
                href="tel:919685530890" 
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <Phone className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-700">Call: 9685530890</span>
              </a>

              <button 
                onClick={() => {
                  const token = localStorage.getItem("token");
                  if (!token) {
                    router.push("/user-login?redirect=/book");
                  } else {
                    router.push("/book");
                  }
                  setOpen(false);
                }}
                className="w-full bg-gradient-to-r from-[#0C1B33] to-[#1e3a5f] text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg active:scale-95 transition-all duration-200"
              >
                Book Service Now
              </button>

              {isLoggedIn && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {userName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{userName}</p>
                      <p className="text-sm text-gray-600">Logged in</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { handleLogout(); setOpen(false); }}
                    className="w-full bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
