import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Shield,
  Briefcase,
  Building,
  Globe,
  Clock,
  CheckCircle2,
  Save,
  Lock,
  KeyRound,
  FileText,
  Sliders,
  Bell,
  Sparkles,
} from "lucide-react";
import { getStoredEmail } from "../config/aws-cognito";

interface UserProfileData {
  fullName: string;
  jobTitle: string;
  organization: string;
  timezone: string;
  defaultExportFormat: "docx" | "md" | "pdf";
  autoSaveToCloud: boolean;
  notifyOnCompletion: boolean;
}

const STORAGE_KEY = "digitano_user_profile";

export function SettingsView() {
  const email = getStoredEmail() || "ryno9rossouw@gmail.com";
  const userInitials = (email[0] || "R").toUpperCase() + (email[1] || "Y").toUpperCase();
  const defaultName = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const [profile, setProfile] = useState<UserProfileData>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.error("Failed to load user profile:", e);
      }
    }
    return {
      fullName: defaultName || "Ryno Rossouw",
      jobTitle: "Lead Solutions Architect & Project Owner",
      organization: "Digitano Enterprise",
      timezone: "UTC+02:00 (Johannesburg, Cairo)",
      defaultExportFormat: "docx",
      autoSaveToCloud: true,
      notifyOnCompletion: true,
    };
  });

  const [isSaved, setIsSaved] = useState(false);
  const [resetRequested, setResetRequested] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      } catch (err) {
        console.error("Failed to save profile:", err);
      }
    }
  };

  const handlePasswordReset = () => {
    setResetRequested(true);
    setTimeout(() => setResetRequested(false), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
          User Profile & Preferences
        </h1>
        <p className="text-sm text-slate-400">
          Manage your personal identity, organization details, and account preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="p-6 rounded-2xl bg-[#131924] border border-[#1E293B] shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#1E293B]">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#06B6D4] to-[#3B82F6] p-[2px] shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full bg-[#0B0F17] rounded-[14px] flex items-center justify-center">
                  <span className="font-hightech text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
                    {userInitials}
                  </span>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{profile.fullName || "User Profile"}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/40">
                    Active
                  </span>
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{email}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/30 px-3 py-1.5 rounded-xl">
              <Shield className="w-3.5 h-3.5" />
              <span>AWS Cognito Secured</span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-6">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-2 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-slate-200 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-2 uppercase tracking-wider">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0F17]/50 border border-[#1E293B] text-slate-400 text-sm cursor-not-allowed select-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-2 uppercase tracking-wider">
                Professional Role / Title
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={profile.jobTitle}
                  onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                  placeholder="e.g. Lead Solutions Architect"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-slate-200 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-2 uppercase tracking-wider">
                Organization / Team
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={profile.organization}
                  onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                  placeholder="e.g. Digitano Enterprise"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-slate-200 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-slate-300 mb-2 uppercase tracking-wider">
                Primary Timezone
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <select
                  value={profile.timezone}
                  onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-slate-200 text-sm focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
                >
                  <option value="UTC+02:00 (Johannesburg, Cairo)">UTC+02:00 (Johannesburg, Cairo)</option>
                  <option value="UTC+00:00 (London, Dublin, Lisbon)">UTC+00:00 (London, Dublin, Lisbon)</option>
                  <option value="UTC-05:00 (New York, Eastern Time)">UTC-05:00 (New York, Eastern Time)</option>
                  <option value="UTC-08:00 (Los Angeles, Pacific Time)">UTC-08:00 (Los Angeles, Pacific Time)</option>
                  <option value="UTC+01:00 (Berlin, Paris, Amsterdam)">UTC+01:00 (Berlin, Paris, Amsterdam)</option>
                  <option value="UTC+05:30 (New Delhi, Mumbai)">UTC+05:30 (New Delhi, Mumbai)</option>
                  <option value="UTC+08:00 (Singapore, Hong Kong)">UTC+08:00 (Singapore, Hong Kong)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Authentication Details */}
        <div className="p-6 rounded-2xl bg-[#131924] border border-[#1E293B] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Account Security & Session Guard</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Cognito Managed</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B]/70 flex items-start gap-3">
              <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-white">15-Minute Auto-Lock</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Sessions automatically lock after 15 minutes of inactivity to protect sensitive SDLC specifications.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1E293B]/70 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <KeyRound className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-white">Cognito Password Management</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Update your account credentials or request a security verification code.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handlePasswordReset}
                className="px-3 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#283548] text-slate-200 text-xs font-medium transition-colors cursor-pointer shrink-0"
              >
                Reset Password
              </button>
            </div>
          </div>

          {resetRequested && (
            <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Password reset instructions sent to {email}.</span>
            </div>
          )}
        </div>

        {/* Workflow & Export Preferences */}
        <div className="p-6 rounded-2xl bg-[#131924] border border-[#1E293B] shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1E293B]">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Application & Deliverable Preferences</h3>
          </div>

          <div className="space-y-4 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#0B0F17] border border-[#1E293B]/70">
              <div>
                <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Default Export Deliverable Format</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Preferred file format when exporting generated PRDs and architecture suites.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {(["docx", "md", "pdf"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setProfile({ ...profile, defaultExportFormat: fmt })}
                    className={`px-3 py-1 rounded-lg text-xs font-mono uppercase cursor-pointer transition-all ${
                      profile.defaultExportFormat === fmt
                        ? "bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20"
                        : "bg-[#1E293B] text-slate-300 hover:text-white"
                    }`}
                  >
                    .{fmt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B0F17] border border-[#1E293B]/70">
              <div>
                <h4 className="text-xs font-semibold text-white">Auto-Sync Deliverables</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Automatically save generated SDLC specifications to your account history.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.autoSaveToCloud}
                  onChange={(e) => setProfile({ ...profile, autoSaveToCloud: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#1E293B] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B0F17] border border-[#1E293B]/70">
              <div>
                <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Completion Notifications</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Play subtle chime and visual alert when an 8-agent generation pipeline finishes.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.notifyOnCompletion}
                  onChange={(e) => setProfile({ ...profile, notifyOnCompletion: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#1E293B] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="flex items-center justify-between pt-2">
          {isSaved ? (
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-3.5 py-2 rounded-xl animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Profile preferences saved successfully!</span>
            </div>
          ) : (
            <div className="text-xs text-slate-500 font-mono">
              Changes apply across your workspace sessions.
            </div>
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] hover:opacity-95 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
