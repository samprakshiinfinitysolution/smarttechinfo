"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Toast from "@/components/Toast";
import { LogIn, Sparkles } from "lucide-react";

interface LoginProps {
  onClose?: () => void;
  onLoginSuccess?: () => void;
  onOpenSignup?: () => void;
}

export default function LoginPage({
  onClose,
  onLoginSuccess,
  onOpenSignup,
}: LoginProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get("redirect");
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);
  const [showWelcome, setShowWelcome] = useState(!!redirectUrl);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) {
        onClose();
      } else {
        router.push("/");
      }
    }, 250);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setToast({ message: "Please enter email and password", type: "warning" });
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setToast({ message: data.message || "Login failed", type: "error" });
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("storage"));

      setToast({ message: "Login successful! Redirecting...", type: "success" });
      
      setTimeout(() => {
        if (redirectUrl) {
          router.push(redirectUrl);
        } else if (onLoginSuccess) {
          onLoginSuccess();
          onClose?.();
        } else {
          router.push("/dashboard");
        }
      }, 1000);
    } catch (error) {
      console.error(error);
      setToast({ message: "Backend server not running", type: "error" });
    }
  };

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      {showWelcome && redirectUrl && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold">Almost there! Just login to book</span>
        </div>
      )}
      
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-4xl bg-white/10 backdrop-blur-xl shadow-xl rounded-xl flex flex-col md:flex-row p-6 md:p-10 border border-white/20 transition-all duration-300 ${isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-white text-3xl font-bold cursor-pointer hover:scale-110 transition-transform"
        >
          &times;
        </button>

        {/* LEFT */}
        <div className="md:w-1/2 text-white md:pr-8 mb-8 md:mb-0 flex flex-col items-center md:items-start">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Welcome to</h1>
          <h2 className="text-lg sm:text-xl font-medium">Smart TechInfo</h2>

          <div className="w-40 h-40 sm:w-56 sm:h-56 bg-white rounded-full flex items-center justify-center shadow-lg mt-6">
            <img src="/LOGO1.png" alt="Smart Logo" className="w-24 sm:w-40" />
          </div>
        </div>

        {/* RIGHT */}
        <div className="md:w-1/2 text-white w-full max-w-md mx-auto">
          <h2 className="text-base sm:text-lg mb-6 text-center md:text-left">
            We truly value your trust.
          </h2>

          <label className="text-xs sm:text-sm font-medium flex items-center gap-2 mb-1">
            <span>📧</span> Email address
          </label>
          <input
            type="email"
            placeholder="Your email@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent border border-white/50 rounded-lg px-3 py-2 sm:px-4 sm:py-3 mb-4 focus:outline-none focus:border-white"
          />

          <label className="text-xs sm:text-sm font-medium flex items-center gap-2 mb-1">
            <span>🔒</span> Password
          </label>
          <input
            type="password"
            placeholder="Password*****"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full bg-transparent border border-white/50 rounded-lg px-3 py-2 sm:px-4 sm:py-3 mb-3 focus:outline-none focus:border-white"
          />

          <p className="text-xs sm:text-sm mb-6 text-center md:text-left">
            Don't have an account?{" "}
            <button
              onClick={() => {
                if (onOpenSignup) return onOpenSignup();
                router.push('/signup');
              }}
              className="underline hover:text-blue-300 transition-colors"
            >
              Create An Account
            </button>
          </p>

          <button
            onClick={handleLogin}
            className="w-full bg-black/60 hover:bg-black text-white font-semibold py-2 sm:py-3 rounded-full flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <LogIn className="w-5 h-5" />
            {redirectUrl ? "Login & Continue Booking" : "Login"}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
