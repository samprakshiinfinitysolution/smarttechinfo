import React from "react";

export const metadata = {
  title: "Admin Login",
};

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  // Return children directly so the admin login page is rendered without
  // the global Navbar/Footer or the admin sidebar/layout wrappers.
  return <>{children}</>;
}
