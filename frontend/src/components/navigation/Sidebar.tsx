"use client";

import React from "react";
import { PlusCircle, History, Settings, LogOut, Terminal, FolderGit2 } from "lucide-react";
import { BackendStatusIndicator } from "../dashboard/BackendStatusIndicator";
import { logoutUser, getStoredEmail } from "../../config/aws-cognito";

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onLogout?: () => void;
  onOpenExportModal?: () => void;
}

export function Sidebar({
  currentTab,
  onTabChange,
  onLogout,
  onOpenExportModal,
}: SidebarProps) {
  const userEmail = getStoredEmail();
  const userInitials = (userEmail[0] || "R").toUpperCase() + (userEmail[1] || "Y").toUpperCase();
  const userName = userEmail.split("@")[0];

  const handleLogoutClick = () => {
    logoutUser();
    if (onLogout) {
      onLogout();
    } else if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-[#131924] border-r border-[#1E293B] flex flex-col justify-between h-screen p-4 select-none">
      {/* Top Branding & Status */}
      <div className="space-y-6">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3 px-2 pt-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#06B6D4] to-[#3B82F6] p-[1px] shadow-lg shadow-cyan-500/10">
            <div className="w-full h-full bg-[#131924] rounded-[11px] flex items-center justify-center">
              <img
                src="/logo.svg"
                alt="Digitano Logo"
                width={24}
                height={24}
                className="w-6 h-6"
              />
            </div>
          </div>
          <div>
            <div className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>Digitano</span>
            </div>
            <div className="text-[11px] text-cyan-400 font-medium">Builder</div>
          </div>
        </div>

        {/* Backend Status Component */}
        <div className="pt-1">
          <BackendStatusIndicator />
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5 pt-2">
          <button
            onClick={() => onTabChange("new_project")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              currentTab === "new_project"
                ? "bg-[#06B6D4]/10 text-cyan-300 border border-[#06B6D4]/30 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-[#1E293B]/60"
            }`}
          >
            <PlusCircle className="w-4 h-4 text-cyan-400" />
            <span>New Project</span>
          </button>

          <button
            onClick={() => onTabChange("history")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              currentTab === "history"
                ? "bg-[#06B6D4]/10 text-cyan-300 border border-[#06B6D4]/30 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-[#1E293B]/60"
            }`}
          >
            <History className="w-4 h-4 text-slate-400" />
            <span>History</span>
          </button>

          <button
            onClick={() => onTabChange("settings")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              currentTab === "settings"
                ? "bg-[#06B6D4]/10 text-cyan-300 border border-[#06B6D4]/30 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-[#1E293B]/60"
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </button>

          {/* Monorepo Files Inspector */}
          {onOpenExportModal && (
            <button
              onClick={onOpenExportModal}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-cyan-300 hover:bg-[#1E293B]/60 transition-all cursor-pointer"
            >
              <FolderGit2 className="w-4 h-4 text-purple-400" />
              <span>Export Codebase</span>
            </button>
          )}
        </nav>
      </div>

      {/* User Badge & Logout Section */}
      <div className="pt-4 border-t border-[#1E293B] space-y-3">
        {/* User Card */}
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-xs font-semibold text-cyan-300">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white truncate">
              {userName}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {userEmail}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
