"use client";

import React from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminRouteGuard from "../../components/AdminRouteGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname() || "/";

	// If user is on the admin login route, render children only (no sidebar/header)
	if (pathname === "/admin/login" || pathname === "/admin/login/") {
		return <>{children}</>;
	}

	return (
		<AdminRouteGuard>
			<div className="h-screen bg-slate-50 overflow-hidden">
				<div className="flex h-full">
					{/* Sidebar stays at the very top and full height */}
					<AdminSidebar />

					{/* Main column contains header + page content. Header will only span this area. */}
					<div className="flex-1 h-full flex flex-col">
						<AdminHeader />
						<main className="flex-1 overflow-auto">{children}</main>
					</div>
				</div>
			</div>
		</AdminRouteGuard>
	);
}


