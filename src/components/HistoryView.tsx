import React, { useState, useEffect } from "react";
import {
  FolderGit2,
  Calendar,
  FileText,
  ArrowRight,
  Trash2,
  Sparkles,
  Database,
  UserCheck,
  RefreshCw,
  Cpu,
  Layers,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import {
  ProjectRecord,
  loadSavedProjects,
  fetchUserProjectsFromDynamoDB,
  deleteProjectFromStorage,
} from "../services/sdlcEngine";
import { getStoredEmail, isAuthenticated } from "../config/aws-cognito";

interface HistoryViewProps {
  onSelectProject: (project: ProjectRecord) => void;
  onNewProject: () => void;
}

export function HistoryView({ onSelectProject, onNewProject }: HistoryViewProps) {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [activeEmail, setActiveEmail] = useState<string>(() => getStoredEmail());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dynamoStatus, setDynamoStatus] = useState<{
    tableName: string;
    awsConfigured: boolean;
    partitionKey: string;
  } | null>(null);

  const loadData = async (email: string) => {
    setIsRefreshing(true);
    try {
      // 1. Load from DynamoDB (or local user partition)
      const rawList = await fetchUserProjectsFromDynamoDB(email);
      const seen = new Set<string>();
      const sanitized: ProjectRecord[] = [];

      (Array.isArray(rawList) ? rawList : []).forEach((p, idx) => {
        const id = p.id || p.SK?.replace("PROJECT#", "") || `proj_${idx}_${Date.now()}`;
        if (!seen.has(id)) {
          seen.add(id);
          sanitized.push({
            ...p,
            id,
            PK: p.PK || `USER#${email}`,
            SK: p.SK || `PROJECT#${id}`,
          });
        }
      });
      setProjects(sanitized);

      // 2. Fetch DynamoDB status
      const res = await fetch(`/api/dynamodb/status?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setDynamoStatus({
          tableName: data.tableName,
          awsConfigured: data.awsConfigured,
          partitionKey: data.partitionKey,
        });
      }
    } catch (err) {
      console.error("Failed to load user projects:", err);
      const fallbackList = loadSavedProjects(email);
      const seen = new Set<string>();
      const sanitized: ProjectRecord[] = [];

      (Array.isArray(fallbackList) ? fallbackList : []).forEach((p, idx) => {
        const id = p.id || p.SK?.replace("PROJECT#", "") || `proj_${idx}_${Date.now()}`;
        if (!seen.has(id)) {
          seen.add(id);
          sanitized.push({
            ...p,
            id,
            PK: p.PK || `USER#${email}`,
            SK: p.SK || `PROJECT#${id}`,
          });
        }
      });
      setProjects(sanitized);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const email = getStoredEmail();
    setActiveEmail(email);
    loadData(email);
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteProjectFromStorage(id, activeEmail);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const handleRefresh = () => {
    loadData(activeEmail);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Project History</span>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/40 text-xs font-mono text-cyan-300">
              {projects.length} Saved
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse and reopen previous SDLC projects and generated Vibe-Coder artifacts saved to your user account.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh history from DynamoDB"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#131924] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-medium text-slate-300 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={onNewProject}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] hover:opacity-90 text-white font-medium text-xs transition-all shadow-md shadow-cyan-500/10 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* COGNITO & DYNAMODB ACCOUNT LINKAGE BANNER */}
      <div className="p-4 rounded-2xl bg-[#131924] border border-[#1E293B] shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                  COGNITO AUTH &amp; DYNAMODB LINK
                </span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>Partition Active</span>
                </span>
              </div>
              <div className="text-xs font-medium text-slate-200 flex items-center gap-2 mt-0.5">
                <span className="text-slate-400">User Account:</span>
                <span className="font-semibold text-white">{activeEmail}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <div className="px-2.5 py-1 rounded-lg bg-[#0B0F17] border border-[#1E293B] text-slate-300">
              <span className="text-slate-500">PK: </span>
              <span className="text-cyan-300">USER#{activeEmail}</span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-[#0B0F17] border border-[#1E293B] text-slate-300">
              <span className="text-slate-500">Table: </span>
              <span className="text-emerald-400">{dynamoStatus?.tableName || "DigitanoProjects"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="rounded-2xl bg-[#131924] border border-[#1E293B] p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0B0F17] border border-[#1E293B] flex items-center justify-center text-slate-500 mx-auto">
            <FolderGit2 className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">No Projects Saved Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Start by describing your project vision in the brief canvas. The 7-agent team will generate your specifications and link them to your account: <strong className="text-cyan-300">{activeEmail}</strong>.
            </p>
          </div>
          <button
            onClick={onNewProject}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-white text-xs font-semibold cursor-pointer"
          >
            <span>Create First Project</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {projects.map((project, index) => {
            const hasArtifacts = Boolean(project.artifacts?.prd_document);
            const projectId = project.id || `proj_${index}`;
            const pkLabel = project.PK || `USER#${project.userEmail || activeEmail}`;
            const skLabel = project.SK || `PROJECT#${projectId}`;
            const uniqueCardKey = `hist_proj_${projectId}_${index}_${project.createdAt || ""}`;

            return (
              <div
                key={uniqueCardKey}
                onClick={() => onSelectProject(project)}
                className="p-5 rounded-2xl bg-[#131924] border border-[#1E293B] hover:border-cyan-500/50 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                      {project.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] text-[10px] font-mono border border-[#10B981]/30">
                      COMPLETED
                    </span>
                    {hasArtifacts && (
                      <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 text-[10px] font-mono border border-cyan-800/40">
                        4 Deliverables
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1">
                    {project.prompt}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono pt-0.5">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(project.createdAt).toLocaleDateString()} at{" "}
                      {new Date(project.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span>·</span>
                    <span className="text-slate-500">
                      SK: <span className="text-slate-300">{skLabel}</span>
                    </span>
                    <span>·</span>
                    <span className="text-emerald-400/90 flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      <span>DynamoDB Linked</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={(e) => handleDelete(projectId, e)}
                    title="Delete from user history"
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="p-2 rounded-lg bg-[#0B0F17] border border-[#1E293B] text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/40 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
