/**
 * Digitano Builder - Main Interactive Application
 * Autonomous Multi-Agent SDLC Engine (8-Agent Directed Cluster)
 */

import React, { useState, useEffect } from "react";
import { NeuralBackground } from "./components/NeuralBackground";
import { AuthCard } from "./components/auth/AuthCard";
import { Sidebar } from "./components/navigation/Sidebar";
import { TopNavbar } from "./components/navigation/TopNavbar";
import { ProjectBriefInput } from "./components/dashboard/ProjectBriefInput";
import { AgentProgressTracker, AgentState } from "./components/dashboard/AgentProgressTracker";
import { ArtifactViewer, ArtifactData } from "./components/dashboard/ArtifactViewer";
import { HistoryView } from "./components/HistoryView";
import { SettingsView } from "./components/SettingsView";
import { ExportModal } from "./components/ExportModal";
import {
  isAuthenticated,
  logoutUser,
  recordUserActivity,
  isSessionExpiredDueToInactivity,
} from "./config/aws-cognito";
import { runAgentPipeline, ProjectRecord, AGENT_SPECS } from "./services/sdlcEngine";
import { ProjectSpecificationInputs } from "./types/projectSpec";
import {
  ArrowRight,
  Zap,
  Users,
  Code,
  Sparkles,
  FolderGit2,
  ShieldCheck,
  Terminal,
  Cpu,
  Database,
  Eye,
  BarChart3,
  Workflow,
  FileText,
  CheckCircle2,
  Clock,
  Layers,
  Lock,
  Play,
  Compass,
  Check,
  HelpCircle,
} from "lucide-react";

const INITIAL_AGENTS: AgentState[] = [
  {
    id: "researcher_agent",
    name: "Technical Researcher",
    tag: "RES",
    number: "ADK 0",
    role: "Ground Truth & Market Intelligence (MCP GoogleSearchTool)",
    status: "pending",
    logs: [],
    taskHandoff: AGENT_SPECS.researcher_agent.handoff,
    modelInfo: AGENT_SPECS.researcher_agent.defaultModel,
  },
  {
    id: "agent_1_vision",
    name: "Vision & Scope Lead",
    tag: "VIS",
    number: "ADK 1",
    role: "Product Vision, Personas & Explicit Non-Goals",
    status: "pending",
    logs: [],
    taskHandoff: AGENT_SPECS.agent_1_vision.handoff,
    modelInfo: AGENT_SPECS.agent_1_vision.defaultModel,
  },
  {
    id: "agent_2_requirements",
    name: "Requirements Engineer",
    tag: "REQ",
    number: "ADK 2",
    role: "100% Gherkin Given-When-Then Epics & Quantitative SLAs",
    status: "pending",
    logs: [],
    taskHandoff: AGENT_SPECS.agent_2_requirements.handoff,
    modelInfo: AGENT_SPECS.agent_2_requirements.defaultModel,
  },
  {
    id: "agent_3_architecture",
    name: "Systems Architect",
    tag: "ARC",
    number: "ADK 3",
    role: "PostgreSQL DDL Schemas & RESTful OpenAPI Contracts",
    status: "pending",
    logs: [],
    taskHandoff: AGENT_SPECS.agent_3_architecture.handoff,
    modelInfo: AGENT_SPECS.agent_3_architecture.defaultModel,
  },
  {
    id: "agent_4_uiux",
    name: "Lead UX/UI Designer",
    tag: "UIX",
    number: "ADK 4",
    role: "Cybernetic Layouts & 4-State Interaction Matrices",
    status: "pending",
    logs: [],
    taskHandoff: AGENT_SPECS.agent_4_uiux.handoff,
    modelInfo: AGENT_SPECS.agent_4_uiux.defaultModel,
  },
  {
    id: "agent_5_risks",
    name: "Risk & Compliance Officer",
    tag: "RSK",
    number: "ADK 5",
    role: "Zero-Trust Security, AES-256-GCM, GDPR/HIPAA Boundaries",
    status: "pending",
    logs: [],
    taskHandoff: AGENT_SPECS.agent_5_risks.handoff,
    modelInfo: AGENT_SPECS.agent_5_risks.defaultModel,
  },
  {
    id: "agent_6_metrics",
    name: "Telemetry Strategist",
    tag: "MTR",
    number: "ADK 6",
    role: "Hard Numerical KPIs & Phased Release Milestones",
    status: "pending",
    logs: [],
    taskHandoff: AGENT_SPECS.agent_6_metrics.handoff,
    modelInfo: AGENT_SPECS.agent_6_metrics.defaultModel,
  },
  {
    id: "orchestrator_agent",
    name: "Master Orchestrator",
    tag: "ORC",
    number: "ADK 7",
    role: "Quality Gatekeeper & Master PRD Synthesis",
    status: "pending",
    logs: [],
    taskHandoff: AGENT_SPECS.orchestrator_agent.handoff,
    modelInfo: AGENT_SPECS.orchestrator_agent.defaultModel,
  },
];

