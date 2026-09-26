"use client";

import React from "react";
import { Sparkles, Terminal, ShieldCheck, ExternalLink, KeyRound } from "lucide-react";

interface TopNavbarProps {
  currentProjectTitle?: string;
  onOpenExportModal?: () => void;
  onOpenSecretsModal?: () => void;
}

export function TopNavbar({ currentProjectTitle, onOpenExportModal, onOpenSecretsModal }: TopNavbarProps) {
  return (
    <header className="h-14 border-b border-[#1E293B] bg-[#0B0F17]/80 backdrop-blur-md px-6 flex items-center justify-between z-10">
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5" />
          <span>SDLC Engine v2.0</span>
        </span>
        <span className="text-slate-600">/</span>
        <span className="text-xs font-medium text-slate-300">
          {currentProjectTitle || "Autonomous Scrum Orchestrator"}
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        {onOpenSecretsModal && (
          <button
            onClick={onOpenSecretsModal}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/40 text-xs font-mono text-cyan-300 transition-colors cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
            <span>Active Secrets</span>
          </button>
        )}

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-[11px] font-mono text-[#10B981]">
          <ShieldCheck className="w-3.5 h-3.5" />
          AWS Cognito Secured
        </span>

        {onOpenExportModal && (
          <button
            onClick={onOpenExportModal}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-xs font-medium text-slate-200 transition-colors cursor-pointer"
          >
            <span>GitHub Spec</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>
        )}
      </div>
    </header>
  );
}
