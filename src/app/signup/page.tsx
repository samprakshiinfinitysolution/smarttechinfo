"use client";

import { useState } from "react";
import Toast from "@/components/Toast";
import { useRouter } from "next/navigation";

interface SignupProps {
  onClose?: () => void;
  onSignupSuccess?: () => void;
  onOpenLogin?: () => void;
}

export default function SignupPage({
  onClose,
  onSignupSuccess,
  onOpenLogin,
}: SignupProps) {
  const router = useRouter();

  // NEW: States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);

  const handleSignup = async () => {
    if (!fullName.trim() || !email.trim()) {
      setToast({ message: "Please fill name and email.", type: 'warning' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setToast({ message: "Please enter a valid email address", type: 'warning' });
      return;
    }

    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      setToast({ message: "Please enter a valid 10-digit Indian phone number", type: 'warning' });
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/auth/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email, phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setToast({ message: data.message || "Signup failed", type: 'error' });
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("storage"));

      if (typeof onSignupSuccess === "function") {
        onSignupSuccess();
      } else {
        router.push("/dashboard");
      }

      if (typeof onClose === "function") onClose();
    } catch (error) {
      console.error(error);
      setToast({ message: "Something went wrong. Make sure backend is running.", type: 'error' });
    }
  };

  const handleClose = () => {
    if (typeof onClose === "function") onClose();
    else router.push('/');
  };

  return (
    <div onClick={handleClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-5xl bg-white/10 backdrop-blur-xl shadow-xl rounded-xl flex flex-col md:flex-row p-6 md:p-10 border border-white/20 my-4">

        <button
          onClick={handleClose}
          aria-label="Close signup"
          className="absolute top-3 right-3 text-white text-2xl font-bold cursor-pointer z-10"
        >
          &times;
        </button>

        {/* LEFT SECTION */}
        <div className="md:w-1/2 text-white md:pr-8 mb-6 md:mb-0 text-center md:text-left">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">Create your</h1>
          <h2 className="text-lg md:text-xl font-medium">Smart TechInfo</h2>
          <h2 className="text-lg md:text-xl font-medium mb-4 md:mb-6">Account</h2>

          <div className="w-32 h-32 md:w-48 md:h-48 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto md:mx-0 mt-4 md:mt-6">
            <img src="/LOGO1.png" alt="Smart Logo" className="w-24 md:w-36" />
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="md:w-1/2 text-white">

          <h2 className="text-base md:text-lg mb-4 md:mb-6">Join us and enjoy smart services!</h2>

          <label className="text-xs md:text-sm font-medium flex items-center gap-2 mb-1">
            <span>👤</span> Full Name
          </label>
          <input
            type="text"
            placeholder="Your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-transparent border border-white/50 rounded-lg px-3 md:px-4 py-2 md:py-3 mb-4 md:mb-5 text-sm md:text-base focus:outline-none focus:border-white"
          />

          <label className="text-xs md:text-sm font-medium flex items-center gap-2 mb-1">
            <span>📧</span> Email Address
          </label>
          <input
            type="email"
            placeholder="Your email@gmail.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (e.target.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) {
                setEmailError('Enter a valid email address');
              } else {
                setEmailError('');
              }
            }}
            className={`w-full bg-transparent border rounded-lg px-3 md:px-4 py-2 md:py-3 mb-1 text-sm md:text-base focus:outline-none ${
              emailError ? 'border-red-500' : 'border-white/50 focus:border-white'
            }`}
          />
          {emailError && <p className="text-red-400 text-xs mb-3 md:mb-4">{emailError}</p>}
          {!emailError && <div className="mb-3 md:mb-4"></div>}

          <label className="text-xs md:text-sm font-medium flex items-center gap-2 mb-1">
            <span>📱</span> Phone Number (Optional)
          </label>
          <input
            type="tel"
            placeholder="9876543210"
            value={phone}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setPhone(val);
              if (val && !/^[6-9]\d{9}$/.test(val)) {
                setPhoneError('Enter valid 10-digit number starting with 6-9');
              } else {
                setPhoneError('');
              }
            }}
            maxLength={10}
            className={`w-full bg-transparent border rounded-lg px-3 md:px-4 py-2 md:py-3 mb-1 text-sm md:text-base focus:outline-none ${
              phoneError ? 'border-red-500' : 'border-white/50 focus:border-white'
            }`}
          />
          {phoneError && <p className="text-red-400 text-xs mb-3 md:mb-4">{phoneError}</p>}
          {!phoneError && <div className="mb-3 md:mb-4"></div>}

          <p className="text-xs md:text-sm mb-4 md:mb-6">
            Already have an account?{" "}
            <button
              onClick={() => {
                if (typeof onOpenLogin === "function") onOpenLogin();
                else router.push("/login");
              }}
              className="underline"
            >
              Login
            </button>
          </p>

          <button
            onClick={handleSignup}
            className="w-full bg-black/60 hover:bg-black text-white font-semibold py-2.5 md:py-3 rounded-full text-sm md:text-base"
          >
            Create Account
          </button>
        </div>
      </div>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
