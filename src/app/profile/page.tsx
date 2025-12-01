"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Save,
  X,
  Shield,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import Toast from "@/components/Toast";
import LocationPicker from "@/components/LocationPicker";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [bookingsCount, setBookingsCount] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [emailChanged, setEmailChanged] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (userData && token) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        name: parsedUser.name || "",
        email: parsedUser.email || "",
        phone: parsedUser.phone || "",
        address: parsedUser.address || "",
      });
      
      // Fetch bookings count using same API as dashboard
      api.getMyBookings(token)
        .then((data) => {
          setBookingsCount(data.length);
        })
        .catch((err) => {
          console.error('Error fetching bookings:', err);
          setBookingsCount(0);
        });
    } else {
      router.push("/");
    }
  }, [router]);

  // Listen for storage updates so profile updates live when another part of the app (admin or another tab)
  // updates the `localStorage.user` value and dispatches a storage event.
  useEffect(() => {
    const onStorage = () => {
      try {
        const s = localStorage.getItem('user');
        if (s) {
          const parsed = JSON.parse(s);
          setUser(parsed);
          setFormData({
            name: parsed.name || "",
            email: parsed.email || "",
            phone: parsed.phone || "",
            address: parsed.address || "",
          });
        }
      } catch (e) {
        console.error('Failed to parse user from storage event', e);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleSendOTP = async () => {
    try {
      setVerifying(true);
      const res = await fetch("http://localhost:5000/api/otp/send-otp-email-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setToast({ message: data.message || "Failed to send OTP", type: "error" });
        setVerifying(false);
        return;
      }

      setOtpSent(true);
      setToast({ message: "OTP sent to new email!", type: "success" });
      setVerifying(false);
    } catch (error) {
      setToast({ message: "Failed to send OTP", type: "error" });
      setVerifying(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setVerifying(true);
      const res = await fetch("http://localhost:5000/api/otp/verify-otp-email-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });

      const data = await res.json();
      if (!res.ok) {
        setToast({ message: data.message || "Invalid OTP", type: "error" });
        setVerifying(false);
        return;
      }

      setToast({ message: "Email verified! Updating profile...", type: "success" });
      setShowOtpVerification(false);
      setOtpSent(false);
      setOtp("");
      await saveProfile();
      setVerifying(false);
    } catch (error) {
      setToast({ message: "Failed to verify OTP", type: "error" });
      setVerifying(false);
    }
  };

  const saveProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setToast({ message: "Please login again", type: "error" });
        return;
      }

      const updatedUser = await api.updateProfile(token, formData);
      
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      setEmailChanged(false);
      window.dispatchEvent(new Event("storage"));
      setToast({ message: "Profile updated successfully!", type: "success" });
    } catch (error) {
      setToast({ message: "Failed to update profile", type: "error" });
    }
  };

  const handleSave = async () => {
    // Check if email changed
    if (formData.email !== user?.email) {
      setShowOtpVerification(true);
      setEmailChanged(true);
      return;
    }
    
    // If email not changed, save directly
    await saveProfile();
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
    setIsEditing(false);
    setShowOtpVerification(false);
    setOtpSent(false);
    setOtp("");
    setEmailChanged(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-8">
      <div className="max-w-5xl mx-auto px-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        <div className="bg-gradient-to-r from-[#0C1B33] to-[#1e3a5f] rounded-2xl p-8 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl font-bold border-4 border-white/30">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{user?.name || "User"}</h1>
                <p className="text-blue-200">{user?.email || "user@example.com"}</p>
                <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-200 rounded-full text-xs font-semibold border border-emerald-400/30 mt-2">
                  Active Member
                </span>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all border border-white/30"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Personal Information</h2>

              <div className="space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border-2 border-slate-400 rounded-xl px-4 py-3 bg-white text-slate-900 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  ) : (
                    <p className="text-slate-900 font-medium bg-slate-50 px-4 py-3 rounded-xl">
                      {user?.name || "Not provided"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full border-2 border-slate-400 rounded-xl px-4 py-3 bg-white text-slate-900 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                      {formData.email !== user?.email && (
                        <p className="text-xs text-amber-600 flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Email change requires OTP verification
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-900 font-medium bg-slate-50 px-4 py-3 rounded-xl">
                      {user?.email || "Not provided"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full border-2 border-slate-400 rounded-xl px-4 py-3 bg-white text-slate-900 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  ) : (
                    <p className="text-slate-900 font-medium bg-slate-50 px-4 py-3 rounded-xl">
                      {formData.phone || "Not provided"}
                    </p>
                  )}
                </div>

                <div>
                  {isEditing ? (
                    <LocationPicker
                      address={formData.address}
                      setAddress={(addr) => setFormData({ ...formData, address: addr })}
                      onLocationSelect={(lat, lng) => setLocationCoords({ lat, lng })}
                    />
                  ) : (
                    <>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                        <MapPin className="w-4 h-4" />
                        Address
                      </label>
                      <p className="text-slate-900 font-medium bg-slate-50 px-4 py-3 rounded-xl">
                        {formData.address || "Not provided"}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {isEditing && !showOtpVerification && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-gradient-to-r from-[#0C1B33] to-[#1e3a5f] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                  >
                    <Save className="w-5 h-5" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                </div>
              )}

              {showOtpVerification && (
                <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-slate-900">Verify New Email</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    We need to verify your new email: <span className="font-semibold">{formData.email}</span>
                  </p>

                  {!otpSent ? (
                    <button
                      onClick={handleSendOTP}
                      disabled={verifying}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      <Mail className="w-5 h-5" />
                      {verifying ? "Sending..." : "Send OTP"}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                          Enter 6-digit OTP
                        </label>
                        <input
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          maxLength={6}
                          placeholder="000000"
                          className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 text-center text-2xl tracking-widest font-bold focus:border-blue-500 focus:outline-none text-slate-900 bg-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleVerifyOTP}
                          disabled={verifying || otp.length !== 6}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          {verifying ? "Verifying..." : "Verify & Save"}
                        </button>
                        <button
                          onClick={() => { setOtpSent(false); setOtp(''); }}
                          className="px-6 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl font-semibold transition-all border-2 border-blue-300"
                        >
                          Resend
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleCancel}
                    className="w-full mt-3 text-sm text-slate-600 hover:text-slate-900 underline"
                  >
                    Cancel email change
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#0C1B33] to-[#1e3a5f] rounded-2xl p-6 shadow-lg text-white">
              <h3 className="font-bold text-lg mb-4">Account Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-200 text-sm">Member Since</span>
                  <span className="font-semibold">{new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-200 text-sm">Total Bookings</span>
                  <span className="font-semibold">{bookingsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-200 text-sm">Account Status</span>
                  <span className="font-semibold text-emerald-300">Active</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
              <h3 className="font-bold text-slate-900 mb-4">Quick Links</h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl transition-all text-slate-700 font-medium"
                >
                  📊 Dashboard
                </button>
                <button
                  onClick={() => router.push("/Book")}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl transition-all text-slate-700 font-medium"
                >
                  📅 Book Service
                </button>
                <button
                  onClick={() => router.push("/services")}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl transition-all text-slate-700 font-medium"
                >
                  🔧 Services
                </button>
              </div>
            </div>
          </div>
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