export default function App() {
  const [currentView, setCurrentView] = useState<"landing" | "login" | "dashboard">("landing");
  const [dashboardTab, setDashboardTab] = useState<"new_project" | "history" | "settings">("new_project");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("digitano_sidebar_minimized") === "true";
    }
    return false;
  });

  // Execution state
  const [agents, setAgents] = useState<AgentState[]>(INITIAL_AGENTS);
  const [completedCount, setCompletedCount] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [artifacts, setArtifacts] = useState<ArtifactData | null>(null);
  const [currentProjectTitle, setCurrentProjectTitle] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [currentSpecInputs, setCurrentSpecInputs] = useState<ProjectSpecificationInputs | null>(null);

  // Sync auth state on mount
  useEffect(() => {
    if (isAuthenticated()) {
      if (isSessionExpiredDueToInactivity()) {
        logoutUser();
        setSessionExpiredNotice("Your previous session expired due to 15 minutes of inactivity. Please sign in again.");
        setCurrentView("login");
      } else {
        recordUserActivity();
        setCurrentView("dashboard");
      }
    }
  }, []);

  // Strict 15-Minute Inactivity Session Control
  useEffect(() => {
    const handleUserInteraction = () => {
      if (isAuthenticated()) {
        recordUserActivity();
      }
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    let lastRecorded = Date.now();
    const throttledHandler = () => {
      const now = Date.now();
      if (now - lastRecorded > 4000) {
        lastRecorded = now;
        handleUserInteraction();
      }
    };

    events.forEach((evt) => window.addEventListener(evt, throttledHandler, { passive: true }));

    // Periodic check every 10 seconds for 15-minute inactivity timeout
    const intervalId = setInterval(() => {
      if (isAuthenticated() && isSessionExpiredDueToInactivity()) {
        console.warn("[Session Guard] 15 minutes of inactivity detected. Automatically logging out.");
        logoutUser();
        setSessionExpiredNotice("Your session was logged out after 15 minutes of inactivity. Please sign in again to continue.");
        setCurrentView("login");
      }
    }, 10000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, throttledHandler));
      clearInterval(intervalId);
    };
  }, []);

  const handleStartProject = async (
    prompt: string,
    title: string,
    specInputs?: ProjectSpecificationInputs
  ) => {
    const projectId = "proj_" + Math.random().toString(36).substring(2, 9);
    setCurrentProjectTitle(title);
    setCurrentPrompt(prompt);
    setCurrentSpecInputs(specInputs || null);
    setIsExecuting(true);
    setIsFinished(false);
    setArtifacts(null);
    setCompletedCount(0);
    setAgents(INITIAL_AGENTS.map((a) => ({ ...a, status: "pending", logs: [] })));

    try {
      const generatedArtifacts = await runAgentPipeline(
        projectId,
        title,
        prompt,
        (updatedAgent, count) => {
          setAgents((prev) =>
            prev.map((a) => (a.id === updatedAgent.id ? updatedAgent : a))
          );
          setCompletedCount(count);
        },
        specInputs
      );

      setArtifacts(generatedArtifacts);
      setIsFinished(true);
    } catch (err) {
      console.error("Pipeline execution error:", err);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleReset = () => {
    setIsExecuting(false);
    setIsFinished(false);
    setArtifacts(null);
    setCompletedCount(0);
    setCurrentSpecInputs(null);
    setAgents(INITIAL_AGENTS.map((a) => ({ ...a, status: "pending", logs: [] })));
  };

  const handleSelectHistoryProject = (project: ProjectRecord) => {
    setCurrentProjectTitle(project.title);
    setCurrentPrompt(project.prompt);
    setCurrentSpecInputs(project.specInputs || null);
    setArtifacts(project.artifacts);
    setIsFinished(true);
    setIsExecuting(false);
    setCompletedCount(8);
    setAgents(INITIAL_AGENTS.map((a) => {
      let outputText = "";
      if (a.id === "researcher_agent") {
        outputText = project.artifacts.research_report || project.artifacts.research_dossier || "Market & Technical Research Dossier verified via GoogleSearchTool & MCP Ground Truth.";
      } else if (a.id === "agent_1_vision") {
        outputText = project.artifacts.prd_document || "Product Vision & Scope Specification compiled.";
      } else if (a.id === "agent_2_requirements") {
        outputText = project.artifacts.prd_document || "100% Gherkin Given-When-Then criteria validated.";
      } else if (a.id === "agent_3_architecture") {
        outputText = project.artifacts.database_schema || project.artifacts.api_contracts || "PostgreSQL DDL & RESTful OpenAPI specifications compiled.";
      } else if (a.id === "agent_4_uiux") {
        outputText = project.artifacts.prd_document || "Cybernetic UI layouts & 4-State Matrices defined.";
      } else if (a.id === "agent_5_risks") {
        outputText = project.artifacts.security_spec || project.artifacts.prd_document || "Zero-Trust Security & GDPR/HIPAA compliance verified.";
      } else if (a.id === "agent_6_metrics") {
        outputText = project.artifacts.telemetry_spec || project.artifacts.prd_document || "Telemetry KPIs & Release Roadmap ready.";
      } else if (a.id === "orchestrator_agent") {
        outputText = project.artifacts.orchestrator_report || project.artifacts.prd_document || "Master PRD synthesized and quality gate audit passed.";
      }
      return {
        ...a,
        status: "complete" as const,
        output: outputText,
        logs: [
          `01 [${a.tag}] Ingested stored deliverable for "${project.title}"`,
          `02 [${a.tag}] Loaded from persistent repository`,
        ],
      };
    }));
    setDashboardTab("new_project");
  };

  const handleLogout = () => {
    logoutUser();
    setSessionExpiredNotice(null);
    setCurrentView("landing");
  };

  return (
    <div className="relative min-h-screen bg-[#0B0F17] text-[#F8FAFC] overflow-x-hidden selection:bg-cyan-500/20">
      {/* Background Neural Particles */}
      <NeuralBackground />

      {/* VIEW 1: LANDING PAGE */}
      {currentView === "landing" && (
        <div className="relative z-10 flex flex-col justify-between min-h-screen">
          {/* Top Navbar */}
          <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#06B6D4] to-[#3B82F6] p-[1px]">
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
              <span className="font-hightech font-bold text-base tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400 hightech-glow-text">
                DIGITANO DEV-DOCS
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                <FolderGit2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Monorepo Specs</span>
              </button>

              <button
                onClick={() => {
                  setSessionExpiredNotice(null);
                  setCurrentView("login");
                }}
                className="text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Sign In
              </button>

              <button
                onClick={() => setCurrentView("dashboard")}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:opacity-95 transition-opacity cursor-pointer"
              >
                Launch Studio
              </button>
            </div>
          </header>

          {/* Hero Content */}
          <main className="max-w-6xl mx-auto px-6 pt-6 pb-20 flex flex-col items-center text-center">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-xs font-mono text-cyan-300 mb-6 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Autonomous 8-Agent SDLC Directed Graph Cluster</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight sm:leading-tight mb-6">
              <span className="font-hightech tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                Digitano Dev-Docs:
              </span>{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06B6D4] via-[#38BDF8] to-[#3B82F6]">
                Autonomous 8-Agent SDLC Engine
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-3xl font-normal leading-relaxed mb-8">
              Deploy a coordinated cluster of <strong className="text-white font-semibold">8 specialized AI agents</strong> to transform plain-language briefs into master PRDs, PostgreSQL schemas, OpenAPI contracts, and Vibe-Coder prompts in <span className="text-cyan-400 font-semibold">&lt; 120 seconds</span>.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              <button
                onClick={() => setCurrentView("dashboard")}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] hover:opacity-95 text-white font-semibold text-sm transition-all shadow-xl shadow-cyan-500/25 cursor-pointer transform hover:-translate-y-0.5"
              >
                <span>Launch Studio Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setSessionExpiredNotice(null);
                  setCurrentView("login");
                }}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#131924] hover:bg-[#1a2332] border border-[#1E293B] text-slate-200 font-medium text-sm transition-all cursor-pointer"
              >
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>Sign In via AWS Cognito</span>
              </button>

              <button
                onClick={() => setIsExportModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#131924] hover:bg-[#1a2332] border border-[#1E293B] text-purple-300 font-medium text-sm transition-all cursor-pointer"
              >
                <FolderGit2 className="w-4 h-4 text-purple-400" />
                <span>View Monorepo Specs</span>
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 pt-8 border-t border-[#1E293B]/80 max-w-4xl w-full">
              <div className="p-4 rounded-xl bg-[#131924]/60 border border-[#1E293B]">
                <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">8</div>
                <div className="text-[11px] font-mono tracking-wider text-slate-400 mt-1 uppercase">
                  AI Specialists
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#131924]/60 border border-[#1E293B]">
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">&lt; 120s</div>
                <div className="text-[11px] font-mono tracking-wider text-slate-400 mt-1 uppercase">
                  Avg. Generation
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#131924]/60 border border-[#1E293B]">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">5</div>
                <div className="text-[11px] font-mono tracking-wider text-slate-400 mt-1 uppercase">
                  Master Artifacts
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#131924]/60 border border-[#1E293B]">
                <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono">100%</div>
                <div className="text-[11px] font-mono tracking-wider text-slate-400 mt-1 uppercase">
                  Gherkin SLA
                </div>
              </div>
            </div>

            {/* SECTION: The 8-Agent Cluster Breakdown */}
            <div className="mt-24 w-full">
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-3">
                THE 8 SPECIALIZED AGENTS
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Autonomous Directed SDLC Cluster
              </h2>
              <p className="text-sm text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                Sub-agents do not hallucinate out of order. They execute across a strict 3-stage directed graph: Research (Sequential) &rarr; 6 Technical Specialists (Parallel) &rarr; Master Orchestrator (Synthesis).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                {/* Agent 0 */}
                <div className="p-5 rounded-2xl bg-[#131924] border border-[#1E293B] hover:border-cyan-500/50 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                        ADK 0 • TIER 1
                      </span>
                      <Terminal className="w-4 h-4 text-cyan-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1.5">Technical Researcher</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      Equipped with <code className="text-cyan-300">GoogleSearchTool</code> and web crawler to gather real competitor latency benchmarks and library standards.
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 border-t border-[#1E293B] pt-2">
                    Model: Claude Sonnet 4.6
                  </div>
                </div>

                {/* Agent 1 */}
                <div className="p-5 rounded-2xl bg-[#131924] border border-[#1E293B] hover:border-cyan-500/50 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                        ADK 1 • TIER 1
                      </span>
                      <Compass className="w-4 h-4 text-cyan-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1.5">Vision &amp; Scope Lead</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      Defines bounded user personas with operational pain points, core value propositions, and strict Out-of-Scope Non-Goals.
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 border-t border-[#1E293B] pt-2">
                    Model: Claude Sonnet 4.6
                  </div>
                </div>

                {/* Agent 2 */}
                <div className="p-5 rounded-2xl bg-[#131924] border border-[#1E293B] hover:border-cyan-500/50 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                        ADK 2 • TIER 2
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1.5">Requirements Engineer</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      Converts Vision into epics. Forces 100% of user stories into Given-When-Then Gherkin syntax with quantitative SLAs (p99 &lt; 150ms).
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 border-t border-[#1E293B] pt-2">
                    Model: Claude Haiku 4.5
                  </div>
                </div>

                {/* Agent 3 */}
                <div className="p-5 rounded-2xl bg-[#131924] border border-[#1E293B] hover:border-cyan-500/50 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                        ADK 3 • TIER 2
                      </span>
                      <Database className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1.5">Systems Architect</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      Architects PostgreSQL 16 DDL schemas with foreign keys, indexes, and RESTful OpenAPI contracts using explicit domain nouns.
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 border-t border-[#1E293B] pt-2">
                    Model: Claude Haiku 4.5
                  </div>
                </div>

                {/* Agent 4 */}
                <div className="p-5 rounded-2xl bg-[#131924] border border-[#1E293B] hover:border-cyan-500/50 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                        ADK 4 • TIER 2
                      </span>
                      <Eye className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1.5">Lead UX/UI Designer</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      Synthesizes screen layouts, component hierarchies, design tokens, and explicit 4-state matrices (Default, Hover, Loading, Error).
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 border-t border-[#1E293B] pt-2">
                    Model: Claude Haiku 4.5
                  </div>
                </div>

                {/* Agent 5 */}
                <div className="p-5 rounded-2xl bg-[#131924] border border-[#1E293B] hover:border-cyan-500/50 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                        ADK 5 • TIER 2
                      </span>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1.5">Risk &amp; Compliance</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      Defines Zero-Trust security boundary, AES-256-GCM hardware encryption, OAuth2 PKCE flow, GDPR/HIPAA compliance, and edge cases.
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 border-t border-[#1E293B] pt-2">
                    Model: Claude Haiku 4.5
                  </div>
                </div>

                {/* Agent 6 */}
                <div className="p-5 rounded-2xl bg-[#131924] border border-[#1E293B] hover:border-cyan-500/50 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                        ADK 6 • TIER 2
                      </span>
                      <BarChart3 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1.5">Telemetry Strategist</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      Formulates measurable numerical KPIs (&gt;99.95% uptime) and structures phased MVP release milestones (Alpha, Beta, GA).
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 border-t border-[#1E293B] pt-2">
                    Model: Claude Haiku 4.5
                  </div>
                </div>

                {/* Agent 7 */}
                <div className="p-5 rounded-2xl bg-[#131924] border border-cyan-500/40 shadow-lg shadow-cyan-500/10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-700">
                        ADK 7 • ORCHESTRATOR
                      </span>
                      <Cpu className="w-4 h-4 text-cyan-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1.5">Master Orchestrator</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      Executes quality gate audits for banned tokens, validates 100% Gherkin compliance, and synthesizes the publication-ready PRD suite.
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-cyan-400 border-t border-[#1E293B] pt-2">
                    Model: Claude Sonnet 4.6
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION: Step-by-Step Dashboard Guide */}
            <div className="mt-24 w-full">
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-3">
                DASHBOARD GUIDE &amp; WORKFLOW
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                How to Use the Digitano Dashboard
              </h2>
              <p className="text-sm text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                Follow this simple 4-step workflow to produce publication-ready specifications for any software project.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                {/* Step 1 */}
                <div className="p-6 rounded-2xl bg-[#131924] border border-[#1E293B] relative overflow-hidden">
                  <div className="text-3xl font-extrabold font-mono text-cyan-500/30 mb-3">01</div>
                  <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>Enter Brief</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Type your project idea in plain English or select from preloaded presets (e.g., DripCheck Fashion Rating, Fintech Payment Ledger, Telehealth Clinic).
                  </p>
                  <div className="p-2.5 rounded-lg bg-[#0B0F17] border border-[#1E293B] text-[11px] font-mono text-slate-300">
                    Input: Application title, target audience &amp; core problems.
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-6 rounded-2xl bg-[#131924] border border-[#1E293B] relative overflow-hidden">
                  <div className="text-3xl font-extrabold font-mono text-cyan-500/30 mb-3">02</div>
                  <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-cyan-400" />
                    <span>Execute 3 Stages</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Click "Generate Specification". Watch Stage 1 research, Stage 2 parallel specialist reasoning with live tabs updating simultaneously, and Stage 3 orchestration.
                  </p>
                  <div className="p-2.5 rounded-lg bg-[#0B0F17] border border-[#1E293B] text-[11px] font-mono text-slate-300">
                    Timing: Sub-120s with live token throughput stats.
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-6 rounded-2xl bg-[#131924] border border-[#1E293B] relative overflow-hidden">
                  <div className="text-3xl font-extrabold font-mono text-cyan-500/30 mb-3">03</div>
                  <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Audit &amp; Quality</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Inspect the quality gate badge. Confirm zero banned placeholder tokens (<code className="text-rose-400">item</code>, <code className="text-rose-400">TBD</code>) and verify 100% Gherkin criteria.
                  </p>
                  <div className="p-2.5 rounded-lg bg-[#0B0F17] border border-[#1E293B] text-[11px] font-mono text-slate-300">
                    Quality Gate: Automatic self-correction &amp; sanitization.
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-6 rounded-2xl bg-[#131924] border border-[#1E293B] relative overflow-hidden">
                  <div className="text-3xl font-extrabold font-mono text-cyan-500/30 mb-3">04</div>
                  <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                    <Code className="w-4 h-4 text-cyan-400" />
                    <span>Export &amp; Vibe</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Copy or download all 5 deliverables: Research Dossier, Master PRD, SQL Schema, API Contracts, and Vibe-Coder prompts for Cursor, Windsurf, or Bolt.new.
                  </p>
                  <div className="p-2.5 rounded-lg bg-[#0B0F17] border border-[#1E293B] text-[11px] font-mono text-slate-300">
                    Outputs: Markdown, JSON, and monorepo specs.
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION: Enterprise Security & Session Control Callout */}
            <div className="mt-20 w-full p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-[#131924] to-purple-950/40 border border-cyan-800/40 text-left flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Enterprise Security &amp; Session Guard</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  15-Minute Inactivity Session Termination
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Protect sensitive architecture documents with automatic inactivity logout. Sessions automatically expire after 15 minutes of idle time, requiring re-authentication via AWS Cognito before accessing project workspaces.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="p-3 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-center">
                  <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Timeout</span>
                  <span className="text-xs font-bold text-white font-mono">15 Minutes</span>
                </div>

                <button
                  onClick={() => setCurrentView("dashboard")}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 hover:opacity-95 cursor-pointer"
                >
                  Enter Studio
                </button>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="w-full border-t border-[#1E293B]/80 py-6 px-6 text-center text-xs text-slate-500">
            <p>Digitano Builder &copy; 2026. Autonomous 8-Agent SDLC Engine. 15-Minute Zero-Trust Session Control.</p>
          </footer>
        </div>
      )}

      {/* VIEW 2: LOGIN / AUTH PAGE */}
      {currentView === "login" && (
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <AuthCard
            onBackToHome={() => {
              setSessionExpiredNotice(null);
              setCurrentView("landing");
            }}
            onSuccess={() => {
              setSessionExpiredNotice(null);
              setCurrentView("dashboard");
            }}
            sessionExpiredNotice={sessionExpiredNotice}
          />
        </div>
      )}

      {/* VIEW 3: FULL DASHBOARD */}
      {currentView === "dashboard" && (
        <div className="relative z-10 flex h-screen overflow-hidden">
          {/* Left Sidebar */}
          <Sidebar
            currentTab={dashboardTab}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={setIsSidebarCollapsed}
            onTabChange={(tab) => {
              setDashboardTab(tab as any);
            }}
            onLogout={handleLogout}
            onOpenExportModal={() => setIsExportModalOpen(true)}
          />

          {/* Main Work Area */}
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <TopNavbar
              currentProjectTitle={currentProjectTitle}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />

            <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
              {dashboardTab === "history" && (
                <HistoryView
                  onSelectProject={handleSelectHistoryProject}
                  onNewProject={() => {
                    handleReset();
                    setDashboardTab("new_project");
                  }}
                />
              )}

              {dashboardTab === "settings" && <SettingsView />}

              {dashboardTab === "new_project" && (
                <>
                  {!isExecuting && !isFinished ? (
                    <ProjectBriefInput
                      onSubmit={handleStartProject}
                      isLoading={isExecuting}
                    />
                  ) : (
                    <div className="max-w-5xl mx-auto space-y-8">
                      <AgentProgressTracker
                        agents={agents}
                        completedCount={completedCount}
                        isFinished={isFinished}
                        onReset={handleReset}
                        specInputs={currentSpecInputs || undefined}
                        projectPrompt={currentPrompt}
                        projectTitle={currentProjectTitle}
                      />

                      {artifacts && (
                        <ArtifactViewer
                          artifacts={artifacts}
                          projectTitle={currentProjectTitle}
                          userPrompt={currentPrompt}
                          specInputs={currentSpecInputs || undefined}
                        />
                      )}
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      )}

      {/* Export / Monorepo Codebase Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
