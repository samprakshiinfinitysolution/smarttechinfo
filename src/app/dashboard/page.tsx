"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CheckCircle,
  Wallet,
  BookOpen,
  UserCircle,
  LogOut,
  MapPin,
  User as UserIcon,
  Loader2,
  Clock,
  Phone,
  Wrench,
  TrendingUp,
  Award,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import Toast from "@/components/Toast";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("active");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (userData && token) {
      setUser(JSON.parse(userData));
      fetchBookings(token);
    } else {
      router.push("/");
    }
  }, [router]);

  const fetchBookings = async (token: string) => {
    try {
      setLoading(true);
      const data = await api.getMyBookings(token);
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setShowLogoutModal(false);
    window.dispatchEvent(new Event("storage"));
    router.push("/");
  };

  const activeBookings = bookings.filter(
    (b) => b.status !== "Completed" && b.status !== "Cancelled"
  );
  const completedBookings = bookings.filter(
    (b) => b.status === "Completed" || b.status === "Cancelled"
  );

  const totalBookings = bookings.length;
  const activeCount = activeBookings.length;
  const completedCount = bookings.filter((b) => b.status === "Completed").length;
  const totalSpent = bookings
    .filter((b) => b.status === "Completed")
    .reduce((sum, b) => sum + (b.amount || 0), 0);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-6 pt-8">
        {/* Header Section */}
        <div className="mb-6">
          <p className="text-slate-600 text-sm mb-1">Welcome back,</p>
          <h1 className="text-3xl font-bold text-slate-900">{user?.name || "User"} 👋</h1>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-slate-500 mb-1">Total Bookings</p>
            <h3 className="text-3xl font-bold text-slate-900">{totalBookings}</h3>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm text-slate-500 mb-1">Active</p>
            <h3 className="text-3xl font-bold text-slate-900">{activeCount}</h3>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                +{completedCount}
              </span>
            </div>
            <p className="text-sm text-slate-500 mb-1">Completed</p>
            <h3 className="text-3xl font-bold text-slate-900">{completedCount}</h3>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-slate-500 mb-1">Total Spent</p>
            <h3 className="text-3xl font-bold text-slate-900">₹{totalSpent}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
          {/* Bookings Section */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-lg">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">My Bookings</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("active")}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      activeTab === "active"
                        ? "bg-[#0C1B33] text-white shadow-md"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      activeTab === "history"
                        ? "bg-[#0C1B33] text-white shadow-md"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    History
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="space-y-4">
                  {(activeTab === "active" ? activeBookings : completedBookings).length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-10 h-10 text-slate-300" />
                      </div>
                      <p className="text-slate-500 font-medium">No bookings found</p>
                      <button
                        onClick={() => router.push("/book")}
                        className="mt-4 bg-[#0C1B33] text-white px-6 py-2 rounded-lg hover:bg-[#1e3a5f] transition-colors"
                      >
                        Book a Service
                      </button>
                    </div>
                  ) : (
                    (activeTab === "active" ? activeBookings : completedBookings).map((booking) => (
                      <div
                        key={booking._id}
                        className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all bg-gradient-to-br from-white to-slate-50"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                              <Wrench className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-slate-900">{booking.service}</h3>
                              <p className="text-sm text-slate-500">Booking #{booking._id.slice(-6)}</p>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              booking.status === "Scheduled"
                                ? "bg-blue-100 text-blue-700"
                                : booking.status === "In Progress"
                                ? "bg-amber-100 text-amber-700"
                                : booking.status === "Completed"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <UserIcon className="w-4 h-4 text-slate-400" />
                            <span>{booking.technician?.name || "Assigning..."}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>{formatDate(booking.date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span>{booking.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <Wallet className="w-4 h-4 text-emerald-500" />
                            <span>₹{booking.amount}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowDetailsModal(true);
                            }}
                            className="flex-1 bg-[#0C1B33] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#1e3a5f] transition-colors"
                          >
                            View Details
                          </button>
                          {booking.status === "Completed" && !booking.rating && (
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowRatingModal(true);
                              }}
                              className="bg-yellow-50 text-yellow-700 px-4 py-2.5 rounded-lg hover:bg-yellow-100 transition-colors text-sm font-medium"
                            >
                              Rate Service
                            </button>
                          )}
                          {booking.rating && (
                            <div className="flex items-center gap-1 px-3 py-2 bg-yellow-50 rounded-lg">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={`text-lg ${i < booking.rating ? 'text-yellow-500' : 'text-slate-300'}`}>★</span>
                              ))}
                            </div>
                          )}
                          {booking.status !== "Completed" && booking.status !== "Cancelled" && (
                            <>
                              <button className="bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-lg hover:bg-emerald-100 transition-colors">
                                <Phone className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setRescheduleDate(booking.date);
                                  setRescheduleTime(booking.time);
                                  setShowRescheduleModal(true);
                                }}
                                className="bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                              >
                                Reschedule
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0C1B33] to-[#1e3a5f] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    {user?.name || "User"}
                    <span className="text-blue-500">✓</span>
                  </h3>
                  <p className="text-sm text-slate-600">{user?.email || "user@example.com"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => router.push("/profile")}
                  className="w-full flex items-center gap-3 text-slate-700 hover:bg-slate-100 py-3 px-4 rounded-xl transition-all"
                >
                  <UserCircle className="w-5 h-5 text-slate-400" />
                  <span className="font-medium">Profile</span>
                </button>

                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full flex items-center gap-3 text-red-600 hover:bg-red-50 py-3 px-4 rounded-xl transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-[#0C1B33] to-[#1e3a5f] rounded-2xl p-6 shadow-lg text-white">
              <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/book")}
                  className="w-full text-left px-4 py-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all font-medium border border-white/20"
                >
                  📅 Book New Service
                </button>
                <button
                  onClick={() => router.push("/services")}
                  className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-xl transition-all"
                >
                  🔧 View All Services
                </button>
                <button
                  onClick={() => router.push("/contact")}
                  className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-xl transition-all"
                >
                  💬 Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0C1B33] to-[#1e3a5f] text-white p-6 rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Booking Details</h2>
                    <p className="text-sm text-blue-200">#{selectedBooking._id.slice(-6)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Service Info Card */}
              <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-5 mb-6 border border-blue-100">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{selectedBooking.service}</h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedBooking.status === "Scheduled"
                        ? "bg-blue-100 text-blue-700"
                        : selectedBooking.status === "In Progress"
                        ? "bg-amber-100 text-amber-700"
                        : selectedBooking.status === "Completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {selectedBooking.status}
                  </span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-600 mb-2">
                    <UserIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">Technician</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">
                    {selectedBooking.technician?.name || "Assigning..."}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-600 mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm font-medium">Date</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">{formatDate(selectedBooking.date)}</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-600 mb-2">
                    <Clock className="w-5 h-5" />
                    <span className="text-sm font-medium">Time</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">{selectedBooking.time}</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
                  <div className="flex items-center gap-2 text-emerald-700 mb-2">
                    <Wallet className="w-5 h-5" />
                    <span className="text-sm font-medium">Amount</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">₹{selectedBooking.amount}</p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6 rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Reschedule Booking</h2>
                    <p className="text-sm text-orange-100">Choose new date and time</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Current Booking Info */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 mb-6 border border-amber-200">
                <p className="text-sm text-amber-700 mb-1">Current Service</p>
                <p className="text-xl font-bold text-slate-900">{selectedBooking.service}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedBooking.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedBooking.time}
                  </span>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    New Date
                  </label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full border-2 border-slate-400 rounded-xl px-4 py-3 bg-white text-slate-900 focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Clock className="w-4 h-4" />
                    New Time Slot
                  </label>
                  <select
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full border-2 border-slate-400 rounded-xl px-4 py-3 bg-white text-slate-900 focus:border-amber-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select time slot</option>
                    <option value="9:00 AM – 11:00 AM">9:00 AM – 11:00 AM</option>
                    <option value="11:00 AM – 1:00 PM">11:00 AM – 1:00 PM</option>
                    <option value="1:00 PM – 3:00 PM">1:00 PM – 3:00 PM</option>
                    <option value="3:00 PM – 5:00 PM">3:00 PM – 5:00 PM</option>
                    <option value="5:00 PM – 7:00 PM">5:00 PM – 7:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!rescheduleDate || !rescheduleTime) {
                      setToast({ message: "Please select date and time", type: "warning" });
                      return;
                    }
                    
                    try {
                      const token = localStorage.getItem("token");
                      await api.updateBooking(token!, selectedBooking._id, {
                        date: rescheduleDate,
                        time: rescheduleTime
                      });
                      
                      setToast({ message: "Booking rescheduled successfully!", type: "success" });
                      setShowRescheduleModal(false);
                      fetchBookings(token!);
                    } catch (error) {
                      setToast({ message: "Failed to reschedule booking", type: "error" });
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-300/30 transition-all"
                >
                  Confirm Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Rate Service</h2>
                    <p className="text-sm text-orange-100">Share your experience</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowRatingModal(false); setRating(5); setReviewText(""); }}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-5 mb-6 border border-yellow-200">
                <p className="text-sm text-yellow-700 mb-1">Service</p>
                <p className="text-xl font-bold text-slate-900">{selectedBooking.service}</p>
                <p className="text-sm text-slate-600 mt-2">Technician: {selectedBooking.technician?.name}</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">Rating</label>
                <div className="flex gap-2 justify-center">
                  {[1,2,3,4,5].map(r => (
                    <button
                      key={r}
                      onClick={() => setRating(r)}
                      className={`text-5xl transition-all hover:scale-110 ${r <= rating ? 'text-yellow-500' : 'text-slate-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Review (Optional)</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full border-2 border-slate-300 rounded-xl px-4 py-3 focus:border-yellow-500 focus:outline-none transition-colors"
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowRatingModal(false); setRating(5); setReviewText(""); }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem("token");
                      await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/users/bookings/${selectedBooking._id}/rate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ rating, review: reviewText })
                      });
                      setToast({ message: "Thank you for your feedback!", type: "success" });
                      setShowRatingModal(false);
                      setRating(5);
                      setReviewText("");
                      fetchBookings(token!);
                    } catch (error) {
                      setToast({ message: "Failed to submit rating", type: "error" });
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Submit Rating
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Confirm Logout</h2>
              <p className="text-slate-600 mb-6">Are you sure you want to logout?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
