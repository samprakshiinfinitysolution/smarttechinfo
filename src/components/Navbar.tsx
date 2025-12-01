"use client";

import { useEffect, useRef, useState } from "react";
import { Phone, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";

export default function Navbar({
  onDashboardClick,
}: {
  onDashboardClick: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

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
    };
    checkAuth();
  }, []);

  // GSAP Animations
  useEffect(() => {
    if (!mounted) return;
    if (!navbarRef.current) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(navbarRef.current, { opacity: 0, y: -20, duration: 0.7 });

    if (logoRef.current) {
      tl.from(logoRef.current, { opacity: 0, x: -30, duration: 0.6 });
    }

    if (menuItemsRef.current.length) {
      gsap.from(menuItemsRef.current, {
        opacity: 0,
        y: 15,
        duration: 0.6,
        stagger: 0.15,
        ease: "power2.out",
      });
    }

    if (phoneRef.current && bookRef.current) {
      gsap.from([phoneRef.current, bookRef.current], {
        opacity: 0,
        scale: 0.9,
        duration: 0.6,
        stagger: 0.2,
        ease: "back.out(1.6)",
      });
    }
  }, [mounted]);

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
    <nav ref={navbarRef} className="w-full bg-white text-black shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-6">

        {/* Logo */}
        <Link href="/">
          <img
            ref={logoRef}
            src="/LOGO1.png"
            className="w-14 h-14"
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

          {/* User Menu */}
          {isLoggedIn && (
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
          className="md:hidden" 
          onClick={() => setOpen(!open)}
          aria-label="Toggle mobile menu"
          aria-expanded={open}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mounted && (
        <div
          ref={mobileMenuRef}
          className={`md:hidden transition-all overflow-hidden ${
            open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          } bg-white border-t`}
        >
          <ul className="flex flex-col gap-5 py-5 px-6 text-gray-700 font-medium">
            <li>
              <Link href="/">Home</Link>
            </li>

            <li className="hover:text-blue-700 cursor-pointer">
              <Link href="/services">Services</Link>
            </li>

            {!isLoggedIn ? (
              <li onClick={onDashboardClick} className="hover:text-blue-700 cursor-pointer">
                Login
              </li>
            ) : (
              <li onClick={() => router.push("/dashboard")} className="hover:text-blue-700 cursor-pointer">
                Dashboard
              </li>
            )}

            {!isLoggedIn && (
              <li>
                <a href="#testimonials">Happy Customers</a>
              </li>
            )}

            <div className="flex flex-col gap-2 mt-4">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href="tel:919685530890" className="underline">
                  9685530890
                </a>
              </div>

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
                className="bg-[#0C1B33] text-white px-5 py-2 rounded-lg inline-block text-center hover:bg-[#16294d] transition-colors"
              >
                Book Now
              </button>

              {isLoggedIn && (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                      {userName.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{userName}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              )}
            </div>
          </ul>
        </div>
      )}
    </nav>
  );
}
