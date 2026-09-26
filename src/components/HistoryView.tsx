import React from "react";
import { FolderGit2, Calendar, FileText, ArrowRight, Trash2, Sparkles } from "lucide-react";
import { ProjectRecord, loadSavedProjects } from "../services/sdlcEngine";

interface HistoryViewProps {
  onSelectProject: (project: ProjectRecord) => void;
  onNewProject: () => void;
}

export function HistoryView({ onSelectProject, onNewProject }: HistoryViewProps) {
  const [projects, setProjects] = React.useState<ProjectRecord[]>([]);

  React.useEffect(() => {
    setProjects(loadSavedProjects());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    localStorage.setItem("digitano_saved_projects", JSON.stringify(updated));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Project History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse and reopen previous SDLC projects and generated Vibe-Coder artifacts.
          </p>
        </div>

        <button
          onClick={onNewProject}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] hover:opacity-90 text-white font-medium text-xs transition-all shadow-md shadow-cyan-500/10 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Project</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl bg-[#131924] border border-[#1E293B] p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0B0F17] border border-[#1E293B] flex items-center justify-center text-slate-500 mx-auto">
            <FolderGit2 className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">No Projects Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Start by describing your project vision in the brief canvas. The 7-agent team will generate and save your specifications here.
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
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="p-5 rounded-2xl bg-[#131924] border border-[#1E293B] hover:border-cyan-500/50 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                    {project.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] text-[10px] font-mono border border-[#10B981]/30">
                    COMPLETED
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-1">
                  {project.prompt}
                </p>
                <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {new Date(project.createdAt).toLocaleDateString()} at{" "}
                    {new Date(project.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span>·</span>
                  <span>Single-Table DynamoDB Persisted</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={(e) => handleDelete(project.id, e)}
                  title="Delete from history"
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="p-2 rounded-lg bg-[#0B0F17] border border-[#1E293B] text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/40 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
