import React from "react";
import {
  CheckCircle2,
  Loader2,
  Clock,
  Sparkles,
  Cpu,
} from "lucide-react";
import { CuteRobotAvatar } from "./CuteRobotAvatar";

export interface AgentState {
  id: string;
  name: string;
  tag: string;
  number: string;
  role: string;
  status: "pending" | "thinking" | "complete";
  logs: string[];
  output?: string;
  engineUsed?: string;
}

interface AgentProgressTrackerProps {
  agents: AgentState[];
  completedCount: number;
  totalAgents?: number;
  isFinished?: boolean;
  onReset?: () => void;
}

export function AgentProgressTracker({
  agents,
  completedCount,
  totalAgents = 7,
  isFinished = false,
  onReset,
}: AgentProgressTrackerProps) {
  return (
    <div className="space-y-6">
      {/* Top Banner Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#131924] border border-[#1E293B]">
        <div className="flex items-center gap-3">
          {isFinished ? (
            <div className="w-9 h-9 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
              <Sparkles className="w-5 h-5 text-[#10B981]" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            </div>
          )}

          <div>
            <div className="text-sm font-semibold text-white">
              {isFinished
                ? "All 7 agents completed successfully"
                : `Autonomous team is working... ${completedCount}/${totalAgents} agents complete`}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {isFinished
                ? "Full SDLC specification compiled and ready for vibe-coding."
                : "Orchestrating multi-agent context handoff in sequential stages."}
            </div>
          </div>
        </div>

        {onReset && (
          <button
            onClick={onReset}
            className="px-3.5 py-1.5 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-xs font-medium text-slate-200 transition-colors self-start sm:self-auto cursor-pointer"
          >
            {isFinished ? "Start New Project" : "Cancel"}
          </button>
        )}
      </div>

      {/* Agents Timeline List */}
      <div className="space-y-3">
        {agents.map((agent, index) => {
          const isCurrent = agent.status === "thinking";
          const isComplete = agent.status === "complete";
          const isPending = agent.status === "pending";

          return (
            <div
              key={agent.id}
              className={`p-4 rounded-2xl border transition-all ${
                isCurrent
                  ? "bg-[#131924] border-cyan-500/50 shadow-lg shadow-cyan-500/5"
                  : isComplete
                  ? "bg-[#131924]/70 border-[#1E293B] hover:border-slate-700"
                  : "bg-[#0F141F]/40 border-[#1E293B]/50 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  {/* Robot Avatar */}
                  <CuteRobotAvatar
                    agentId={agent.id}
                    size={42}
                    isThinking={isCurrent}
                  />

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-800 text-cyan-400 font-semibold border border-slate-700/60">
                        {agent.tag}
                      </span>
                      <h4 className="text-sm font-semibold text-white">
                        {agent.name}
                      </h4>
                      <span className="text-xs text-slate-500 font-mono">
                        ({agent.number})
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {agent.role}
                    </div>
                  </div>
                </div>

                {/* Status Indicator Badge */}
                <div className="flex items-center gap-2">
                  {agent.engineUsed && (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-[10px] font-mono text-slate-300">
                      <Cpu className="w-3 h-3 text-cyan-400" />
                      {agent.engineUsed}
                    </span>
                  )}

                  {isComplete && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-xs font-medium text-[#10B981]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete</span>
                    </span>
                  )}
                  {isCurrent && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-medium text-cyan-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Thinking...</span>
                    </span>
                  )}
                  {isPending && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700 text-xs font-medium text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pending</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Streaming Logs */}
              {(isCurrent || isComplete) && agent.logs.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#1E293B]/60 font-mono text-[11px] space-y-1">
                  {agent.logs.map((log, i) => (
                    <div
                      key={i}
                      className={
                        i === agent.logs.length - 1 && isCurrent
                          ? "text-cyan-400 flex items-center gap-2"
                          : "text-slate-400"
                      }
                    >
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
