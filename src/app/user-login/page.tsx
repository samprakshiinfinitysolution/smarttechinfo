"use client";

import { Suspense } from "react";
import LoginPage from "../login/page";

function LoginWrapper() {
  return <LoginPage />;
}

export default function UserLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black/60 flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <LoginWrapper />
    </Suspense>
  );
}
