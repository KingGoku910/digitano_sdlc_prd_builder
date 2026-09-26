"use client";

import React, { useEffect, useState } from "react";
import { pingBackendHealth, API_BASE_URL } from "../../services/api";
import { Activity, RefreshCw } from "lucide-react";

export function BackendStatusIndicator() {
  const [status, setStatus] = useState<"online" | "starting" | "offline">("offline");
  const [latency, setLatency] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const checkStatus = async () => {
    setIsPinging(true);
    try {
      const result = await pingBackendHealth();
      setStatus(result.status);
      setLatency(result.latencyMs);
    } catch {
      setStatus("offline");
    } finally {
      setIsPinging(false);
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    // Initial ping
    checkStatus();

    // Poll every 10 seconds per PRD specification
    const interval = setInterval(() => {
      checkStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="backend-status-indicator"
      className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#0B0F17]/80 border border-[#1E293B] text-xs transition-all"
    >
      <div className="flex items-center gap-2.5">
        {/* Status Dot */}
        <span className="relative flex h-2.5 w-2.5">
          {status === "online" && (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]"></span>
            </>
          )}
          {status === "starting" && (
            <>
              <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#F59E0B]"></span>
            </>
          )}
          {status === "offline" && (
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#EF4444]"></span>
          )}
        </span>

        {/* Status Text */}
        <div className="flex flex-col">
          <span className="font-medium text-slate-200">
            {status === "online" && "Backend Online"}
            {status === "starting" && "Backend Starting..."}
            {status === "offline" && "Backend Offline"}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {status === "online" && latency ? `${latency}ms latency` : "Render Free Tier (sleeping)"}
          </span>
        </div>
      </div>

      {/* Manual refresh button */}
      <button
        onClick={checkStatus}
        disabled={isPinging}
        title="Check status now"
        className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-[#1E293B] transition-colors cursor-pointer"
      >
        <RefreshCw className={`w-3 h-3 ${isPinging ? "animate-spin text-cyan-400" : ""}`} />
      </button>
    </div>
  );
}
