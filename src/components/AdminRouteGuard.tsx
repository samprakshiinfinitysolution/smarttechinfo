"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { sessionManager } from '@/lib/sessionManager';

export default function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Skip guard for login page
    if (pathname === '/admin/login') {
      setIsAuthorized(true);
      setIsLoading(false);
      return;
    }

    // Check if admin token exists and is valid
    const adminToken = localStorage.getItem('adminToken');
    
    if (!adminToken || !sessionManager.isTokenValid('admin')) {
      // Redirect to login if no valid token
      router.push('/admin/login?unauthorized=true');
      return;
    }

    // Initialize session manager for admin
    sessionManager.init('admin');
    setIsAuthorized(true);
    setIsLoading(false);

    // Cleanup on unmount
    return () => {
      sessionManager.destroy();
    };
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
