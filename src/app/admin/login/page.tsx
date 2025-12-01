"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { sessionManager } from "@/lib/sessionManager";
import Toast from "@/components/Toast";
import React from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);

  useEffect(() => {
    const expired = searchParams.get('expired');
    const message = searchParams.get('message');
    const unauthorized = searchParams.get('unauthorized');
    
    if (expired === 'true' && message) {
      setErrorMessage(decodeURIComponent(message));
    } else if (unauthorized === 'true') {
      setErrorMessage('Please login to access admin panel');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.adminLogin(email, password);
      if (!res || res.message) {
        setToast({ message: res?.message || 'Login failed', type: 'error' });
        return;
      }

      // save token with timestamp using session manager
      if (typeof window !== "undefined") {
        sessionManager.storeToken('admin', res.token);
        localStorage.setItem("adminUser", JSON.stringify(res.admin || {}));
        // notify other components in this window/tab that adminUser changed
        window.dispatchEvent(new Event('storage'));
      }

      router.push("/admin/dashboard");
    } catch (err) {
      console.error(err);
      setToast({ message: 'Login failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl shadow-2xl p-12 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
            <div className="text-4xl font-bold text-blue-900">SMART</div>
          </div>
          <h1 className="text-white text-2xl font-semibold">Welcome to</h1>
          <p className="text-white text-sm">Smart Info Tech</p>
        </div>

        <div className="text-center mb-6">
          <p className="text-white text-sm">We truly value your trust.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-white text-xs flex items-center gap-1 mb-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your.email@mail.com"
              className="w-full px-4 py-2 rounded-lg bg-transparent border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white"
              required
            />
          </div>

          <div>
            <label className="text-white text-xs flex items-center gap-1 mb-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              className="w-full px-4 py-2 rounded-lg bg-transparent border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white"
              required
            />
          </div>

          {errorMessage && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-sm text-white">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {errorMessage}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 px-6 rounded-full transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-slate-600">Loading...</div></div>}>
      <LoginForm />
    </Suspense>
  );
}

