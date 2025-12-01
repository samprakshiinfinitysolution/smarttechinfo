"use client";
import React, { useState, useEffect } from "react";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30days");
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>({
    stats: { totalRevenue: 0, totalBookings: 0, avgRating: 0, completionRate: 0 },
    revenueTrend: [],
    serviceDistribution: [],
    topTechnicians: [],
    topCustomers: []
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (token) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/admin/analytics`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 flex items-center justify-center h-96">
        <div className="text-slate-600">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group">
          <div className="text-sm text-slate-500">Total Revenue</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">₹{analytics.stats.totalRevenue.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">From completed bookings</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group">
          <div className="text-sm text-slate-500">Total Bookings</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{analytics.stats.totalBookings}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">All time bookings</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group">
          <div className="text-sm text-slate-500">Avg. Rating</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{analytics.stats.avgRating} ⭐</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">From rated bookings</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group">
          <div className="text-sm text-slate-500">Completion Rate</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{analytics.stats.completionRate}%</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Completed vs total</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Revenue Trend</h3>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 rounded-lg bg-slate-50 text-slate-700 text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>
          <LineChart data={analytics.revenueTrend} />
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Service Distribution</h3>
          <div className="space-y-3">
            {analytics.serviceDistribution.length > 0 ? (
              analytics.serviceDistribution.slice(0, 5).map((service: any, i: number) => {
                const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-slate-500'];
                return <ServiceBar key={i} label={service.label} value={service.value} color={colors[i]} />;
              })
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">No service data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Technicians */}
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Performing Technicians</h3>
          <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
            <table className="w-full">
              <thead className="bg-white border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Jobs</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Rating</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topTechnicians.length > 0 ? (
                  analytics.topTechnicians.map((tech: any, i: number) => (
                    <tr key={i} className={`${i < analytics.topTechnicians.length - 1 ? 'border-b border-slate-100' : ''} hover:bg-slate-50`}>
                      <td className="px-4 py-3 text-sm text-slate-900 font-medium">{tech.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{tech.jobs}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-700 text-white text-xs">
                          {tech.rating.toFixed(1)} ⭐
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-500">No technician data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Customers</h3>
          <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
            <table className="w-full">
              <thead className="bg-white border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Bookings</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Spent</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topCustomers.length > 0 ? (
                  analytics.topCustomers.map((customer: any, i: number) => (
                    <tr key={i} className={`${i < analytics.topCustomers.length - 1 ? 'border-b border-slate-100' : ''} hover:bg-slate-50`}>
                      <td className="px-4 py-3 text-sm text-slate-900 font-medium">{customer.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{customer.bookings}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">₹{customer.spent.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-500">No customer data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function LineChart({ data = [], width = 800, height = 200 }: { data?: number[]; width?: number; height?: number }) {
  const max = Math.max(...data, 1);
  const points = data
    .map((d, i) => {
      const x = (i / Math.max(data.length - 1, 1)) * width;
      const y = height - (d / max) * (height - 20) - 10;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPath = data
    .map((d, i) => {
      const x = (i / Math.max(data.length - 1, 1)) * width;
      const y = height - (d / max) * (height - 20) - 10;
      return `${i === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join(" ");

  return (
    <div className="w-full h-64">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {data.length > 0 && (
          <>
            <path d={`${areaPath} L ${width} ${height} L 0 ${height} Z`} fill="url(#gradient)" />
            <polyline fill="none" stroke="#3b82f6" strokeWidth={3} points={points} strokeLinejoin="round" strokeLinecap="round" />
          </>
        )}
      </svg>
    </div>
  );
}

function ServiceBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-slate-700">{label}</span>
        <span className="text-sm font-semibold text-slate-900">{value}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}
