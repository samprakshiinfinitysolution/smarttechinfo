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
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);

  const handleSignup = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      setToast({ message: "Please fill name, email and password.", type: 'warning' });
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
      const res = await fetch("http://localhost:5000/api/auth/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email, password, phone }),
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
    <div onClick={handleClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-5xl bg-white/10 backdrop-blur-xl shadow-xl rounded-xl flex flex-col md:flex-row p-10 border border-white/20">

        <button
          onClick={handleClose}
          aria-label="Close signup"
          className="absolute top-4 right-4 text-white text-2xl font-bold cursor-pointer"
        >
          &times;
        </button>

        {/* LEFT SECTION */}
        <div className="md:w-1/2 text-white pr-8 mb-10 md:mb-0">
          <h1 className="text-4xl font-bold mb-2">Create your</h1>
          <h2 className="text-xl font-medium">Smart TechInfo</h2>
          <h2 className="text-xl font-medium mb-6">Account</h2>

          <div className="w-64 h-64 bg-white rounded-full flex items-center justify-center shadow-lg mt-6">
            <img src="/LOGO1.png" alt="Smart Logo" className="w-44" />
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="md:w-1/2 text-white">

          <h2 className="text-lg mb-6">Join us and enjoy smart services!</h2>

          <label className="text-sm font-medium flex items-center gap-2 mb-1">
            <span>👤</span> Full Name
          </label>
          <input
            type="text"
            placeholder="Your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-transparent border border-white/50 rounded-lg px-4 py-3 mb-5 focus:outline-none focus:border-white"
          />

          <label className="text-sm font-medium flex items-center gap-2 mb-1">
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
            className={`w-full bg-transparent border rounded-lg px-4 py-3 mb-1 focus:outline-none ${
              emailError ? 'border-red-500' : 'border-white/50 focus:border-white'
            }`}
          />
          {emailError && <p className="text-red-400 text-xs mb-4">{emailError}</p>}
          {!emailError && <div className="mb-4"></div>}

          <label className="text-sm font-medium flex items-center gap-2 mb-1">
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
            className={`w-full bg-transparent border rounded-lg px-4 py-3 mb-1 focus:outline-none ${
              phoneError ? 'border-red-500' : 'border-white/50 focus:border-white'
            }`}
          />
          {phoneError && <p className="text-red-400 text-xs mb-4">{phoneError}</p>}
          {!phoneError && <div className="mb-4"></div>}

          

          <label className="text-sm font-medium flex items-center gap-2 mb-1">
            <span>🔒</span> Password
          </label>
          <input
            type="password"
            placeholder="Password*****"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border border-white/50 rounded-lg px-4 py-3 mb-3 focus:outline-none focus:border-white"
          />

          {/* Avatar upload removed: backend register route expects JSON (name/email/password) */}

          <p className="text-sm mb-6">
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
            className="w-full bg-black/60 hover:bg-black text-white font-semibold py-3 rounded-full"
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
