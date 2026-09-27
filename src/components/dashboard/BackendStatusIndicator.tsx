import React, { useEffect, useState } from "react";
import { pingBackendHealth } from "../../services/api";
import { RefreshCw, Server } from "lucide-react";

interface BackendStatusIndicatorProps {
  isCollapsed?: boolean;
}

export function BackendStatusIndicator({ isCollapsed = false }: BackendStatusIndicatorProps) {
  const [status, setStatus] = useState<"online" | "starting" | "offline">("online");
  const [latency, setLatency] = useState<number | null>(4);
  const [isPinging, setIsPinging] = useState(false);

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
    }
  };

  useEffect(() => {
    // Initial ping
    checkStatus();

    // Poll every 10 seconds
    const interval = setInterval(() => {
      checkStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const tooltipText =
    status === "online"
      ? `Server Online (${latency !== null ? `${latency}ms latency` : "Active"})`
      : status === "starting"
      ? "Server Starting..."
      : "Server Offline";

  if (isCollapsed) {
    return (
      <div className="flex justify-center w-full">
        <button
          onClick={checkStatus}
          disabled={isPinging}
          title={tooltipText}
          aria-label={tooltipText}
          className="relative group p-2.5 rounded-xl bg-[#0B0F17]/90 border border-[#1E293B] hover:border-cyan-500/40 transition-all flex items-center justify-center cursor-pointer"
        >
          <span className="relative flex h-3 w-3">
            {status === "online" && (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10B981]"></span>
              </>
            )}
            {status === "starting" && (
              <>
                <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F59E0B]"></span>
              </>
            )}
            {status === "offline" && (
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#EF4444]"></span>
            )}
          </span>

          {/* Floating Hover Tooltip */}
          <span className="pointer-events-none absolute left-full ml-3 px-2 py-1 rounded bg-[#1E293B] text-slate-200 text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg border border-slate-700 font-mono">
            {tooltipText}
          </span>
        </button>
      </div>
    );
  }

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
            {status === "online" && "Server Online"}
            {status === "starting" && "Server Starting..."}
            {status === "offline" && "Server Offline"}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {status === "online" && latency !== null ? `${latency}ms latency` : "Full-Stack Node.js"}
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
