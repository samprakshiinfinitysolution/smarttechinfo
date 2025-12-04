"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { createPortal } from "react-dom";
import Toast from "@/components/Toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (token) {
          const data = await api.getAllBookings(token);
          if (data.bookings) {
            setBookings(Array.isArray(data.bookings) ? data.bookings : []);
          } else {
            setBookings(Array.isArray(data) ? data : []);
          }
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [menuPosition, setMenuPosition] = useState<{x: number, y: number, showAbove: boolean} | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<any>(null);
  const [showAssignModal, setShowAssignModal] = useState<any>(null);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'warning' | 'info'} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (token) {
          const data = await api.getAllTechnicians(token);
          const techList = data.technicians || data;
          setTechnicians(Array.isArray(techList) ? techList : []);
        }
      } catch (error) {
        console.error("Error fetching technicians:", error);
        setTechnicians([]);
      }
    };
    const fetchServices = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/services/active`);
        const data = await res.json();
        setServices(data.services || []);
      } catch (error) {
        console.error('Error fetching services:', error);
        setServices([]);
      }
    };
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (token) {
          const data = await api.getAllUsers(token);
          setUsers(data.users ? data.users : (Array.isArray(data) ? data : []));
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchTechnicians();
    fetchServices();
    fetchUsers();
  }, []);

  const safeBookings = Array.isArray(bookings) ? bookings : [];

  const getServiceName = (val: any) => {
    if (!val) return '';
    if (typeof val === 'object') {
      return val.name || String(val);
    }
    const str = String(val);
    const found = services.find(s => s._id === str || String(s._id) === str || s.name === str);
    return found ? found.name : str;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-emerald-100 text-emerald-800";
      case "In Progress": return "bg-amber-100 text-amber-800";
      case "Scheduled": return "bg-sky-100 text-sky-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 flex items-center justify-center h-96">
        <LoadingSpinner size="lg" message="Loading bookings..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group">
          <div className="text-sm text-slate-500">Total Bookings</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{safeBookings.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group">
          <div className="text-sm text-slate-500">Completed</div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{safeBookings.filter(b => b.status === "Completed").length}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group">
          <div className="text-sm text-slate-500">In Progress</div>
          <div className="text-2xl font-bold text-amber-600 mt-2">{safeBookings.filter(b => b.status === "In Progress").length}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group">
          <div className="text-sm text-slate-500">Pending</div>
          <div className="text-2xl font-bold text-yellow-600 mt-2">{safeBookings.filter(b => b.status === "Pending").length}</div>
        </div>
      </div>

      <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search bookings by ID, customer, or service"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-6 py-3 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <option>All Status</option>
            <option>Completed</option>
            <option>In Progress</option>
            <option>Scheduled</option>
            <option>Pending</option>
            <option>Cancelled</option>
          </select>
          <button 
            onClick={async () => {
              const token = localStorage.getItem("adminToken");
              if (token) {
                try {
                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/admin/export/bookings`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  const blob = await res.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'bookings.csv';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  window.URL.revokeObjectURL(url);
                } catch (error) {
                  console.error('Export failed:', error);
                }
              }
            }}
            className="px-6 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
          {selectedBookings.length > 0 && (
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Delete ({selectedBookings.length})
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Booking
          </button>
        </div>

        <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
          <table className="w-full">
            <thead className="bg-white border-b border-slate-200">
              <tr>
                <th className="px-4 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedBookings.length === safeBookings.filter(booking => {
                      const term = searchTerm.trim().toLowerCase();
                      const idStr = booking._id ? String(booking._id) : (booking.id ? String(booking.id) : "");
                      const customerName = booking.customer?.name || booking.customer || "";
                      const technicianName = booking.technician?.name || booking.technician || "";
                      const serviceName = getServiceName(booking.service);
                      const matchesSearch = term === "" || idStr.toLowerCase().includes(term) || String(customerName).toLowerCase().includes(term) || String(serviceName).toLowerCase().includes(term) || String(technicianName).toLowerCase().includes(term);
                      const matchesStatus = statusFilter === "All" || statusFilter === "All Status" || booking.status === statusFilter;
                      return matchesSearch && matchesStatus;
                    }).length && safeBookings.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const filtered = safeBookings.filter(booking => {
                          const term = searchTerm.trim().toLowerCase();
                          const idStr = booking._id ? String(booking._id) : (booking.id ? String(booking.id) : "");
                          const customerName = booking.customer?.name || booking.customer || "";
                          const technicianName = booking.technician?.name || booking.technician || "";
                          const serviceName = getServiceName(booking.service);
                          const matchesSearch = term === "" || idStr.toLowerCase().includes(term) || String(customerName).toLowerCase().includes(term) || String(serviceName).toLowerCase().includes(term) || String(technicianName).toLowerCase().includes(term);
                          const matchesStatus = statusFilter === "All" || statusFilter === "All Status" || booking.status === statusFilter;
                          return matchesSearch && matchesStatus;
                        });
                        setSelectedBookings(filtered.map(b => b._id));
                      } else {
                        setSelectedBookings([]);
                      }
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-400 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Booking ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Service</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Technician</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Date & Time</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {safeBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12">
                    <EmptyState
                      icon={
                        <svg className="w-16 h-16 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      }
                      title="No bookings found"
                      description="There are no bookings matching your search criteria. Try adjusting your filters."
                    />
                  </td>
                </tr>
              ) : safeBookings
                .filter(booking => {
                  const term = searchTerm.trim().toLowerCase();
                  const idStr = booking._id ? String(booking._id) : (booking.id ? String(booking.id) : "");
                  const customerName = booking.customer?.name || booking.customer || "";
                  const technicianName = booking.technician?.name || booking.technician || "";
                  const serviceName = getServiceName(booking.service);

                  const matchesSearch = term === "" ||
                    idStr.toLowerCase().includes(term) ||
                    String(customerName).toLowerCase().includes(term) ||
                    String(serviceName).toLowerCase().includes(term) ||
                    String(technicianName).toLowerCase().includes(term);

                  const matchesStatus = statusFilter === "All" || statusFilter === "All Status" || booking.status === statusFilter;
                  return matchesSearch && matchesStatus;
                })
                .map((booking, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedBookings.includes(booking._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBookings([...selectedBookings, booking._id]);
                        } else {
                          setSelectedBookings(selectedBookings.filter(id => id !== booking._id));
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-400 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{booking._id ? String(booking._id).slice(-6) : (booking.id || 'N/A')}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{booking.customer?.name || booking.customer?.email || String(booking.customer) || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{getServiceName(booking.service)}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{booking.technician?.name || booking.technician || 'Unassigned'}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    <div className="flex flex-col">
                      <span className="font-medium">{booking.date}</span>
                      <span className="text-slate-500 text-xs">{booking.time}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">₹{booking.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={(e) => {
                        if (openMenuId === booking._id) {
                          setOpenMenuId(null);
                          setMenuPosition(null);
                        } else {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const menuHeight = 200;
                          const spaceBelow = window.innerHeight - rect.bottom;
                          const shouldShowAbove = spaceBelow < menuHeight;
                          
                          setMenuPosition({ 
                            x: rect.right - 192, 
                            y: shouldShowAbove ? rect.top : rect.bottom,
                            showAbove: shouldShowAbove
                          });
                          setOpenMenuId(booking._id);
                        }
                      }}
                      className="p-1 hover:bg-slate-200 rounded-full transition-colors"
                    >
                      <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="5" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="12" cy="19" r="2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {openMenuId && menuPosition && typeof document !== "undefined" && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpenMenuId(null); setMenuPosition(null); }} />
          <div 
            className="fixed w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50"
            style={{ 
              left: `${menuPosition.x}px`, 
              top: `${menuPosition.y}px`,
              transform: menuPosition.showAbove ? 'translateY(calc(-100% - 8px))' : 'translateY(8px)'
            }}
          >
            <button 
              onClick={() => {
                const booking = safeBookings.find(b => b._id === openMenuId);
                if (booking) setShowDetailsModal(booking);
                setOpenMenuId(null);
                setMenuPosition(null);
              }}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-t-lg flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              View Details
            </button>
            <button 
              onClick={() => {
                const booking = safeBookings.find(b => b._id === openMenuId);
                if (booking) setShowEditModal(booking);
                setOpenMenuId(null);
                setMenuPosition(null);
              }}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Booking
            </button>
            <button 
              onClick={() => {
                const booking = safeBookings.find(b => b._id === openMenuId);
                if (booking) setShowAssignModal(booking);
                setOpenMenuId(null);
                setMenuPosition(null);
              }}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Assign Technician
            </button>
            <button 
              onClick={() => {
                const booking = safeBookings.find(b => b._id === openMenuId);
                if (booking) setShowDeleteModal(booking);
                setOpenMenuId(null);
                setMenuPosition(null);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
              Delete Booking
            </button>
          </div>
        </>,
        document.body
      )}

      {showAssignModal && typeof document !== "undefined" && createPortal(
        <AssignTechnicianModal
          booking={showAssignModal}
          technicians={technicians}
          services={services}
          onClose={() => setShowAssignModal(null)}
          onSuccess={async () => {
            const token = localStorage.getItem("adminToken");
            if (token) {
              const data = await api.getAllBookings(token);
              setBookings(data.bookings ? data.bookings : (Array.isArray(data) ? data : []));
            }
            setShowAssignModal(null);
            setToast({ message: 'Technician assigned successfully', type: 'success' });
          }}
          onError={(msg) => setToast({ message: msg, type: 'error' })}
          onWarning={(msg) => setToast({ message: msg, type: 'warning' })}
        />,
        document.body
      )}

      {showDeleteModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Delete Booking</h2>
              </div>
              <button onClick={() => setShowDeleteModal(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-600 mb-2">Booking ID</p>
                <p className="text-lg font-bold text-slate-900 font-mono">{showDeleteModal._id?.slice(-8) || 'N/A'}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  <p className="text-sm font-medium text-blue-900">Customer</p>
                </div>
                <p className="text-base font-semibold text-blue-900">{showDeleteModal.customer?.name || 'N/A'}</p>
                <p className="text-sm text-blue-700">{showDeleteModal.service}</p>
                <p className="text-sm text-blue-700">{showDeleteModal.date} at {showDeleteModal.time}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-xl border-2 border-red-200">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <div>
                    <p className="font-semibold text-red-900 text-sm mb-1">Warning: This action cannot be undone</p>
                    <p className="text-xs text-red-700">The booking will be permanently deleted from the database.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-6">
              <button 
                onClick={() => setShowDeleteModal(null)} 
                className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    const token = localStorage.getItem("adminToken");
                    if (token) {
                      await api.adminDeleteBooking(token, showDeleteModal._id);
                      const data = await api.getAllBookings(token);
                      setBookings(data.bookings ? data.bookings : (Array.isArray(data) ? data : []));
                      setShowDeleteModal(null);
                      setToast({ message: 'Booking deleted successfully', type: 'success' });
                    }
                  } catch (error) {
                    console.error("Error deleting booking:", error);
                    setToast({ message: 'Failed to delete booking', type: 'error' });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                    Delete Booking
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showEditModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">Edit Booking</h2>
              <button onClick={() => setShowEditModal(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsSubmitting(true);
              const formData = new FormData(e.currentTarget);
              const updates = {
                service: formData.get('service'),
                date: formData.get('date'),
                time: formData.get('time'),
                amount: Number(formData.get('amount')),
                status: formData.get('status'),
                technician: formData.get('technician') || null
              };
              try {
                const token = localStorage.getItem("adminToken");
                if (token) {
                  const result = await api.adminUpdateBooking(token, showEditModal._id, updates);
                  if (result.conflict) {
                    setToast({ message: result.message, type: 'warning' });
                    return;
                  }
                  if (result.message && result.message.includes('Invalid status transition')) {
                    setToast({ message: result.message, type: 'warning' });
                    return;
                  }
                  const data = await api.getAllBookings(token);
                  setBookings(data.bookings ? data.bookings : (Array.isArray(data) ? data : []));
                  setShowEditModal(null);
                  setToast({ message: 'Booking updated successfully', type: 'success' });
                }
              } catch (error: any) {
                console.error("Error updating booking:", error);
                setToast({ message: error.message || 'Failed to update booking', type: 'error' });
              } finally {
                setIsSubmitting(false);
              }
            }} className="space-y-5">
              <EditBookingFields 
                technicians={technicians} 
                services={services} 
                defaultService={showEditModal.service}
                defaultDate={showEditModal.date}
                defaultTime={showEditModal.time}
                defaultAmount={showEditModal.amount}
                defaultTechId={showEditModal.technician?._id || ''}
              />
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                  Status *
                </label>
                <select name="status" defaultValue={showEditModal.status} required className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium">
                  <option value="Pending">Pending</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowEditModal(null)} className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition-colors" disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {showDetailsModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">Booking Details</h2>
              <button onClick={() => setShowDetailsModal(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm text-slate-500">Booking ID</p>
                  <p className="text-lg font-bold text-slate-900 font-mono">{showDetailsModal._id?.slice(-8) || 'N/A'}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(showDetailsModal.status)}`}>
                  {showDetailsModal.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    <p className="text-sm font-medium text-blue-900">Customer</p>
                  </div>
                  <p className="text-base font-semibold text-blue-900">{showDetailsModal.customer?.name || 'N/A'}</p>
                  <p className="text-sm text-blue-700 mt-1">{showDetailsModal.customer?.email || 'N/A'}</p>
                  <p className="text-sm text-blue-700">{showDetailsModal.customer?.phone || 'N/A'}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    <p className="text-sm font-medium text-purple-900">Technician</p>
                  </div>
                  <p className="text-base font-semibold text-purple-900">{showDetailsModal.technician?.name || 'Unassigned'}</p>
                  <p className="text-sm text-purple-700 mt-1">{(showDetailsModal.technician?.specialties && showDetailsModal.technician.specialties.length) ? showDetailsModal.technician.specialties.join(', ') : 'N/A'}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    <p className="text-xs font-medium text-slate-600">Date</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{showDetailsModal.date || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    <p className="text-xs font-medium text-slate-600">Time</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{showDetailsModal.time || 'N/A'}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                    <p className="text-xs font-medium text-emerald-900">Amount</p>
                  </div>
                  <p className="text-lg font-bold text-emerald-900">₹{showDetailsModal.amount || 0}</p>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  <p className="text-sm font-medium text-slate-700">Service</p>
                </div>
                <p className="text-base font-semibold text-slate-900">{showDetailsModal.service || 'N/A'}</p>
              </div>
              {showDetailsModal.issue && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                    <p className="text-sm font-medium text-amber-900">Issue Description</p>
                  </div>
                  <p className="text-sm text-amber-900">{showDetailsModal.issue}</p>
                </div>
              )}
              {showDetailsModal.address && (
                <div className="bg-slate-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    <p className="text-sm font-medium text-slate-700">Address</p>
                  </div>
                  <p className="text-sm text-slate-900">{showDetailsModal.address}</p>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
      {showAddModal && typeof document !== "undefined" && createPortal(
        <AddBookingModal
          users={users}
          technicians={technicians}
          services={services}
          onClose={() => setShowAddModal(false)}
          onSuccess={async () => {
            const token = localStorage.getItem("adminToken");
            if (token) {
              const data = await api.getAllBookings(token);
              setBookings(data.bookings ? data.bookings : (Array.isArray(data) ? data : []));
              const userData = await api.getAllUsers(token);
              setUsers(userData.users ? userData.users : (Array.isArray(userData) ? userData : []));
            }
            setShowAddModal(false);
            setToast({ message: 'Booking created successfully', type: 'success' });
          }}
        />,
        document.body
      )}
      {showBulkDeleteModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Delete Bookings</h2>
              </div>
              <button onClick={() => setShowBulkDeleteModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-xl border-2 border-red-200">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <div>
                    <p className="font-semibold text-red-900 text-sm mb-1">Warning: This action cannot be undone</p>
                    <p className="text-xs text-red-700">You are about to permanently delete {selectedBookings.length} booking{selectedBookings.length > 1 ? 's' : ''}. All data will be lost.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-6">
              <button 
                onClick={() => setShowBulkDeleteModal(false)} 
                className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    const token = localStorage.getItem("adminToken");
                    if (token) {
                      await Promise.all(selectedBookings.map(id => api.adminDeleteBooking(token, id)));
                      const data = await api.getAllBookings(token);
                      setBookings(data.bookings ? data.bookings : (Array.isArray(data) ? data : []));
                      setSelectedBookings([]);
                      setShowBulkDeleteModal(false);
                      setToast({ message: `Successfully deleted ${selectedBookings.length} booking${selectedBookings.length > 1 ? 's' : ''}`, type: 'success' });
                    }
                  } catch (error) {
                    console.error("Error deleting bookings:", error);
                    setToast({ message: 'Failed to delete some bookings', type: 'error' });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Delete {selectedBookings.length} Booking{selectedBookings.length > 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

function AddBookingModal({ users, technicians, services, onClose, onSuccess }: { users: any[]; technicians: any[]; services: any[]; onClose: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState<'select' | 'existing' | 'new'>('select');
  const [selectedUser, setSelectedUser] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchUser, setSearchUser] = useState('');

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.phone?.includes(searchUser)
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      let customerId = selectedUser;

      if (step === 'new') {
        const newUser = {
          name: formData.get('userName'),
          email: formData.get('userEmail'),
          phone: formData.get('userPhone'),
          password: formData.get('userPassword') || '123456',
          address: formData.get('userAddress')
        };
        const createdUser = await api.createUser(token, newUser);
        customerId = createdUser._id;
      }

      const booking = {
        customer: customerId,
        service: formData.get('service'),
        date: formData.get('date'),
        time: formData.get('time'),
        amount: Number(formData.get('amount')),
        technician: formData.get('technician') || null,
        status: 'Pending'
      };

      await api.adminCreateBooking(token, booking);
      onSuccess();
    } catch (error: any) {
      console.error('Error creating booking:', error);
      alert(error.message || 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Create New Booking</h2>
            <p className="text-sm text-slate-600 mt-1">Add a booking for existing or new customer</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {step === 'select' && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-700 mb-4">Choose customer type:</p>
            <button
              onClick={() => setStep('existing')}
              className="w-full p-6 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 group-hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-7 h-7 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">Existing Customer</h3>
                  <p className="text-sm text-slate-600 mt-1">Select from {users.length} registered customers</p>
                </div>
                <svg className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
              </div>
            </button>
            <button
              onClick={() => setStep('new')}
              className="w-full p-6 rounded-xl border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-100 group-hover:bg-emerald-200 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-7 h-7 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">New Customer</h3>
                  <p className="text-sm text-slate-600 mt-1">Create customer account and booking together</p>
                </div>
                <svg className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
              </div>
            </button>
          </div>
        )}

        {step === 'existing' && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                Select Customer *
              </label>
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="Search by name, email, or phone"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3"
              />
              <div className="max-h-48 overflow-y-auto space-y-2 border-2 border-slate-200 rounded-xl p-2">
                {filteredUsers.map(user => (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => setSelectedUser(user._id)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedUser === user._id
                        ? 'bg-blue-100 border-2 border-blue-400'
                        : 'bg-slate-50 border-2 border-transparent hover:border-slate-300'
                    }`}
                  >
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <p className="text-sm text-slate-600">{user.email} • {user.phone}</p>
                  </button>
                ))}
              </div>
            </div>
            <BookingFields technicians={technicians} services={services} />
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setStep('select')} className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition-colors">
                Back
              </button>
              <button type="submit" disabled={!selectedUser || isSubmitting} className="flex-1 px-4 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? 'Creating...' : 'Create Booking'}
              </button>
            </div>
          </form>
        )}

        {step === 'new' && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 mb-4">
              <h3 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                New Customer Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-emerald-900 mb-1 block">Name *</label>
                  <input name="userName" required className="w-full px-4 py-2.5 rounded-xl border-2 border-emerald-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="John Doe" />
                </div>
                <div>
                  <label className="text-sm font-medium text-emerald-900 mb-1 block">Email *</label>
                  <input name="userEmail" type="email" required className="w-full px-4 py-2.5 rounded-xl border-2 border-emerald-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="text-sm font-medium text-emerald-900 mb-1 block">Phone *</label>
                  <input name="userPhone" type="tel" required pattern="[6-9]\d{9}" className="w-full px-4 py-2.5 rounded-xl border-2 border-emerald-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="9876543210" />
                </div>
                <div>
                  <label className="text-sm font-medium text-emerald-900 mb-1 block">Password</label>
                  <input name="userPassword" type="password" className="w-full px-4 py-2.5 rounded-xl border-2 border-emerald-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Default: 123456" />
                </div>
              </div>
              <div className="mt-3">
                <label className="text-sm font-medium text-emerald-900 mb-1 block">Address</label>
                <textarea name="userAddress" rows={2} className="w-full px-4 py-2.5 rounded-xl border-2 border-emerald-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none" placeholder="Full address" />
              </div>
            </div>
            <BookingFields technicians={technicians} services={services} />
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setStep('select')} className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition-colors">
                Back
              </button>
              <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? 'Creating...' : 'Create Customer & Booking'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function AssignTechnicianModal({ booking, technicians, services, onClose, onSuccess, onError, onWarning }: {
  booking: any;
  technicians: any[];
  services: any[];
  onClose: () => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
  onWarning: (msg: string) => void;
}) {
  const getServiceName = (val: any) => {
    if (!val) return '';
    if (typeof val === 'object') return val.name || String(val);
    const str = String(val);
    const found = services.find(s => s._id === str || String(s._id) === str || s.name === str);
    return found ? found.name : str;
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');

  // Get service-related specialties
  const getServiceSpecialty = (service: string) => {
    const map: Record<string, string[]> = {
      'AC Repair': ['AC Technician', 'HVAC Specialist'],
      'TV Repair': ['Electronics Technician', 'TV Specialist'],
      'Geyser Repair': ['Plumber', 'Geyser Specialist'],
      'Washing Machine': ['Appliance Technician', 'Washing Machine Specialist'],
      'Refrigerator': ['Appliance Technician', 'Refrigerator Specialist'],
      'Microwave': ['Electronics Technician', 'Appliance Technician']
    };
    return map[service] || [];
  };

  const recommendedSpecialties = getServiceSpecialty(getServiceName(booking.service));

  // Filter technicians
  const filteredTechnicians = technicians.filter(tech => {
    const techSpecialties = Array.isArray(tech.specialties) ? tech.specialties : (tech.specialty ? [tech.specialty] : []);
    const matchesSearch = searchTerm === '' ||
      tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      techSpecialties.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSpecialty = specialtyFilter === 'All' || techSpecialties.includes(specialtyFilter);
    const matchesAvailability = availabilityFilter === 'All' || tech.status === availabilityFilter;
    
    return matchesSearch && matchesSpecialty && matchesAvailability;
  });

  // Sort: recommended first, then by rating
  const sortedTechnicians = [...filteredTechnicians].sort((a, b) => {
    const aSpecialties = (a.specialties && a.specialties.length) ? a.specialties : [];
    const bSpecialties = (b.specialties && b.specialties.length) ? b.specialties : [];
    const aRecommended = aSpecialties.some((s: string) => recommendedSpecialties.includes(s));
    const bRecommended = bSpecialties.some((s: string) => recommendedSpecialties.includes(s));
    if (aRecommended && !bRecommended) return -1;
    if (!aRecommended && bRecommended) return 1;
    return (b.avgRating || b.rating || 0) - (a.avgRating || a.rating || 0);
  });

  const handleAssign = async (techId: string) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;
      
      const result = await api.adminUpdateBooking(token, booking._id, { 
        technician: techId, 
        status: 'Scheduled' 
      });
      
      if (result.conflict) {
        onWarning(result.message);
        return;
      }
      
      onSuccess();
    } catch (error: any) {
      console.error("Error assigning technician:", error);
      onError(error.message || 'Failed to assign technician');
    } finally {
      setIsSubmitting(false);
    }
  };

  const uniqueSpecialties = Array.from(new Set(technicians.flatMap(t => (t.specialties && t.specialties.length) ? t.specialties : [])));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Assign Technician</h2>
            <p className="text-sm text-slate-600 mt-1">Select the best technician for this booking</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* Booking Info */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 p-5 rounded-xl border border-blue-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-600 mb-1">Service</p>
              <p className="font-semibold text-slate-900">{getServiceName(booking.service)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Customer</p>
              <p className="font-semibold text-slate-900">{booking.customer?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Date & Time</p>
              <p className="font-semibold text-slate-900">{booking.date}</p>
              <p className="text-xs text-slate-600">{booking.time}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Amount</p>
              <p className="font-semibold text-emerald-600 text-lg">₹{booking.amount}</p>
            </div>
          </div>
          {booking.technician && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs text-slate-600 mb-1">Currently Assigned</p>
              <p className="font-semibold text-purple-900">{booking.technician?.name || 'Unknown'} - {booking.technician?.specialty || 'N/A'}</p>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-4 space-y-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or specialty..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="All">All Specialties</option>
              {uniqueSpecialties.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="All">All Status</option>
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
            </select>
          </div>
        </div>

        {/* Technicians List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <p className="text-sm font-medium text-slate-700 mb-2">
            {sortedTechnicians.length} technician{sortedTechnicians.length !== 1 ? 's' : ''} found
            {recommendedSpecialties.length > 0 && (
              <span className="ml-2 text-purple-600">• Recommended specialties highlighted</span>
            )}
          </p>
          
          {sortedTechnicians.map((tech) => {
            const techSpecialties = Array.isArray(tech.specialties) ? tech.specialties : (tech.specialty ? [tech.specialty] : []);
            const isRecommended = techSpecialties.some((s: string) => recommendedSpecialties.includes(s));
            const isCurrentlyAssigned = booking.technician?._id === tech._id;
            const rating = tech.avgRating || tech.rating || 0;
            const totalJobs = tech.totalJobs || tech.services || 0;
            const completionRate = tech.completionRate || 0;
            
            return (
              <button
                key={tech._id}
                onClick={() => !isSubmitting && handleAssign(tech._id)}
                disabled={isSubmitting}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  isCurrentlyAssigned
                    ? 'border-purple-500 bg-purple-50'
                    : isRecommended
                    ? 'border-emerald-300 bg-emerald-50 hover:border-emerald-500'
                    : 'border-slate-200 hover:border-purple-400 hover:bg-purple-50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCurrentlyAssigned ? 'bg-purple-200' : isRecommended ? 'bg-emerald-200' : 'bg-slate-200'
                  }`}>
                    <svg className={`w-7 h-7 ${
                      isCurrentlyAssigned ? 'text-purple-700' : isRecommended ? 'text-emerald-700' : 'text-slate-600'
                    }`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-slate-900 text-lg">{tech.name}</p>
                          {isRecommended && !isCurrentlyAssigned && (
                            <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full">
                              RECOMMENDED
                            </span>
                          )}
                          {isCurrentlyAssigned && (
                            <span className="px-2 py-0.5 bg-purple-500 text-white text-[10px] font-bold rounded-full">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 font-medium">{techSpecialties.join(', ') || 'N/A'}</p>
                      </div>
                      <div className="text-right ml-3">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-lg font-bold text-slate-900">{rating.toFixed(1)}</span>
                          <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          tech.status === 'Available' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {tech.status || 'Available'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-200">
                      <div>
                        <p className="text-xs text-slate-500">Total Jobs</p>
                        <p className="text-sm font-bold text-slate-900">{totalJobs}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Completion</p>
                        <p className="text-sm font-bold text-slate-900">{completionRate.toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Phone</p>
                        <p className="text-sm font-bold text-slate-900">{tech.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
          
          {sortedTechnicians.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-slate-300 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <p className="text-slate-500 font-medium">No technicians found</p>
              <p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EditBookingFields({ technicians, services, defaultService, defaultTechId, defaultDate, defaultTime, defaultAmount }: { technicians: any[]; services: any[]; defaultService?: string; defaultTechId?: string; defaultDate?: string; defaultTime?: string; defaultAmount?: number | string }) {
  const [selectedService, setSelectedService] = React.useState(defaultService || '');
  const [selectedTechId, setSelectedTechId] = React.useState(defaultTechId || '');

  const selectedServiceObj = services.find(s => s._id === selectedService);
  
  const filteredTechnicians = React.useMemo(() => {
    if (!selectedService || !selectedServiceObj) return technicians;
    
    return technicians.filter(tech => {
      const techSpecialties = Array.isArray(tech.specialties) ? tech.specialties : (tech.specialty ? [tech.specialty] : []);
      return techSpecialties.some((s: string) => 
        selectedServiceObj.name.toLowerCase().includes(s.toLowerCase()) ||
        s.toLowerCase().includes(selectedServiceObj.name.toLowerCase())
      );
    }).sort((a, b) => {
      if (a.status === 'Available' && b.status !== 'Available') return -1;
      if (a.status !== 'Available' && b.status === 'Available') return 1;
      return (b.avgRating || b.rating || 0) - (a.avgRating || a.rating || 0);
    });
  }, [selectedService, selectedServiceObj, technicians]);

  return (
    <>
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
          Select Service *
        </label>
        <select 
          name="service" 
          value={selectedService} 
          onChange={(e) => {
            setSelectedService(e.target.value);
            setSelectedTechId('');
          }}
          required 
          className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium"
        >
          <option value="">Choose a service</option>
          {services.map(s => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            Date *
          </label>
          <input name="date" type="date" defaultValue={defaultDate || ''} required className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400" />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            Amount (₹) *
          </label>
          <input name="amount" type="number" defaultValue={defaultAmount ?? 0} required className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400" />
        </div>
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          Select Time Slot *
        </label>
        <select name="time" defaultValue={defaultTime || ''} required className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium">
          <option value="">Choose a time slot</option>
          <option value="9:00 AM – 11:00 AM">9:00 AM – 11:00 AM</option>
          <option value="11:00 AM – 1:00 PM">11:00 AM – 1:00 PM</option>
          <option value="1:00 PM – 3:00 PM">1:00 PM – 3:00 PM</option>
          <option value="3:00 PM – 5:00 PM">3:00 PM – 5:00 PM</option>
          <option value="5:00 PM – 7:00 PM">5:00 PM – 7:00 PM</option>
        </select>
      </div>

      {selectedService && filteredTechnicians.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-200">
          <input type="hidden" name="technician" value={selectedTechId} />
          <h3 className="font-semibold text-purple-900 mb-3 text-sm">Select Technician ({filteredTechnicians.length} available)</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedTechId('')}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                selectedTechId === '' ? 'border-purple-500 bg-purple-100' : 'border-purple-200 bg-white hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              <p className="font-medium text-purple-900">✕ Leave Unassigned</p>
              <p className="text-xs text-purple-600">Assign technician later</p>
            </button>
                {filteredTechnicians.map(tech => {
                const specialties = Array.isArray(tech.specialties) ? tech.specialties : (tech.specialty ? [tech.specialty] : []);
              const rating = tech.avgRating || tech.rating || 0;
              const isSelected = tech._id === selectedTechId;
              const isAvailable = tech.status === 'Available';
              
              return (
                <button
                  key={tech._id}
                  type="button"
                  onClick={() => setSelectedTechId(tech._id)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    isSelected ? 'border-blue-500 bg-blue-100 shadow-md' : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-base font-bold ${
                      isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {tech.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900">{tech.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isAvailable ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                        }`}>
                          {tech.status}
                        </span>
                        <div className="flex items-center gap-0.5 ml-auto">
                          <svg className="w-3 h-3 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          <span className="text-xs font-bold text-slate-900">{rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {specialties.slice(0, 2).map((s: string, i: number) => (
                          <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

function BookingFields({ technicians, services }: { technicians: any[]; services: any[] }) {
  const [selectedService, setSelectedService] = React.useState('');
  const [selectedTechId, setSelectedTechId] = React.useState('');

  const selectedServiceObj = services.find(s => s._id === selectedService);
  
  // Filter technicians based on selected service
  const filteredTechnicians = React.useMemo(() => {
    if (!selectedService || !selectedServiceObj) return [];
    
    return technicians.filter(tech => {
      const techSpecialties = Array.isArray(tech.specialties) ? tech.specialties : (tech.specialty ? [tech.specialty] : []);
      return techSpecialties.some((s: string) => 
        selectedServiceObj.name.toLowerCase().includes(s.toLowerCase()) ||
        s.toLowerCase().includes(selectedServiceObj.name.toLowerCase())
      );
    }).sort((a, b) => {
      // Sort: Available first, then by rating
      if (a.status === 'Available' && b.status !== 'Available') return -1;
      if (a.status !== 'Available' && b.status === 'Available') return 1;
      return (b.avgRating || b.rating || 0) - (a.avgRating || a.rating || 0);
    });
  }, [selectedService, selectedServiceObj, technicians]);

  React.useEffect(() => {
    const handler = (e: Event) => {
      const target = e.target as HTMLSelectElement;
      if (!target || target.name !== 'service') return;
      const form = target.closest('form');
      if (!form) return;
      const selected = target.options[target.selectedIndex];
      const price = selected?.getAttribute('data-price') || '';
      const amountInput = form.querySelector('input[name="amount"]') as HTMLInputElement | null;
      if (amountInput && price) {
        amountInput.value = price;
      }
    };

    document.addEventListener('change', handler);
    return () => document.removeEventListener('change', handler);
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          Booking Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-blue-900 mb-1 block">Service *</label>
            <select 
              name="service" 
              required 
              value={selectedService}
              onChange={(e) => {
                setSelectedService(e.target.value);
                setSelectedTechId(''); // Reset technician when service changes
              }}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-blue-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
            >
              <option value="">Choose service</option>
              {services.map(s => (
                <option key={s._id} value={s._id} data-price={s.serviceCharges}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-blue-900 mb-1 block">Amount (₹) *</label>
            <input name="amount" type="number" required min="0" className="w-full px-4 py-2.5 rounded-xl border-2 border-blue-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="500" />
          </div>
          <div>
            <label className="text-sm font-medium text-blue-900 mb-1 block">Date *</label>
            <input name="date" type="date" required min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2.5 rounded-xl border-2 border-blue-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="text-sm font-medium text-blue-900 mb-1 block">Time Slot *</label>
            <select name="time" required className="w-full px-4 py-2.5 rounded-xl border-2 border-blue-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium">
              <option value="">Choose time</option>
              <option value="9:00 AM – 11:00 AM">9:00 AM – 11:00 AM</option>
              <option value="11:00 AM – 1:00 PM">11:00 AM – 1:00 PM</option>
              <option value="1:00 PM – 3:00 PM">1:00 PM – 3:00 PM</option>
              <option value="3:00 PM – 5:00 PM">3:00 PM – 5:00 PM</option>
              <option value="5:00 PM – 7:00 PM">5:00 PM – 7:00 PM</option>
            </select>
          </div>
        </div>
      </div>

      {/* Technician Selection */}
      {selectedService && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-200">
          <input type="hidden" name="technician" value={selectedTechId} />
          <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Select Technician for {selectedServiceObj?.name}
            <span className="ml-auto text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
              {filteredTechnicians.length} available
            </span>
          </h3>
          
          {filteredTechnicians.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-purple-200">
              <svg className="w-12 h-12 text-purple-300 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <p className="text-purple-700 font-medium">No technicians found for this service</p>
              <p className="text-xs text-purple-600 mt-1">Try selecting a different service</p>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setSelectedTechId('')}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  selectedTechId === ''
                    ? 'border-purple-500 bg-purple-100'
                    : 'border-purple-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                <p className="font-medium text-purple-900">✕ Leave Unassigned</p>
                <p className="text-xs text-purple-600">Assign technician later</p>
              </button>
              
              {filteredTechnicians.map(tech => {
                const specialties = Array.isArray(tech.specialties) ? tech.specialties : (tech.specialty ? [tech.specialty] : []);
                const rating = tech.avgRating || tech.rating || 0;
                const isSelected = tech._id === selectedTechId;
                const isAvailable = tech.status === 'Available';
                
                return (
                  <button
                    key={tech._id}
                    type="button"
                    onClick={() => setSelectedTechId(tech._id)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-100 shadow-md'
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold ${
                        isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {tech.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-slate-900">{tech.name}</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isAvailable ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                          }`}>
                            {tech.status || 'Available'}
                          </span>
                          <div className="flex items-center gap-0.5 ml-auto">
                            <svg className="w-3 h-3 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            <span className="text-xs font-bold text-slate-900">{rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {specialties.map((s: string, i: number) => (
                            <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
