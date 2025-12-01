"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function DashboardPage() {
  return <AdminDashboard />;
}

function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (token) {
        let url = `http://localhost:5000/api/admin/stats`;
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (params.toString()) url += `?${params.toString()}`;
        
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 flex items-center justify-center h-96">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <h3 className="text-sm font-medium text-slate-700 mb-3">Revenue Analytics - Date Range Filter</h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={fetchStats}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Apply Filter
          </button>
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setTimeout(fetchStats, 100);
            }}
            className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
      <section className="grid grid-cols-1 md:grid-cols-5 gap-5">
        <Card title="Total Revenue" value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`} icon="money" />
        <Card title="Total Bookings" value={stats?.totalBookings || 0} icon="calendar" />
        <Card title="Total Technicians" value={stats?.totalTechnicians || 0} icon="tech" />
        <Card title="Total Users" value={stats?.totalUsers || 0} icon="users" />
        <Card title="Active Services" value={`${stats?.activeServices || 0}/${stats?.totalServices || 0}`} icon="services" />
      </section>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-slate-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Bookings Trend</h3>
              <p className="text-xs text-slate-400">Last 12 periods</p>
            </div>
            <div className="h-36">
              <LineChart data={stats?.bookingsTrend || []} />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Revenue by Service</h3>
              <p className="text-xs text-slate-400">Completed bookings</p>
            </div>
            <div className="h-40">
              {stats?.revenueByService && stats.revenueByService.length > 0 ? (
                <>
                  <BarChart data={stats.revenueByService.map((s: any) => s.value)} />
                  <div className="mt-3 text-xs text-slate-500 flex gap-4 flex-wrap">
                    {stats.revenueByService.map((s: any, i: number) => (
                      <span key={i}>{s.label}</span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-slate-400">No revenue data available</div>
              )}
            </div>
          </div>
        </div>

        <div>
          <RecentActivity items={stats?.recentActivity || []} />
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, hint, icon }: { title: string; value: string | number; hint?: string; icon?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all flex items-start gap-4 group">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f0f7ff] to-[#e6f0ff] flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon === "money" && (
          <svg className="w-6 h-6 text-[#cc375f]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 1C5.9 1 1 5.9 1 12s4.9 11 11 11 11-4.9 11-11S18.1 1 12 1zm1 17.93V20h-2v-1.07A6.002 6.002 0 0 1 6 12c0-1.53.55-2.93 1.47-4.02L11 9v2H9v2h4V9l3.53-1.02A6.002 6.002 0 0 1 17 12c0 2.21-1.22 4.13-3 5.93z" />
          </svg>
        )}
        {icon === "calendar" && (
          <svg className="w-6 h-6 text-[#0b63a6]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M7 10h5v5H7z" opacity=".9" />
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 14H5V9h14v9z" />
          </svg>
        )}
        {icon === "tech" && (
          <svg className="w-6 h-6 text-[#0b84a5]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v2h2v2H4v2a2 2 0 0 0 2 2h2v2a4 4 0 0 0 8 0v-2h2a2 2 0 0 0 2-2v-2h-2v-2h2v-2a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z" />
          </svg>
        )}
        {icon === "users" && (
          <svg className="w-6 h-6 text-[#2463f0]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M16 11c1.66 0 3-1.34 3-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM6 11c1.66 0 3-1.34 3-3S7.66 5 6 5 3 6.34 3 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5C13 14.17 8.33 13 6 13zm10 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V20h6v-3.5C23 14.17 18.33 13 16 13z" />
          </svg>
        )}
        {icon === "services" && (
          <svg className="w-6 h-6 text-[#10b981]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
          </svg>
        )}
      </div>
      <div className="flex-1">
        <div className="text-sm text-slate-500">{title}</div>
        <div className="text-2xl font-bold text-slate-900 mt-2">{value}</div>
        {hint && <div className="text-xs text-emerald-600 mt-1 font-medium">{hint}</div>}
      </div>
    </div>
  );
}

function LineChart({ data = [], width = 800, height = 140 }: { data?: number[]; width?: number; height?: number }) {
  const max = Math.max(...data, 1);
  const points = data
    .map((d, i) => {
      const x = (i / Math.max(data.length - 1, 1)) * width;
      const y = height - (d / max) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPath = data
    .map((d, i) => {
      const x = (i / Math.max(data.length - 1, 1)) * width;
      const y = height - (d / max) * (height - 8) - 4;
      return `${i === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
        </linearGradient>
      </defs>
      {data.length > 0 && (
        <>
          <path d={`${areaPath} L ${width} ${height} L 0 ${height} Z`} fill="url(#g)" />
          <polyline fill="none" stroke="#2563eb" strokeWidth={2} points={points} strokeLinejoin="round" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function BarChart({ data = [], width = 600, height = 140 }: { data?: number[]; width?: number; height?: number }) {
  const max = Math.max(...data, 1);
  const barWidth = width / Math.max(data.length, 1);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
      {data.map((d, i) => {
        const h = (d / max) * (height - 8);
        const x = i * barWidth + barWidth * 0.12;
        const w = barWidth * 0.76;
        const y = height - h - 4;
        return <rect key={i} x={x} y={y} width={w} height={h} rx={4} fill="#7c3aed" />;
      })}
    </svg>
  );
}

function RecentActivity({ items }: { items: { id: string; text: string; time: string }[] }) {
  return (
    <div className="bg-white rounded-lg border border-slate-100 p-4 shadow-sm">
      <h3 className="text-sm font-medium text-slate-600 mb-2">Recent Activity</h3>
      <ul className="divide-y">
        {items.map((it) => (
          <li key={it.id} className="py-2 flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-800">{it.text}</p>
              <p className="text-xs text-slate-400 mt-1">{it.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Completed: "bg-emerald-100 text-emerald-800",
    Pending: "bg-yellow-100 text-yellow-800",
    Cancelled: "bg-red-100 text-red-800",
    "In Progress": "bg-amber-100 text-amber-800",
    Scheduled: "bg-sky-100 text-sky-800",
  };
  const cls = map[status] ?? "bg-slate-100 text-slate-800";
  return <span className={`px-3 py-1 rounded-full text-xs ${cls}`}>{status}</span>;
}

