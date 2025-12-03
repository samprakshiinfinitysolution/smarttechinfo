"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Toast from "@/components/Toast";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'warning' | 'info'} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const categories = Array.from(new Set(services.map(s => s.category).filter(Boolean)));

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/services`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setServices(data.services || []);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const resolveImage = (img?: string) => {
    if (!img) return "";
    const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api$/,'');
    return img.startsWith('http') ? img : `${base}${img}`;
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, isEdit = false) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      const url = isEdit 
        ? `${process.env.NEXT_PUBLIC_API_URL || ''}/services/${showEditModal._id}`
        : `${process.env.NEXT_PUBLIC_API_URL || ''}/services`;
      
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        await fetchServices();
        setShowAddModal(false);
        setShowEditModal(null);
        setImagePreview("");
        setToast({ message: `Service ${isEdit ? 'updated' : 'created'} successfully`, type: 'success' });
      } else {
        setToast({ message: 'Failed to save service', type: 'error' });
      }
    } catch (error) {
      console.error("Error saving service:", error);
      setToast({ message: 'Failed to save service', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      await fetchServices();
      setShowDeleteModal(null);
      setToast({ message: 'Service deleted successfully', type: 'success' });
    } catch (error) {
      console.error("Error deleting service:", error);
      setToast({ message: 'Failed to delete service', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = searchTerm === "" || 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 flex items-center justify-center h-96">
        <LoadingSpinner size="lg" message="Loading services..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="text-sm text-slate-500">Total Services</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{services.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="text-sm text-slate-500">Active</div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{services.filter(s => s.isActive).length}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="text-sm text-slate-500">Inactive</div>
          <div className="text-2xl font-bold text-red-600 mt-2">{services.filter(s => !s.isActive).length}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="text-sm text-slate-500">Categories</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{new Set(services.map(s => s.category)).size}</div>
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
              placeholder="Search services by name or description"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-6 py-3 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <option>All</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Service
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div key={service._id} className="bg-slate-50 rounded-xl border-2 border-slate-200 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all group">
            <div className="relative">
              <img src={resolveImage(service.image)} alt={service.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform" />
              <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-lg ${service.isActive ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                {service.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="p-5 bg-white">
              <div className="mb-3">
                <h3 className="text-lg font-bold text-slate-900 mb-1">{service.name}</h3>
                <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">{service.category}</span>
              </div>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">{service.description}</p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-2xl font-bold text-slate-900">₹{service.serviceCharges}</span>
                <div className="flex gap-2">
                  <button onClick={() => setShowEditModal(service)} className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button onClick={() => setShowDeleteModal(service)} className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredServices.length === 0 && (
          <div className="col-span-3 text-center py-12">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
            <p className="text-slate-500 font-medium">No services found</p>
            <p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
      </div>

      {(showAddModal || showEditModal) && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">{showEditModal ? 'Edit Service' : 'Add New Service'}</h2>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(null); setImagePreview(""); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <form onSubmit={(e) => handleSubmit(e, !!showEditModal)} className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                  Service Name *
                </label>
                <input name="name" defaultValue={showEditModal?.name} required placeholder="e.g., AC Repair Service" className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400" />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  Description *
                </label>
                <textarea name="description" defaultValue={showEditModal?.description} required rows={3} placeholder="Describe the service in detail..." className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                    Service Charges (₹) *
                  </label>
                  <input name="serviceCharges" type="number" defaultValue={showEditModal?.serviceCharges} required min="0" placeholder="500" className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                    Category *
                  </label>
                  <div className="relative">
                    <select 
                      name="category" 
                      defaultValue={showEditModal?.category} 
                      required 
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium appearance-none"
                      onChange={(e) => {
                        if (e.target.value === '__new__') {
                          setShowNewCategory(true);
                          e.target.value = '';
                        }
                      }}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      <option value="__new__" className="text-blue-600 font-semibold">+ Create New Category</option>
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                  Service Image {!showEditModal && '*'}
                </label>
                <input name="image" type="file" accept="image/*" onChange={handleImageChange} required={!showEditModal} className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200" />
                {(imagePreview || showEditModal?.image) && (
                  <img src={imagePreview || resolveImage(showEditModal?.image)} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-lg" />
                )}
              </div>
              {showEditModal && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="isActive" 
                      defaultChecked={showEditModal.isActive} 
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-400" 
                    />
                    <div>
                      <span className="text-sm font-semibold text-slate-900">Service Active</span>
                      <p className="text-xs text-slate-600">Enable this service for customers to book</p>
                    </div>
                  </label>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(null); setImagePreview(""); }} className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium" disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (showEditModal ? 'Update Service' : 'Create Service')}
                </button>
              </div>
            </form>
          </div>
        </div>,
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
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Delete Service</h2>
              </div>
              <button onClick={() => setShowDeleteModal(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-600 mb-2">Service Name</p>
                <p className="text-lg font-bold text-slate-900">{showDeleteModal.name}</p>
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
                    <p className="text-xs text-red-700">The service will be permanently deleted.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-6">
              <button onClick={() => setShowDeleteModal(null)} className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-colors" disabled={isSubmitting}>
                Cancel
              </button>
              <button onClick={() => handleDelete(showDeleteModal._id)} className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSubmitting}>
                {isSubmitting ? 'Deleting...' : 'Delete Service'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {showNewCategory && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">New Category</h2>
              </div>
              <button onClick={() => { setShowNewCategory(false); setNewCategoryName(""); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-900">Create a custom category for your service. This will be available for all future services.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category Name *</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Plumbing, Electrical, Carpentry"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const trimmedName = newCategoryName.trim();
                      if (trimmedName) {
                        const isDuplicate = categories.some(cat => cat.toLowerCase() === trimmedName.toLowerCase());
                        if (isDuplicate) {
                          setToast({ message: 'Category already exists!', type: 'warning' });
                          return;
                        }
                        const select = document.querySelector('select[name="category"]') as HTMLSelectElement;
                        if (select) {
                          const option = document.createElement('option');
                          option.value = trimmedName;
                          option.text = trimmedName;
                          option.selected = true;
                          select.insertBefore(option, select.options[select.options.length - 1]);
                        }
                        setShowNewCategory(false);
                        setNewCategoryName("");
                        setToast({ message: 'Category created successfully!', type: 'success' });
                      }
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-6">
              <button
                onClick={() => { setShowNewCategory(false); setNewCategoryName(""); }}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const trimmedName = newCategoryName.trim();
                  if (trimmedName) {
                    // Check for duplicate category (case-insensitive)
                    const isDuplicate = categories.some(cat => cat.toLowerCase() === trimmedName.toLowerCase());
                    if (isDuplicate) {
                      setToast({ message: 'Category already exists!', type: 'warning' });
                      return;
                    }
                    const select = document.querySelector('select[name="category"]') as HTMLSelectElement;
                    if (select) {
                      const option = document.createElement('option');
                      option.value = trimmedName;
                      option.text = trimmedName;
                      option.selected = true;
                      select.insertBefore(option, select.options[select.options.length - 1]);
                    }
                    setShowNewCategory(false);
                    setNewCategoryName("");
                    setToast({ message: 'Category created successfully!', type: 'success' });
                  }
                }}
                disabled={!newCategoryName.trim()}
                className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Category
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
