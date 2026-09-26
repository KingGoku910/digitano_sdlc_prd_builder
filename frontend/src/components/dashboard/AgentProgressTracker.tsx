"use client";

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
            <div className="text-xs text-slate-400">
              {isFinished
                ? "PRD, database schema, API contracts, and Vibe-Coder prompts are ready."
                : "Orchestrating multi-agent SDLC pipeline with real-time reasoning."}
            </div>
          </div>
        </div>

        {onReset && isFinished && (
          <button
            onClick={onReset}
            className="self-start sm:self-auto px-4 py-2 text-xs font-medium rounded-xl bg-[#1E293B] hover:bg-[#334155] text-white border border-[#334155] transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Start New Project</span>
          </button>
        )}
      </div>

      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Autonomous Team Execution
        </h2>
        <span className="text-xs font-mono font-medium text-slate-400">
          {completedCount}/{totalAgents} agents complete
        </span>
      </div>

      {/* 7-Agent Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const isComplete = agent.status === "complete";
          const isThinking = agent.status === "thinking";
          const isPending = agent.status === "pending";

          return (
            <div
              key={agent.id}
              className={`rounded-2xl p-4 transition-all duration-300 border flex flex-col justify-between ${
                isComplete
                  ? "bg-[#131924] border-[#1E293B]"
                  : isThinking
                  ? "bg-[#131924] border-cyan-500/50 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30"
                  : "bg-[#0E131D]/80 border-[#1E293B]/60 opacity-60"
              }`}
            >
              {/* Card Header with Cute Humanoid Robot Stock Avatar */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <CuteRobotAvatar
                    agentId={agent.id}
                    size={46}
                    isThinking={isThinking}
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-white leading-tight">
                      {agent.name}
                    </h3>
                    <div className="text-[11px] font-mono text-cyan-400/90 font-medium">
                      {agent.number}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  {isComplete && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10B981]/15 text-[#10B981] text-[11px] font-medium border border-[#10B981]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                      Complete
                    </span>
                  )}
                  {isThinking && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F59E0B]/15 text-[#F59E0B] text-[11px] font-medium border border-[#F59E0B]/30 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin text-[#F59E0B]" />
                      Thinking
                    </span>
                  )}
                  {isPending && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/60 text-slate-400 text-[11px] font-medium border border-slate-700/50">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Terminal Logs Window */}
              <div className="w-full bg-[#0B0F17] rounded-xl p-3 border border-[#1E293B] font-mono text-[11px] text-slate-300 min-h-[92px] max-h-[120px] overflow-y-auto space-y-1">
                {agent.logs && agent.logs.length > 0 ? (
                  agent.logs.map((logLine, lineIdx) => (
                    <div key={lineIdx} className="leading-snug text-slate-300 truncate">
                      <span className="text-cyan-500/80 mr-1.5 select-none">&gt;</span>
                      <span>{logLine}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 italic">Waiting for upstream handoff...</div>
                )}
              </div>

              {/* Footer Role & Explicit AI Model Accessed and Used for this iteration */}
              <div className="mt-3 pt-2 border-t border-[#1E293B]/60 flex items-center justify-between text-[11px]">
                <span className="truncate max-w-[150px] text-slate-400 text-[10px]">
                  {agent.role}
                </span>

                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#0B0F17] border border-[#1E293B] text-[10px] font-mono text-cyan-300 shrink-0">
                  <Cpu className="w-3 h-3 text-cyan-400" />
                  <span>{agent.engineUsed || "AWS Bedrock (Claude 3.5 Sonnet)"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
