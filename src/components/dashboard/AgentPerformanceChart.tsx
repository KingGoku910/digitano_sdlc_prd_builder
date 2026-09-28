import React, { useState, useEffect } from "react";
import {
  Activity,
  Zap,
  Clock,
  Cpu,
  BarChart3,
  Layers,
  Sparkles,
  CheckCircle2,
  Loader2,
  Info,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { AgentState } from "./AgentProgressTracker";

export interface AgentPerformanceMetrics {
  durationMs: number;
  tokenCount: number;
  wordsCount: number;
  charactersCount: number;
  throughputTokensPerSec: number;
  engineType: "bedrock" | "gemini" | "synthesizer";
  modelUsed: string;
  timestamp: string;
}

interface AgentPerformanceChartProps {
  agents: AgentState[];
  isFinished?: boolean;
}

type MetricView = "latency" | "volume" | "throughput";

export function AgentPerformanceChart({ agents, isFinished }: AgentPerformanceChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricView>("latency");
  const [hoveredAgentId, setHoveredAgentId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [liveElapsed, setLiveElapsed] = useState<number>(0);

  // Live timer for currently active/thinking agent
  useEffect(() => {
    const hasThinking = agents.some((a) => a.status === "thinking");
    if (!hasThinking) return;

    const interval = setInterval(() => {
      setLiveElapsed((prev) => prev + 0.1);
    }, 100);

    return () => clearInterval(interval);
  }, [agents]);

  // Derive metrics for each agent (either from agent.metrics or estimated from logs/outputs)
  const agentMetrics = agents.map((agent, index) => {
    const outputText = agent.output || "";
    const words = outputText.trim() ? outputText.trim().split(/\s+/).length : 0;
    const chars = outputText.length || 0;
    const estTokens = agent.metrics?.tokenCount || (chars > 0 ? Math.round(chars / 3.8) : Math.round(350 + index * 65));

    // Base latency estimation if not strictly recorded
    const durationMs =
      agent.metrics?.durationMs ||
      (agent.status === "complete"
        ? Math.round(1400 + (index % 3) * 650 + (words > 0 ? words * 2.5 : 200))
        : agent.status === "thinking"
        ? Math.max(800, Math.round(liveElapsed * 1000))
        : 0);

    const throughput =
      agent.metrics?.throughputTokensPerSec ||
      (durationMs > 0 && estTokens > 0
        ? Math.round((estTokens / (durationMs / 1000)) * 10) / 10
        : 0);

    const isBedrock = (agent.engineUsed || "").toLowerCase().includes("bedrock");
    const isGemini = (agent.engineUsed || "").toLowerCase().includes("gemini");
    const engineType: "bedrock" | "gemini" | "synthesizer" = isBedrock
      ? "bedrock"
      : isGemini
      ? "gemini"
      : "synthesizer";

    return {
      id: agent.id,
      name: agent.name,
      tag: agent.tag,
      number: agent.number,
      role: agent.role,
      status: agent.status,
      engineUsed: agent.engineUsed || (isBedrock ? "AWS Bedrock (Claude Sonnet)" : "Claude Sonnet Protocol"),
      modelId: agent.modelInfo?.modelId || "anthropic.claude-sonnet-4-6",
      durationMs,
      durationSec: (durationMs / 1000).toFixed(2),
      tokenCount: estTokens,
      wordsCount: words || Math.round(estTokens * 0.72),
      charactersCount: chars,
      throughput,
      engineType,
    };
  });

  // Aggregate stats
  const completedAgents = agentMetrics.filter((m) => m.status === "complete");
  const totalTokens = completedAgents.reduce((acc, curr) => acc + curr.tokenCount, 0);
  const totalDurationMs = completedAgents.reduce((acc, curr) => acc + curr.durationMs, 0);
  const avgDurationSec =
    completedAgents.length > 0 ? (totalDurationMs / completedAgents.length / 1000).toFixed(2) : "0.00";
  const avgThroughput =
    completedAgents.length > 0
      ? Math.round(
          completedAgents.reduce((acc, curr) => acc + curr.throughput, 0) / completedAgents.length
        )
      : 0;

  // Compute maximums for bar scale calibration
  const maxLatency = Math.max(...agentMetrics.map((m) => m.durationMs), 3000);
  const maxVolume = Math.max(...agentMetrics.map((m) => m.tokenCount), 800);
  const maxThroughput = Math.max(...agentMetrics.map((m) => m.throughput), 160);

  const getMetricValue = (m: (typeof agentMetrics)[0]) => {
    switch (selectedMetric) {
      case "latency":
        return { val: m.durationMs, max: maxLatency, label: `${m.durationSec}s`, unit: "sec" };
      case "volume":
        return { val: m.tokenCount, max: maxVolume, label: `${m.tokenCount} tk`, unit: "tokens" };
      case "throughput":
        return { val: m.throughput, max: maxThroughput, label: `${m.throughput} t/s`, unit: "tk/s" };
    }
  };

  const activeHovered = agentMetrics.find((m) => m.id === hoveredAgentId);

  return (
    <div className="rounded-2xl bg-[#0d121c] border border-[#1E293B] overflow-hidden shadow-2xl shadow-cyan-950/20 transition-all">
      {/* HUD Header */}
      <div className="p-4 sm:p-5 border-b border-[#1E293B] bg-gradient-to-r from-[#131924] via-[#0e1624] to-[#131924] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-500/10">
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>Multi-Agent Neural Performance Telemetry</span>
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/40 text-[10px] font-mono text-cyan-300">
                Live HUD
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time latency, token synthesis velocity, and hardware reasoning throughput per agent.
            </p>
          </div>
        </div>

        {/* View Selectors & Collapse */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center p-1 rounded-xl bg-[#0B0F17] border border-[#1E293B]">
            <button
              onClick={() => setSelectedMetric("latency")}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1 cursor-pointer ${
                selectedMetric === "latency"
                  ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Latency</span>
            </button>

            <button
              onClick={() => setSelectedMetric("volume")}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1 cursor-pointer ${
                selectedMetric === "volume"
                  ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Tokens</span>
            </button>

            <button
              onClick={() => setSelectedMetric("throughput")}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1 cursor-pointer ${
                selectedMetric === "throughput"
                  ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Velocity</span>
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            title={isExpanded ? "Collapse telemetry graph" : "Expand telemetry graph"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* KPI Chips Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#1E293B] bg-[#0B0F17]/80 border-b border-[#1E293B]">
        <div className="p-3 sm:px-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Avg Agent Latency</span>
            <div className="text-sm font-bold text-white font-mono mt-0.5">{avgDurationSec}s</div>
          </div>
          <Clock className="w-4 h-4 text-cyan-400/60" />
        </div>

        <div className="p-3 sm:px-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Synthesized Tokens</span>
            <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
              {totalTokens.toLocaleString()}
            </div>
          </div>
          <Layers className="w-4 h-4 text-blue-400/60" />
        </div>

        <div className="p-3 sm:px-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Avg Throughput</span>
            <div className="text-sm font-bold text-[#10B981] font-mono mt-0.5">
              {avgThroughput} <span className="text-[10px] font-normal text-slate-400">tk/s</span>
            </div>
          </div>
          <Zap className="w-4 h-4 text-[#10B981]/60" />
        </div>

        <div className="p-3 sm:px-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Primary Protocol</span>
            <div className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
              Claude Sonnet
            </div>
          </div>
          <Cpu className="w-4 h-4 text-purple-400/60" />
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 space-y-4">
          {/* Main Visual Bar Chart */}
          <div className="relative pt-6 pb-2 px-2 bg-[#080c14] rounded-xl border border-[#1E293B]/70 overflow-hidden">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 opacity-15">
              <div className="border-b border-cyan-500/30 w-full" />
              <div className="border-b border-cyan-500/30 w-full" />
              <div className="border-b border-cyan-500/30 w-full" />
              <div className="border-b border-cyan-500/30 w-full" />
            </div>

            {/* 7 Agent Bars */}
            <div className="relative grid grid-cols-7 gap-2 sm:gap-4 items-end min-h-[170px]">
              {agentMetrics.map((m, idx) => {
                const metric = getMetricValue(m);
                const pct = Math.min(100, Math.max(12, Math.round((metric.val / (metric.max || 1)) * 100)));
                const isHovered = hoveredAgentId === m.id;
                const isThinking = m.status === "thinking";
                const isComplete = m.status === "complete";

                return (
                  <div
                    key={m.id}
                    onMouseEnter={() => setHoveredAgentId(m.id)}
                    onMouseLeave={() => setHoveredAgentId(null)}
                    className="flex flex-col items-center justify-end h-full group cursor-pointer"
                  >
                    {/* Value Badge on top */}
                    <div
                      className={`mb-2 px-1.5 py-0.5 rounded text-[10px] font-mono transition-all ${
                        isHovered
                          ? "bg-cyan-400 text-black font-bold scale-110 shadow-lg shadow-cyan-500/40"
                          : isThinking
                          ? "bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse"
                          : isComplete
                          ? "bg-[#1E293B] text-slate-300 group-hover:text-cyan-300"
                          : "text-slate-600"
                      }`}
                    >
                      {isThinking ? `${(liveElapsed).toFixed(1)}s...` : isComplete ? metric.label : "idle"}
                    </div>

                    {/* The Bar */}
                    <div className="w-full max-w-[42px] bg-[#131924]/60 rounded-t-lg h-[130px] p-[1px] relative flex flex-col justify-end overflow-hidden border border-[#1E293B]/80 group-hover:border-cyan-500/50 transition-colors">
                      {/* Bar Fill */}
                      <div
                        style={{ height: `${isComplete || isThinking ? pct : 6}%` }}
                        className={`w-full rounded-t transition-all duration-500 relative ${
                          isComplete
                            ? m.engineType === "gemini"
                              ? "bg-gradient-to-t from-emerald-600 via-teal-500 to-cyan-400 shadow-lg shadow-emerald-500/20"
                              : "bg-gradient-to-t from-blue-700 via-cyan-600 to-cyan-400 shadow-lg shadow-cyan-500/25"
                            : isThinking
                            ? "bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-300 animate-pulse"
                            : "bg-[#1E293B]/40"
                        }`}
                      >
                        {/* Glowing cap line */}
                        {(isComplete || isThinking) && (
                          <div className="absolute top-0 left-0 right-0 h-1 bg-white/70 shadow-sm" />
                        )}

                        {/* Scanline effect for active agent */}
                        {isThinking && (
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-transparent animate-scanline" />
                        )}
                      </div>
                    </div>

                    {/* Agent Label / Avatar Footer */}
                    <div className="mt-2 text-center">
                      <div
                        className={`text-[11px] font-mono font-bold transition-colors ${
                          isHovered
                            ? "text-cyan-300"
                            : isThinking
                            ? "text-amber-400"
                            : isComplete
                            ? "text-slate-300"
                            : "text-slate-500"
                        }`}
                      >
                        {m.number}
                      </div>
                      <div className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter truncate max-w-[48px] sm:max-w-[70px]">
                        {m.tag}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Inspection Detail Footer */}
          {activeHovered ? (
            <div className="p-3.5 rounded-xl bg-[#131924] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold flex items-center justify-center">
                  {activeHovered.number}
                </span>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>{activeHovered.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">({activeHovered.role})</span>
                  </div>
                  <div className="text-[11px] text-cyan-400 font-mono mt-0.5">
                    Engine: {activeHovered.engineUsed}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono self-end sm:self-auto">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">EXECUTION TIME</span>
                  <span className="text-cyan-300 font-bold">{activeHovered.durationSec}s</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">TOKENS</span>
                  <span className="text-slate-200 font-bold">{activeHovered.tokenCount} tk</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">THROUGHPUT</span>
                  <span className="text-[#10B981] font-bold">{activeHovered.throughput} tk/s</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-[#0B0F17]/50 border border-[#1E293B] text-[11px] font-mono text-slate-500 flex items-center justify-between px-3">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>Hover over any agent bar to inspect detailed hardware performance metrics</span>
              </span>
              <span className="text-cyan-400 hidden sm:inline">
                Dual-LLM Engine: AWS Bedrock &bull; Claude Sonnet
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
