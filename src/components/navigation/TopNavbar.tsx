import React from "react";
import { Terminal, ShieldCheck, ExternalLink } from "lucide-react";

interface TopNavbarProps {
  currentProjectTitle?: string;
  onOpenExportModal?: () => void;
}

export function TopNavbar({ currentProjectTitle, onOpenExportModal }: TopNavbarProps) {
  return (
    <header className="h-14 border-b border-[#1E293B] bg-[#0B0F17]/80 backdrop-blur-md px-6 flex items-center justify-between z-10">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="font-hightech text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 uppercase tracking-wider flex items-center gap-1.5 hightech-glow-text">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>DIGITANO DEV-DOCS</span>
          </span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 shadow-[0_0_8px_rgba(6,182,212,0.3)]">
            v2.5
          </span>
        </div>
        {currentProjectTitle && (
          <>
            <span className="text-slate-600 hidden sm:inline">/</span>
            <span className="text-xs font-medium text-slate-300 truncate max-w-[120px] sm:max-w-[200px]">
              {currentProjectTitle}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2.5">
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
