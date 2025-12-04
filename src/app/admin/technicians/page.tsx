"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { createPortal } from "react-dom";
import Toast from "@/components/Toast";

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("All");
  const [menuPosition, setMenuPosition] = useState<{x: number, y: number, showAbove: boolean} | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [specialties, setSpecialties] = useState<string[]>([]);

  const [showProfileModal, setShowProfileModal] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState<any>(null);
  const [showRemoveModal, setShowRemoveModal] = useState<any>(null);
  const [showBookingsModal, setShowBookingsModal] = useState<any>(null);
  const [technicianBookings, setTechnicianBookings] = useState<any[]>([]);
  const [passwordError, setPasswordError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'warning' | 'info'} | null>(null);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      if (token) {
        const url = `${process.env.NEXT_PUBLIC_API_URL || ''}/admin/technicians?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}&specialty=${specialtyFilter}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.technicians) {
          setTechnicians(data.technicians);
          setTotalPages(data.pagination.pages);
          setTotalCount(data.pagination.total);
        } else {
          setTechnicians(Array.isArray(data) ? data : []);
        }
      }
    } catch (error) {
      console.error("Error fetching technicians:", error);
      setTechnicians([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, [currentPage, searchTerm, specialtyFilter]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/services/active`);
        const data = await res.json();
        const names: string[] = (data?.services || []).map((s: any) => s.name).filter(Boolean);
        setSpecialties(Array.from(new Set(names)));
      } catch (err) {
        console.error('Error fetching specialties from services:', err);
        setSpecialties([]);
      }
    };
    fetchServices();
  }, []);

  const validatePassword = (password: string): boolean => {
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setPasswordError('Password must contain at least one uppercase letter');
      return false;
    }
    if (!/[a-z]/.test(password)) {
      setPasswordError('Password must contain at least one lowercase letter');
      return false;
    }
    if (!/[0-9]/.test(password)) {
      setPasswordError('Password must contain at least one number');
      return false;
    }
    if (!/[!@#$%^&*]/.test(password)) {
      setPasswordError('Password must contain at least one special character (!@#$%^&*)');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const safeTechnicians = Array.isArray(technicians) ? technicians : [];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 flex items-center justify-center h-96">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group">
          <div className="text-sm text-slate-500">Total Technicians</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{safeTechnicians.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group">
          <div className="text-sm text-slate-500">Available</div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{safeTechnicians.filter(t => t.status === "Available").length}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group">
          <div className="text-sm text-slate-500">Busy</div>
          <div className="text-2xl font-bold text-amber-600 mt-2">{safeTechnicians.filter(t => t.status === "Busy").length}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group">
          <div className="text-sm text-slate-500">Avg Rating</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{safeTechnicians.length > 0 ? (safeTechnicians.reduce((acc, t) => acc + (t.rating || 0), 0) / safeTechnicians.length).toFixed(1) : '0.0'} ⭐</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
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
              placeholder="Search technicians by name or specialty"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="px-6 py-3 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <option value="All">All Specialties</option>
            {specialties && specialties.length > 0 ? (
              specialties.map(s => <option key={s} value={s}>{s}</option>)
            ) : (
              <>
                <option>AC Repair</option>
                <option>Washing Machine</option>
                <option>Refrigerator</option>
                <option>TV Repair</option>
                <option>Microwave</option>
                <option>Plumbing</option>
              </>
            )}
          </select>
          <button 
            onClick={async () => {
              const token = localStorage.getItem("adminToken");
              if (token) {
                try {
                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/admin/export/technicians`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  const blob = await res.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'technicians.csv';
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
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Technician
          </button>
        </div>

        <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
          <table className="w-full">
            <thead className="bg-white border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Technician ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Name</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Specialty</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Rating</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Services</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {safeTechnicians.map((tech, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{tech._id ? String(tech._id).slice(-6) : 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">{tech.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{Array.isArray(tech.specialties) ? tech.specialties.join(', ') : (tech.specialty || '')}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium w-fit">
                        <span>{tech.avgRating ? tech.avgRating.toFixed(1) : tech.rating || 0}</span>
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </div>
                      {tech.completionRate !== undefined && (
                        <span className="text-xs text-slate-600">{tech.completionRate.toFixed(0)}% complete</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-slate-900">{tech.totalJobs || tech.services || 0}</span>
                      {tech.completedJobs !== undefined && (
                        <span className="text-xs text-emerald-600">{tech.completedJobs} completed</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{tech.phone}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${tech.status === "Available" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                      {tech.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={(e) => {
                        if (openMenuId === tech._id) {
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
                          setOpenMenuId(tech._id);
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
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 px-2">
            <div className="text-sm text-slate-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} technicians
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    currentPage === i + 1
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

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
                const tech = safeTechnicians.find(t => t._id === openMenuId);
                if (tech) setShowProfileModal(tech);
                setOpenMenuId(null);
                setMenuPosition(null);
              }}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-t-lg flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              View Profile
            </button>
            <button 
              onClick={() => {
                const tech = safeTechnicians.find(t => t._id === openMenuId);
                if (tech) setShowEditModal(tech);
                setOpenMenuId(null);
                setMenuPosition(null);
              }}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Details
            </button>
            <button 
              onClick={async () => {
                const tech = safeTechnicians.find(t => t._id === openMenuId);
                if (tech) {
                  try {
                    const token = localStorage.getItem("adminToken");
                    if (token) {
                      const bookings = await api.getTechnicianBookings(token, tech._id);
                      setTechnicianBookings(bookings);
                      setShowBookingsModal(tech);
                    }
                  } catch (error) {
                    console.error("Error fetching bookings:", error);
                  }
                }
                setOpenMenuId(null);
                setMenuPosition(null);
              }}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              View Assigned Jobs
            </button>
            <button 
              onClick={() => {
                const tech = safeTechnicians.find(t => t._id === openMenuId);
                if (tech) setShowRemoveModal(tech);
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
              Remove
            </button>
          </div>
        </>,
        document.body
      )}

      {showRemoveModal && typeof document !== "undefined" && createPortal(
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
                <h2 className="text-2xl font-bold text-slate-900">Remove Technician</h2>
              </div>
              <button onClick={() => setShowRemoveModal(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-600 mb-2">Technician ID</p>
                <p className="text-lg font-bold text-slate-900 font-mono">{showRemoveModal._id?.slice(-8) || 'N/A'}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  <p className="text-sm font-medium text-purple-900">Technician Details</p>
                </div>
                <p className="text-base font-semibold text-purple-900">{showRemoveModal.name}</p>
                <p className="text-sm text-purple-700">{(showRemoveModal?.specialties && showRemoveModal.specialties.length) ? showRemoveModal.specialties.join(', ') : showRemoveModal.specialty}</p>
                <p className="text-sm text-purple-700">{showRemoveModal.email}</p>
                <p className="text-sm text-purple-700">{showRemoveModal.phone}</p>
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
                    <p className="text-xs text-red-700">The technician will be permanently removed from the system. All associated data will be deleted.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-6">
              <button 
                onClick={() => setShowRemoveModal(null)} 
                className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  try {
                    const token = localStorage.getItem("adminToken");
                    if (token) {
                      const result = await api.deleteTechnician(token, showRemoveModal._id);
                      if (result.hasActiveBookings) {
                        setToast({ message: result.message, type: 'warning' });
                        return;
                      }
                      const data = await api.getAllTechnicians(token);
                      setTechnicians(Array.isArray(data) ? data : []);
                      setShowRemoveModal(null);
                      setToast({ message: 'Technician deleted successfully!', type: 'success' });
                    }
                  } catch (error) {
                    console.error("Error deleting technician:", error);
                    setToast({ message: 'Failed to delete technician', type: 'error' });
                  }
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
                Remove Technician
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showEditModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">Edit Technician Details</h2>
              <button onClick={() => setShowEditModal(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const password = formData.get('password') as string;
              const updates: any = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                specialties: formData.getAll('specialties'),
                status: formData.get('status'),
                street: formData.get('street'),
                city: formData.get('city'),
                state: formData.get('state'),
                pincode: formData.get('pincode')
              };
              
              // Only include password if provided
              if (password && password.trim() !== '') {
                if (!validatePassword(password)) {
                  return;
                }
                updates.password = password;
              }
              try {
                const token = localStorage.getItem("adminToken");
                if (token) {
                  await api.updateTechnician(token, showEditModal._id, updates);
                  const data = await api.getAllTechnicians(token);
                  setTechnicians(Array.isArray(data) ? data : []);
                  setShowEditModal(null);
                  setToast({ message: 'Technician updated successfully!', type: 'success' });
                }
              } catch (error) {
                console.error("Error updating technician:", error);
                setToast({ message: 'Failed to update technician', type: 'error' });
              }
            }} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    Full Name *
                  </label>
                  <input name="name" defaultValue={showEditModal.name} required className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                    Email *
                  </label>
                  <input name="email" type="email" defaultValue={showEditModal.email} required className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    Phone *
                  </label>
                  <input name="phone" type="tel" defaultValue={showEditModal.phone} required className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                    Status *
                  </label>
                  <select name="status" defaultValue={showEditModal.status} required className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium">
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                    Specialty * (Select multiple)
                  </label>
                  <div className="w-full max-h-48 overflow-y-auto px-4 py-3 rounded-xl border-2 border-slate-300 bg-white space-y-2">
                    {(specialties && specialties.length > 0 ? specialties : ['AC Repair', 'Washing Machine', 'Refrigerator', 'TV Repair', 'Microwave', 'Geyser Repair']).map(s => {
                      const isChecked = (showEditModal?.specialties || (showEditModal?.specialty ? [showEditModal.specialty] : [])).includes(s);
                      return (
                        <label key={s} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                          <input
                            type="checkbox"
                            name="specialties"
                            value={s}
                            defaultChecked={isChecked}
                            className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-2 focus:ring-slate-400"
                          />
                          <span className="text-sm text-slate-900">{s}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    New Password
                  </label>
                  <div className="relative">
                    <input 
                      name="password" 
                      type={showEditPassword ? "text" : "password"}
                      onChange={(e) => e.target.value && validatePassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400" 
                      placeholder="Leave blank to keep current" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      {showEditPassword ? (
                        <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                      {passwordError}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">Min 8 chars, uppercase, lowercase, number, special char</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Street</label>
                  <input name="street" defaultValue={showEditModal.street} className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400" placeholder="123 Main St" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">City</label>
                  <input name="city" defaultValue={showEditModal.city} className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400" placeholder="Mumbai" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">State</label>
                  <input name="state" defaultValue={showEditModal.state} className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400" placeholder="Maharashtra" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Pincode</label>
                  <input name="pincode" type="text" pattern="[0-9]{6}" maxLength={6} defaultValue={showEditModal.pincode} className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400" placeholder="400001" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowEditModal(null)} className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-medium transition-colors">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {showProfileModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">Technician Profile</h2>
              <button onClick={() => setShowProfileModal(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {showProfileModal.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900">{showProfileModal.name}</h3>
                  <p className="text-sm text-slate-600">{(showProfileModal?.specialties && showProfileModal.specialties.length) ? showProfileModal.specialties.join(', ') : showProfileModal.specialty}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${showProfileModal.status === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {showProfileModal.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                    <p className="text-xs font-medium text-slate-600">Email</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{showProfileModal.email || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    <p className="text-xs font-medium text-slate-600">Phone</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{showProfileModal.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="17 11 19 13 23 9" /></svg>
                    <p className="text-xs font-medium text-slate-600">Technician ID</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 font-mono">{showProfileModal._id?.slice(-8) || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                    <p className="text-xs font-medium text-slate-600">Specialty</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{(showProfileModal?.specialties && showProfileModal.specialties.length) ? showProfileModal.specialties.join(', ') : (showProfileModal.specialty || 'N/A')}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-yellow-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <p className="text-xs font-medium text-yellow-900">Rating</p>
                  </div>
                  <p className="text-2xl font-bold text-yellow-900">{showProfileModal.rating || 0}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                    <p className="text-xs font-medium text-blue-900">Services</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{showProfileModal.services || 0}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                    <p className="text-xs font-medium text-emerald-900">Status</p>
                  </div>
                  <p className="text-sm font-bold text-emerald-900">{showProfileModal.status}</p>
                </div>
              </div>
              {showProfileModal.createdAt && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    <p className="text-xs font-medium text-slate-600">Joined Date</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{new Date(showProfileModal.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {showAddModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">Add New Technician</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const password = formData.get('password') as string;
              
              if (!validatePassword(password)) {
                return;
              }
              
              const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                password: password,
                specialties: formData.getAll('specialties'),
                street: formData.get('street'),
                city: formData.get('city'),
                state: formData.get('state'),
                pincode: formData.get('pincode')
              };
              try {
                const token = localStorage.getItem("adminToken");
                if (token) {
                  await api.createTechnician(token, data);
                  const updatedData = await api.getAllTechnicians(token);
                  setTechnicians(Array.isArray(updatedData) ? updatedData : []);
                  setShowAddModal(false);
                  setPasswordError('');
                  setToast({ message: 'Technician created successfully!', type: 'success' });
                }
              } catch (error) {
                console.error("Error creating technician:", error);
                setToast({ message: 'Failed to create technician', type: 'error' });
              }
            }} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    Full Name *
                  </label>
                  <input name="name" required className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400" placeholder="John Doe" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                    Email *
                  </label>
                  <input name="email" type="email" required className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400" placeholder="john@example.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    Phone *
                  </label>
                  <input name="phone" type="tel" required className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400" placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    Password *
                  </label>
                  <input 
                    name="password" 
                    type="password" 
                    required 
                    onChange={(e) => validatePassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400" 
                    placeholder="••••••••" 
                  />
                  {passwordError && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                      {passwordError}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">Min 8 chars, uppercase, lowercase, number, special char</p>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                  Specialty * (Select multiple)
                </label>
                <div className="w-full max-h-48 overflow-y-auto px-4 py-3 rounded-xl border-2 border-slate-300 bg-white space-y-2">
                  {(specialties && specialties.length > 0 ? specialties : ['AC Repair', 'Washing Machine', 'Refrigerator', 'TV Repair', 'Microwave', 'Geyser Repair']).map(s => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        name="specialties"
                        value={s}
                        className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-2 focus:ring-slate-400"
                      />
                      <span className="text-sm text-slate-900">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Street</label>
                  <input name="street" className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400" placeholder="123 Main St" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">City</label>
                  <input name="city" className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400" placeholder="Mumbai" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">State</label>
                  <input name="state" className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400" placeholder="Maharashtra" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Pincode</label>
                  <input name="pincode" type="text" pattern="[0-9]{6}" maxLength={6} className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400" placeholder="400001" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-medium transition-colors">
                  Add Technician
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {showBookingsModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Assigned Jobs</h2>
                <p className="text-sm text-slate-600 mt-1">{showBookingsModal.name} - {(showBookingsModal?.specialties && showBookingsModal.specialties.length) ? showBookingsModal.specialties.join(', ') : showBookingsModal.specialty}</p>
              </div>
              <button onClick={() => setShowBookingsModal(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="space-y-3">
              {technicianBookings.length > 0 ? (
                technicianBookings.map((booking) => (
                  <div key={booking._id} className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-slate-900">{booking.service}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                        booking.status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                        booking.status === 'Scheduled' ? 'bg-sky-100 text-sky-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">Customer: {booking.customer?.name || 'N/A'}</p>
                    <p className="text-sm text-slate-600">{booking.date} at {booking.time}</p>
                    <p className="text-sm font-semibold text-slate-900 mt-1">₹{booking.amount}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-slate-300 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <p className="font-medium text-slate-600">No jobs assigned yet</p>
                  <p className="text-sm text-slate-400 mt-1">This technician has no bookings</p>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
