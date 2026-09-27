import React, { useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Clock,
  Sparkles,
  Cpu,
  Workflow,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileCode,
  Copy,
  Check,
  Zap,
} from "lucide-react";
import { CuteRobotAvatar } from "./CuteRobotAvatar";

export interface AgentTaskHandoff {
  inputReceived: string;
  actionPerformed: string;
  deliverablesProduced: string;
}

export interface AgentModelInfo {
  modelName: string;
  modelId: string;
  provider: string;
  description?: string;
}

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
  modelInfo?: AgentModelInfo;
  taskHandoff?: AgentTaskHandoff;
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
  const [expandedOutputs, setExpandedOutputs] = useState<Record<string, boolean>>({});
  const [copiedModelId, setCopiedModelId] = useState<string | null>(null);

  const toggleOutput = (agentId: string) => {
    setExpandedOutputs((prev) => ({
      ...prev,
      [agentId]: !prev[agentId],
    }));
  };

  const handleCopyModelId = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedModelId(id);
    setTimeout(() => setCopiedModelId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#131924] border border-[#1E293B]">
        <div className="flex items-center gap-3">
          {isFinished ? (
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] shadow-lg shadow-emerald-500/10">
              <Sparkles className="w-5 h-5 text-[#10B981]" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
              <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            </div>
          )}

          <div>
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              <span>
                {isFinished
                  ? "All 7 Agents Completed Successfully"
                  : `Autonomous Scrum Team Working... (${completedCount}/${totalAgents} Agents Ready)`}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/40 text-[10px] font-mono text-cyan-300">
                Dual-LLM Engine Active
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {isFinished
                ? "Bespoke PRD, DynamoDB Schemas, REST API Contracts, and Vibe-Coder Prompts synthesized."
                : "Orchestrating sequential domain reasoning with automated Bedrock Claude 3.5 Sonnet / Gemini failover."}
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
      <div className="space-y-4">
        {agents.map((agent) => {
          const isCurrent = agent.status === "thinking";
          const isComplete = agent.status === "complete";
          const isPending = agent.status === "pending";
          const isOutputExpanded = Boolean(expandedOutputs[agent.id]);

          // Fallback model details if not yet injected
          const modelName = agent.modelInfo?.modelName || (agent.engineUsed?.includes("Gemini") ? "Google Gemini 2.5 Flash" : "Anthropic Claude 3.5 Sonnet");
          const modelId = agent.modelInfo?.modelId || (agent.engineUsed?.includes("Gemini") ? "gemini-2.5-flash" : "anthropic.claude-3-5-sonnet-20240620-v1:0");
          const provider = agent.modelInfo?.provider || (agent.engineUsed?.includes("Gemini") ? "Google GenAI API" : "AWS Bedrock Runtime (us-east-1)");

          return (
            <div
              key={agent.id}
              className={`p-5 rounded-2xl border transition-all duration-300 ${
                isCurrent
                  ? "bg-[#131924] border-cyan-500/60 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/30"
                  : isComplete
                  ? "bg-[#131924]/85 border-[#1E293B] hover:border-slate-700 shadow-md"
                  : "bg-[#0F141F]/40 border-[#1E293B]/50 opacity-75"
              }`}
            >
              {/* Agent Card Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <CuteRobotAvatar
                    agentId={agent.id}
                    size={46}
                    isThinking={isCurrent}
                  />

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-800 text-cyan-400 font-semibold border border-slate-700/60">
                        {agent.tag}
                      </span>
                      <h4 className="text-sm font-bold text-white tracking-tight">
                        {agent.name}
                      </h4>
                      <span className="text-xs text-slate-500 font-mono">
                        ({agent.number})
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-medium mt-0.5">
                      {agent.role}
                    </div>
                  </div>
                </div>

                {/* Status Indicator Badge */}
                <div className="flex items-center gap-2">
                  {isComplete && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-xs font-semibold text-[#10B981]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete</span>
                    </span>
                  )}
                  {isCurrent && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-xs font-semibold text-cyan-400 animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Executing...</span>
                    </span>
                  )}
                  {isPending && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700 text-xs font-medium text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>In Queue</span>
                    </span>
                  )}
                </div>
              </div>

              {/* 1. EXACT AI MODEL USED SECTION */}
              <div className="mt-4 pt-3.5 border-t border-[#1E293B]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-[#0B0F17]/90 border border-cyan-950/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                        <span>AI MODEL USED</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400 lowercase text-[10px]">
                          {isComplete ? "reasoned by" : "assigned model"}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white flex items-center gap-2 mt-0.5">
                        <span className="text-cyan-200">{modelName}</span>
                        <span className="text-slate-500 text-[11px] font-normal font-sans">
                          via {provider}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Model ID Badge with 1-click Copy */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#131924] border border-[#1E293B] text-[11px] font-mono text-slate-300">
                      <span className="text-slate-500 select-none">id:</span>
                      <span className="text-cyan-300 font-medium truncate max-w-[200px] sm:max-w-none">
                        {modelId}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyModelId(modelId, agent.id)}
                      title="Copy Model Identifier"
                      className="p-1.5 rounded-lg bg-[#131924] hover:bg-[#1E293B] border border-[#1E293B] text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedModelId === agent.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. TASK HANDOFF & ACTION TAKEN SECTION */}
              {agent.taskHandoff && (
                <div className="mt-3.5 space-y-2">
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-0.5">
                    <Workflow className="w-3.5 h-3.5 text-cyan-400" />
                    <span>TASK EXECUTION &amp; HANDOFF SPECIFICATION</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {/* Step A: Input Context Received */}
                    <div className="p-3 rounded-xl bg-[#0B0F17]/60 border border-[#1E293B] flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] font-mono text-amber-400 font-semibold mb-1 flex items-center gap-1">
                          <span>📥 INPUT RECEIVED</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {agent.taskHandoff.inputReceived}
                        </p>
                      </div>
                      <div className="mt-2 text-[10px] text-slate-500 font-mono">
                        Stage: Ingestion
                      </div>
                    </div>

                    {/* Step B: What This Agent Did */}
                    <div className="p-3 rounded-xl bg-[#06B6D4]/5 border border-cyan-500/20 flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] font-mono text-cyan-300 font-semibold mb-1 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-cyan-400" />
                          <span>⚡ WHAT THIS AGENT DID</span>
                        </div>
                        <p className="text-[11px] text-slate-200 leading-relaxed font-medium">
                          {agent.taskHandoff.actionPerformed}
                        </p>
                      </div>
                      <div className="mt-2 text-[10px] text-cyan-400/80 font-mono">
                        Stage: Reasoning
                      </div>
                    </div>

                    {/* Step C: Deliverables Produced */}
                    <div className="p-3 rounded-xl bg-[#10B981]/5 border border-[#10B981]/20 flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] font-mono text-emerald-400 font-semibold mb-1 flex items-center gap-1">
                          <span>📤 DELIVERABLES PASSED</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {agent.taskHandoff.deliverablesProduced}
                        </p>
                      </div>
                      <div className="mt-2 text-[10px] text-emerald-400/80 font-mono flex items-center gap-1">
                        <span>Handoff: Ready</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. GENERATED OUTPUT PREVIEW (EXPANDABLE) */}
              {agent.output && (
                <div className="mt-3.5 pt-2.5 border-t border-[#1E293B]/70">
                  <button
                    onClick={() => toggleOutput(agent.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#0B0F17] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-medium text-slate-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                      <span>
                        {isOutputExpanded ? "Hide Technical Output Preview" : "View Generated Output Preview"}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        ({agent.output.length} characters)
                      </span>
                    </div>
                    {isOutputExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {isOutputExpanded && (
                    <div className="mt-2 p-4 rounded-xl bg-[#0B0F17] border border-cyan-500/20 max-h-72 overflow-y-auto">
                      <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {agent.output}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* 4. EXECUTION TIMELINE LOGS */}
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
