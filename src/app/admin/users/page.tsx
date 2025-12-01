"use client";
import React, { useState, useEffect } from "react";
import Toast from "@/components/Toast";
import { useRouter } from 'next/navigation';
import { api } from "@/lib/api";
import { createPortal } from "react-dom";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState<{type: 'deactivate' | 'delete' | 'profile' | 'bookings' | 'edit' | null, user: any}>({type: null, user: null});
  const [menuPosition, setMenuPosition] = useState<{x: number, y: number, showAbove: boolean} | null>(null);
  const [authMissing, setAuthMissing] = useState(false);
  const router = useRouter();
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setAuthMissing(true);
        setUsers([]);
        return;
      }
      setAuthMissing(false);
      setFetchError(null);
      const data = await api.getAllUsers(token);
      // If API returns an object with message or error, surface it
      if (!data) {
        setUsers([]);
        setFetchError('No response from server');
      } else if (data.message || data.error) {
        setUsers([]);
        setFetchError(data.message || data.error || 'Server returned an error');
      } else if (data.users) {
        setUsers(Array.isArray(data.users) ? data.users : []);
      } else {
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      const error = err as any;
      console.error("Error fetching users:", error);
      setUsers([]);
      setFetchError(error?.message || String(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // When a modal is opened, prefer the freshest user object from `users` list
  const modalUser = showModal.user ? (users.find(u => String(u._id) === String(showModal.user._id)) || showModal.user) : null;
  const [fetchedModalUser, setFetchedModalUser] = useState<any | null>(null);
  const displayUser = fetchedModalUser || modalUser;

  // Fetch the single user from server when profile modal opens to guarantee freshest data
  useEffect(() => {
    let mounted = true;
    const fetchSingle = async () => {
      if (showModal.type === 'profile' && showModal.user) {
        try {
          const token = localStorage.getItem('adminToken') || '';
          const data = await api.getUser(token, String(showModal.user._id));
          if (mounted) setFetchedModalUser(data);
        } catch (e) {
          console.error('Failed to fetch single user:', e);
          if (mounted) setFetchedModalUser(null);
        }
      } else {
        if (mounted) setFetchedModalUser(null);
      }
    };
    fetchSingle();
    return () => { mounted = false; };
  }, [showModal.type, showModal.user]);

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (token) {
        const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
        await api.updateUserStatus(token, userId, newStatus);
        await fetchUsers();
        setShowModal({type: null, user: null});
      }
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (token) {
        const result = await api.deleteUser(token, userId);
        if (result.hasActiveBookings) {
          setToast({ message: result.message || 'Cannot delete user with active bookings', type: 'warning' });
          return;
        }
        await fetchUsers();
        setShowModal({type: null, user: null});
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setToast({ message: 'Failed to delete user', type: 'error' });
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto p-6 text-center">Loading users...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {authMissing && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
          <div className="flex items-center justify-between">
            <div>Admin not signed in — please <button onClick={()=>router.push('/admin/login')} className="underline font-medium">sign in</button> to view users.</div>
            <div>
              <button onClick={()=>router.push('/admin/login')} className="px-3 py-1 bg-amber-600 text-white rounded">Go to Login</button>
            </div>
          </div>
        </div>
      )}
      {fetchError && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
          <div className="flex items-center justify-between">
            <div>Error loading users: <span className="font-medium">{fetchError}</span></div>
            <div>
              <button onClick={() => { setLoading(true); fetchUsers(); }} className="px-3 py-1 bg-red-600 text-white rounded">Retry</button>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group">
          <div className="text-sm text-slate-500">Total Users</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{users.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group">
          <div className="text-sm text-slate-500">Active Users</div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{users.filter(u => u.status === "Active").length}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group">
          <div className="text-sm text-slate-500">Total Bookings</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{users.reduce((acc, u) => acc + u.bookings, 0)}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group">
          <div className="text-sm text-slate-500">New This Month</div>
          <div className="text-2xl font-bold text-sky-600 mt-2">{users.filter(u => new Date(u.joinedDate).getMonth() === new Date().getMonth()).length}</div>
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
              placeholder="Search users by name, email, or phone"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-6 py-3 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <button 
            onClick={async () => {
              const token = localStorage.getItem("adminToken");
              if (token) {
                try {
                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/admin/export/users`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  const blob = await res.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'users.csv';
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
        </div>

        <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-white border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">User ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Name</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Email</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Bookings</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Joined Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter(user => {
                  const matchesSearch = searchTerm === "" || 
                    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.phone?.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesStatus = statusFilter === "All" || statusFilter === "All Status" || user.status === statusFilter;
                  return matchesSearch && matchesStatus;
                })
                .map((user, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-700">{user._id?.slice(-6) || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{user.phone || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">{user.bookings || 0}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{new Date(user.joinedDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={(e) => {
                        if (openMenuId === user._id) {
                          setOpenMenuId(null);
                          setMenuPosition(null);
                        } else {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const menuHeight = 240;
                          const spaceBelow = window.innerHeight - rect.bottom;
                          const shouldShowAbove = spaceBelow < menuHeight;
                          
                          setMenuPosition({ 
                            x: rect.right - 192, 
                            y: shouldShowAbove ? rect.top : rect.bottom,
                            showAbove: shouldShowAbove
                          });
                          setOpenMenuId(user._id);
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
                const user = users.find(u => u._id === openMenuId);
                if (user) setShowModal({type: 'profile', user});
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
                const user = users.find(u => u._id === openMenuId);
                if (user) setShowModal({type: 'bookings', user});
                setOpenMenuId(null);
                setMenuPosition(null);
              }}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              View Bookings
            </button>
            <button 
              onClick={() => {
                const user = users.find(u => u._id === openMenuId);
                if (user) setShowModal({type: 'edit', user});
                setOpenMenuId(null);
                setMenuPosition(null);
              }}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit User
            </button>
            <button 
              onClick={() => {
                const user = users.find(u => u._id === openMenuId);
                if (user) setShowModal({type: user.status === "Active" ? 'deactivate' : 'deactivate', user});
                setOpenMenuId(null);
                setMenuPosition(null);
              }}
              className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {users.find(u => u._id === openMenuId)?.status === "Active" ? "Deactivate" : "Activate"}
            </button>
            <button 
              onClick={() => {
                const user = users.find(u => u._id === openMenuId);
                if (user) setShowModal({type: 'delete', user});
                setOpenMenuId(null);
                setMenuPosition(null);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Delete User
            </button>
          </div>
        </>,
        document.body
      )}

      {showModal.type && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {showModal.type === 'profile' && (
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                  <h2 className="text-2xl font-bold text-slate-900">User Profile</h2>
                  <button onClick={() => { setShowModal({type: null, user: null}); setOpenMenuId(null); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                      {displayUser?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">{displayUser?.name}</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${displayUser?.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                        {displayUser?.status}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <div className="text-xs text-slate-500 mb-1 font-medium">Email Address</div>
                      <div className="text-sm font-semibold text-slate-900">{displayUser?.email}</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <div className="text-xs text-slate-500 mb-1 font-medium">Phone Number</div>
                      <div className="text-sm font-semibold text-slate-900">{displayUser?.phone || 'Not provided'}</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <div className="text-xs text-slate-500 mb-1 font-medium">User ID</div>
                      <div className="text-sm font-semibold text-slate-900 font-mono">{displayUser?._id?.slice(-8) || 'N/A'}</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <div className="text-xs text-slate-500 mb-1 font-medium">Total Bookings</div>
                      <div className="text-sm font-semibold text-slate-900">{displayUser?.bookings || 0} bookings</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <div className="text-xs text-slate-500 mb-1 font-medium">Joined Date</div>
                      <div className="text-sm font-semibold text-slate-900">{new Date(displayUser?.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <div className="text-xs text-slate-500 mb-1 font-medium">Account Role</div>
                      <div className="text-sm font-semibold text-slate-900">{displayUser?.role || 'Customer'}</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <div className="text-xs text-slate-500 mb-1 font-medium">Address</div>
                      <div className="text-sm font-semibold text-slate-900">{displayUser?.address || 'Not provided'}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showModal.type === 'bookings' && (
              <BookingsList user={displayUser} onClose={() => setShowModal({type: null, user: null})} />
            )}

            {showModal.type === 'edit' && (
              <EditForm
                user={displayUser}
                onClose={() => setShowModal({type: null, user: null})}
                onSaved={async (updatedUser:any)=>{
                  // Keep modal data fresh
                  setFetchedModalUser(updatedUser);

                  // If the admin edited the currently-logged-in user in this browser session,
                  // update localStorage so the user's Profile page shows the new values live.
                  try {
                    const currentUserStr = localStorage.getItem('user');
                    if (currentUserStr) {
                      const currentUser = JSON.parse(currentUserStr);
                      const currentId = String(currentUser.id || currentUser._id || currentUser._id);
                      const updatedId = String(updatedUser._id || updatedUser.id || updatedUser._id);
                      if (currentId && updatedId && currentId === updatedId) {
                        // Merge so any other fields present in storage remain intact
                        const merged = { ...currentUser, ...updatedUser };
                        localStorage.setItem('user', JSON.stringify(merged));
                        // Notify other listeners/tabs
                        window.dispatchEvent(new Event('storage'));
                      }
                    }
                  } catch (e) {
                    console.error('Failed to sync localStorage user after admin edit', e);
                  }

                  await fetchUsers();
                  setShowModal({type: 'profile', user: updatedUser});
                }}
              />
            )}

            {(showModal.type === 'delete' || showModal.type === 'deactivate') && (
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                  <h2 className="text-2xl font-bold text-slate-900">{showModal.type === 'delete' ? 'Delete User' : (showModal.user?.status === 'Active' ? 'Deactivate User' : 'Activate User')}</h2>
                  <button onClick={() => { setShowModal({type: null, user: null}); setOpenMenuId(null); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${showModal.type === 'delete' ? 'bg-red-100' : 'bg-amber-100'}`}>
                      {showModal.type === 'delete' ? (
                        <svg className="w-8 h-8 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                      ) : (
                        <svg className="w-8 h-8 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">{showModal.user?.name}</h3>
                      <p className="text-sm text-slate-600 mt-1">{showModal.user?.email}</p>
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl border-2 ${showModal.type === 'delete' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                    <div className="flex items-start gap-3">
                      <svg className={`w-5 h-5 mt-0.5 ${showModal.type === 'delete' ? 'text-red-600' : 'text-amber-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      <div>
                        <h4 className={`font-semibold ${showModal.type === 'delete' ? 'text-red-900' : 'text-amber-900'}`}>
                          {showModal.type === 'delete' ? 'Warning: This action cannot be undone' : 'Confirm Status Change'}
                        </h4>
                        <p className={`text-sm mt-1 ${showModal.type === 'delete' ? 'text-red-700' : 'text-amber-700'}`}>
                          {showModal.type === 'delete' 
                            ? `Deleting ${showModal.user?.name} will permanently remove all their data, including ${showModal.user?.bookings || 0} bookings. This action is irreversible.`
                            : `${showModal.user?.status === 'Active' ? 'Deactivating' : 'Activating'} ${showModal.user?.name} will ${showModal.user?.status === 'Active' ? 'prevent them from accessing their account' : 'restore their account access'}.`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => { setShowModal({type: null, user: null}); setOpenMenuId(null); }} className="flex-1 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors">Cancel</button>
                  <button onClick={async ()=>{
                    if (showModal.type === 'delete') {
                      await handleDeleteUser(showModal.user._id);
                    } else {
                      await handleStatusToggle(showModal.user._id, showModal.user.status);
                    }
                    setOpenMenuId(null);
                  }} className={`flex-1 px-5 py-3 font-medium rounded-xl transition-all shadow-lg text-white ${showModal.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}`}>
                    {showModal.type === 'delete' ? 'Delete User' : (showModal.user?.status === 'Active' ? 'Deactivate' : 'Activate')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
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

function BookingsList({ user, onClose }: { user: any; onClose: () => void }){
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const fetch = async ()=>{
      setLoading(true);
      try{
        const token = localStorage.getItem('adminToken') || '';
        const all = await api.getAllBookings(token);
        const bookingsArray = all.bookings ? all.bookings : (Array.isArray(all) ? all : []);
        const list = bookingsArray.filter((b: any) => String(b.customer?._id || b.customer) === String(user._id || user._id));
        setBookings(list);
      }catch(e){ console.error(e); setBookings([]); }
      setLoading(false);
    };
    if (user) fetch();
  }, [user]);

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Bookings</h2>
          <p className="text-sm text-slate-600 mt-1">{user?.name} • {bookings.length} total bookings</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-600">Loading bookings...</div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium">No bookings found</p>
          <p className="text-sm text-slate-500 mt-1">This user hasn't made any bookings yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {bookings.map(b=> (
            <div key={b._id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 text-base">{b.service || 'Service'}</h4>
                  <p className="text-xs text-slate-500 mt-1">Booking ID: {b._id?.slice(-8) || 'N/A'}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(b.status)}`}>
                  {b.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  <span className="text-sm text-slate-700">{b.date || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  <span className="text-sm text-slate-700">{b.time || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                  <span className="text-sm text-slate-700">{b.technician?.name || 'Unassigned'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                  <span className="text-sm font-semibold text-slate-900">₹{b.amount || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EditForm({ user, onClose, onSaved }: { user:any; onClose: ()=>void; onSaved: (updatedUser:any)=>void }){
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [saving, setSaving] = useState(false);

  useEffect(()=>{
    if (user){
      setName(user.name||'');
      setEmail(user.email||'');
      setPhone(user.phone||'');
      setAddress(user.address||'');
    }
  }, [user]);

  const handleSave = async ()=>{
    try{
      setSaving(true);
      const token = localStorage.getItem('adminToken') || '';
      const updated = await api.adminUpdateUser(token, user._id, { name, email, phone, address });
      await onSaved(updated);
    }catch(e){ console.error(e); }
    finally{ setSaving(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Edit User</h2>
          <p className="text-sm text-slate-600 mt-1">Update user information</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{user?.name}</h3>
            <p className="text-sm text-slate-500">User ID: {user?._id?.slice(-8)}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                Full Name
              </div>
            </label>
            <input value={name} onChange={e=>setName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all" placeholder="Enter full name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                Phone Number
              </div>
            </label>
            <input value={phone} onChange={e=>setPhone(e.target.value)} type="tel" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all" placeholder="Enter phone number" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
              Email Address
            </div>
          </label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all" placeholder="Enter email address" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              Address
            </div>
          </label>
          <textarea value={address} onChange={e=>setAddress(e.target.value)} rows={2} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all resize-none" placeholder="Enter address" />
        </div>
        <div className="flex gap-3 pt-4">
          <button onClick={onClose} className="flex-1 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 px-5 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" opacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" /></svg>
                Saving...
              </span>
            ) : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
