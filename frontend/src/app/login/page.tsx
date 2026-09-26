"use client";

import React from "react";
import { AuthCard } from "../../components/auth/AuthCard";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-[#0B0F17] flex items-center justify-center p-4 selection:bg-cyan-500/20">
      <AuthCard
        onBackToHome={() => {
          if (typeof window !== "undefined") window.location.href = "/";
        }}
        onSuccess={() => {
          if (typeof window !== "undefined") window.location.href = "/dashboard";
        }}
      />
    </div>
  );
}
