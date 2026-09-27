import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  History,
  Settings,
  LogOut,
  FolderGit2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { BackendStatusIndicator } from "../dashboard/BackendStatusIndicator";
import { logoutUser, getStoredEmail } from "../../config/aws-cognito";

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onLogout?: () => void;
  onOpenExportModal?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

export function Sidebar({
  currentTab,
  onTabChange,
  onLogout,
  onOpenExportModal,
  isCollapsed: controlledIsCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("digitano_sidebar_minimized") === "true";
    }
    return false;
  });

  const isCollapsed = controlledIsCollapsed !== undefined ? controlledIsCollapsed : internalCollapsed;

  const handleToggle = () => {
    const next = !isCollapsed;
    setInternalCollapsed(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("digitano_sidebar_minimized", String(next));
    }
    if (onToggleCollapse) {
      onToggleCollapse(next);
    }
  };

  const userEmail = getStoredEmail();
  const userInitials = (userEmail[0] || "R").toUpperCase() + (userEmail[1] || "Y").toUpperCase();
  const userName = userEmail.split("@")[0];

  const handleLogoutClick = () => {
    logoutUser();
    if (onLogout) {
      onLogout();
    }
  };

  const navItems = [
    {
      id: "new_project",
      label: "New Project",
      icon: PlusCircle,
      iconColor: "text-cyan-400",
    },
    {
      id: "history",
      label: "History",
      icon: History,
      iconColor: "text-slate-400",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      iconColor: "text-slate-400",
    },
  ];

  return (
    <aside
      className={`flex-shrink-0 bg-[#131924] border-r border-[#1E293B] flex flex-col justify-between h-screen transition-all duration-300 ease-in-out select-none z-20 ${
        isCollapsed ? "w-[70px] p-2.5" : "w-64 p-4"
      }`}
    >
      {/* Top Section */}
      <div className="space-y-5">
        {/* Brand Header & Toggle Button */}
        <div className={`flex items-center ${isCollapsed ? "flex-col gap-3 justify-center" : "justify-between"} px-1 pt-1`}>
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#06B6D4] to-[#3B82F6] p-[1px] shadow-lg shadow-cyan-500/10 shrink-0">
              <div className="w-full h-full bg-[#131924] rounded-[11px] flex items-center justify-center">
                <img
                  src="/logo.svg"
                  alt="Digitano Logo"
                  width={22}
                  height={22}
                  className="w-5 h-5"
                />
              </div>
            </div>

            {!isCollapsed && (
              <div className="overflow-hidden whitespace-nowrap">
                <div className="text-base font-bold text-white tracking-tight flex items-center gap-1.5 leading-none">
                  <span>Digitano</span>
                </div>
                <div className="text-[11px] text-cyan-400 font-medium mt-0.5 leading-none">Builder</div>
              </div>
            )}
          </div>

          {/* Minimize / Expand Toggle Button */}
          <button
            onClick={handleToggle}
            title={isCollapsed ? "Expand sidebar" : "Minimize sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Minimize sidebar"}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-[#1E293B] border border-transparent hover:border-slate-700 transition-colors cursor-pointer shrink-0"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-cyan-400" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Backend Status Component */}
        <div className="pt-0.5">
          <BackendStatusIndicator isCollapsed={isCollapsed} />
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5 pt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => onTabChange(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isCollapsed ? "justify-center p-2.5" : "gap-3 px-3.5 py-2.5"
                  } ${
                    isActive
                      ? "bg-[#06B6D4]/15 text-cyan-300 border border-[#06B6D4]/30 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-[#1E293B]/60 border border-transparent"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-cyan-300" : item.iconColor
                    }`}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>

                {/* Floating tooltip when collapsed */}
                {isCollapsed && (
                  <span className="pointer-events-none absolute left-full ml-3 px-2 py-1 rounded bg-[#1E293B] text-slate-200 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg border border-slate-700">
                    {item.label}
                  </span>
                )}
              </div>
            );
          })}

          {/* Monorepo Files Inspector */}
          {onOpenExportModal && (
            <div className="relative group">
              <button
                onClick={onOpenExportModal}
                title={isCollapsed ? "Export Codebase" : undefined}
                className={`w-full flex items-center rounded-xl text-sm font-medium text-slate-400 hover:text-cyan-300 hover:bg-[#1E293B]/60 transition-all cursor-pointer border border-transparent ${
                  isCollapsed ? "justify-center p-2.5" : "gap-3 px-3.5 py-2.5"
                }`}
              >
                <FolderGit2 className="w-4 h-4 text-purple-400 shrink-0" />
                {!isCollapsed && <span>Export Codebase</span>}
              </button>

              {/* Floating tooltip when collapsed */}
              {isCollapsed && (
                <span className="pointer-events-none absolute left-full ml-3 px-2 py-1 rounded bg-[#1E293B] text-slate-200 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg border border-slate-700">
                  Export Codebase
                </span>
              )}
            </div>
          )}
        </nav>
      </div>

      {/* User Badge & Logout Section */}
      <div className="pt-3 border-t border-[#1E293B] space-y-2">
        {/* User Card */}
        <div className={`relative group flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-2 py-1.5"}`}>
          <div
            title={isCollapsed ? `${userName} (${userEmail})` : undefined}
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-xs font-semibold text-cyan-300 shrink-0 cursor-default"
          >
            {userInitials}
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white truncate">
                {userName}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {userEmail}
              </div>
            </div>
          )}

          {/* Floating tooltip for user when collapsed */}
          {isCollapsed && (
            <span className="pointer-events-none absolute left-full ml-3 px-2 py-1 rounded bg-[#1E293B] text-slate-200 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg border border-slate-700">
              {userName} ({userEmail})
            </span>
          )}
        </div>

        {/* Logout Button */}
        <div className="relative group">
          <button
            onClick={handleLogoutClick}
            title={isCollapsed ? "Logout" : undefined}
            className={`w-full flex items-center rounded-lg text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer ${
              isCollapsed ? "justify-center p-2" : "gap-2.5 px-3 py-2"
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>

          {/* Floating tooltip when collapsed */}
          {isCollapsed && (
            <span className="pointer-events-none absolute left-full ml-3 px-2 py-1 rounded bg-[#1E293B] text-rose-300 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg border border-slate-700">
              Logout
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
