/**
 * Digitano Builder - Main Interactive Application
 * Autonomous Multi-Agent SDLC Engine
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
import { SecretsModal } from "./components/SecretsModal";
import { isAuthenticated, logoutUser } from "./config/aws-cognito";
import { runAgentPipeline, ProjectRecord, AGENT_SPECS } from "./services/sdlcEngine";
import { ArrowRight, Zap, Users, Code, Sparkles, FolderGit2, ShieldCheck, KeyRound } from "lucide-react";

const INITIAL_AGENTS: AgentState[] = [
  {
    id: "agent_01",
    name: "Product Owner",
    tag: "PO",
    number: "Agent 01",
    role: "Scope & User Stories",
    status: "pending",
    logs: [],
    taskHandoff: AGENT_SPECS.agent_01.handoff,
    modelInfo: AGENT_SPECS.agent_01.defaultModel,
  },
  {
    id: "agent_02",
    name: "Software Analyst",
    tag: "SA",
    number: "Agent 02",
    role: "System Architecture & Constraints",
    status: "pending",
    logs: [],
    taskHandoff: AGENT_SPECS.agent_02.handoff,
    modelInfo: AGENT_SPECS.agent_02.defaultModel,
  },
  {
    id: "agent_03",
    name: "UI Lead",
    tag: "UI",
    number: "Agent 03",
    role: "Tailwind Design System & Tokens",
    status: "pending",
    logs: [],
    taskHandoff: AGENT_SPECS.agent_03.handoff,
    modelInfo: AGENT_SPECS.agent_03.defaultModel,
  },
  {
    id: "agent_04",
    name: "Backend Lead",
    tag: "BE",
    number: "Agent 04",
    role: "FastAPI Endpoints & DynamoDB",
    status: "pending",
    logs: [],
    taskHandoff: AGENT_SPECS.agent_04.handoff,
    modelInfo: AGENT_SPECS.agent_04.defaultModel,
  },
  {
    id: "agent_05",
    name: "Full Stack",
    tag: "FS",
    number: "Agent 05",
    role: "React Hooks & State Flow",
    status: "pending",
    logs: [],
    taskHandoff: AGENT_SPECS.agent_05.handoff,
    modelInfo: AGENT_SPECS.agent_05.defaultModel,
  },
  {
    id: "agent_06",
    name: "Infra Architect",
    tag: "IA",
    number: "Agent 06",
    role: "AWS Serverless IaC & Render",
    status: "pending",
    logs: [],
    taskHandoff: AGENT_SPECS.agent_06.handoff,
    modelInfo: AGENT_SPECS.agent_06.defaultModel,
  },
  {
    id: "agent_07",
    name: "Scrum Master",
    tag: "SM",
    number: "Agent 07",
    role: "Consolidated PRD & Vibe Prompts",
    status: "pending",
    logs: [],
    taskHandoff: AGENT_SPECS.agent_07.handoff,
    modelInfo: AGENT_SPECS.agent_07.defaultModel,
  },
];

export default function App() {
  const [currentView, setCurrentView] = useState<"landing" | "login" | "dashboard">("landing");
  const [dashboardTab, setDashboardTab] = useState<"new_project" | "history" | "settings">("new_project");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSecretsModalOpen, setIsSecretsModalOpen] = useState(false);
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

  // Sync auth state on mount
  useEffect(() => {
    if (isAuthenticated()) {
      setCurrentView("dashboard");
    }
  }, []);

  const handleStartProject = async (prompt: string, title: string) => {
    const projectId = "proj_" + Math.random().toString(36).substring(2, 9);
    setCurrentProjectTitle(title);
    setCurrentPrompt(prompt);
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
        }
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
    setAgents(INITIAL_AGENTS.map((a) => ({ ...a, status: "pending", logs: [] })));
  };

  const handleSelectHistoryProject = (project: ProjectRecord) => {
    setCurrentProjectTitle(project.title);
    setCurrentPrompt(project.prompt);
    setArtifacts(project.artifacts);
    setIsFinished(true);
    setIsExecuting(false);
    setCompletedCount(7);
    setAgents(INITIAL_AGENTS.map((a) => {
      let outputText = "";
      if (a.id === "agent_01") outputText = project.artifacts.prd_document.slice(0, 500) + "...";
      else if (a.id === "agent_04") outputText = project.artifacts.database_schema.slice(0, 500) + "...";
      else if (a.id === "agent_05") outputText = project.artifacts.api_contracts.slice(0, 500) + "...";
      else if (a.id === "agent_07") outputText = project.artifacts.vibe_coder_prompts[0]?.content || "";

      return {
        ...a,
        status: "complete",
        taskHandoff: AGENT_SPECS[a.id]?.handoff,
        modelInfo: AGENT_SPECS[a.id]?.defaultModel,
        output: outputText || undefined,
        logs: [
          `01 [${a.tag}] Initialized for ${project.title}...`,
          `02 [${a.tag}] Reasoned with ${AGENT_SPECS[a.id]?.defaultModel.modelName}.`,
          `03 [${a.tag}] Specification persisted in DynamoDB table DigitanoProjects.`,
        ],
      };
    }));
    setDashboardTab("new_project");
  };

  const handleLogout = () => {
    logoutUser();
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
              <span className="font-bold text-lg tracking-tight text-white">Digitano Builder</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSecretsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/40 text-xs font-mono text-cyan-300 transition-colors cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                <span>Active Secrets</span>
              </button>

              <button
                onClick={() => setIsExportModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                <FolderGit2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Monorepo Specs</span>
              </button>

              <button
                onClick={() => setCurrentView("login")}
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
          <main className="max-w-5xl mx-auto px-6 pt-8 pb-16 flex flex-col items-center text-center">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-xs font-mono text-cyan-300 mb-8 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Autonomous Multi-Agent SDLC Engine</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight sm:leading-tight mb-6">
              Digitano Builder:{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06B6D4] via-[#38BDF8] to-[#3B82F6]">
                Autonomous Multi-Agent SDLC Engine
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed mb-10">
              Deploy a 7-agent AI Scrum team to generate PRDs, schemas, and Vibe-Coder
              prompts in <span className="text-cyan-400 font-semibold">&lt; 120 seconds</span>.
            </p>

            {/* Get Started Button */}
            <button
              onClick={() => setCurrentView("dashboard")}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] hover:opacity-95 text-white font-semibold text-sm transition-all shadow-xl shadow-cyan-500/25 cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6 sm:gap-16 mt-16 pt-10 border-t border-[#1E293B]/80 max-w-2xl w-full">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">7</div>
                <div className="text-[11px] font-mono tracking-wider text-slate-400 mt-1 uppercase">
                  AI Agents
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">120s</div>
                <div className="text-[11px] font-mono tracking-wider text-slate-400 mt-1 uppercase">
                  Avg. Generation
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">5</div>
                <div className="text-[11px] font-mono tracking-wider text-slate-400 mt-1 uppercase">
                  SA Cities Served
                </div>
              </div>
            </div>

            {/* Core Capabilities Section */}
            <div className="mt-24 w-full">
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-3">
                CORE CAPABILITIES
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Everything you need to ship faster
              </h2>
              <p className="text-sm text-slate-400 max-w-xl mx-auto mb-12 leading-relaxed">
                A purpose-built multi-agent engine that transforms how teams approach the
                software development lifecycle — from idea to deployment.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {/* Feature 1 */}
                <div className="p-6 rounded-2xl bg-[#131924] border border-[#1E293B] shadow-lg hover:border-cyan-500/40 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400 mb-5">
                    <Zap className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2.5">
                    Agile Software Vibe Coding
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Express your software vision in natural language. Digitano Builder
                    translates vibe-driven prompts into structured, production-ready
                    development artifacts with AI precision.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="p-6 rounded-2xl bg-[#131924] border border-[#1E293B] shadow-lg hover:border-cyan-500/40 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400 mb-5">
                    <Users className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2.5">
                    7-Agent Task Handoff
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    A coordinated team of seven specialized AI agents passes tasks
                    seamlessly — from product requirements to schema design to code
                    generation — mimicking a real Scrum team.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="p-6 rounded-2xl bg-[#131924] border border-[#1E293B] shadow-lg hover:border-cyan-500/40 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400 mb-5">
                    <Code className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2.5">
                    Instant Vibe Prompt Generation
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Generate refined, context-aware Vibe-Coder prompts in seconds. Each
                    prompt carries the full project context, ensuring consistent output
                    across every agent handoff.
                  </p>
                </div>
              </div>

              <div className="mt-12 text-center">
                <button
                  onClick={() => setCurrentView("dashboard")}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <span>Start building with Digitano</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="w-full border-t border-[#1E293B]/80 py-6 px-6 text-center text-xs text-slate-500">
            <p>Digitano Builder &copy; 2026. Autonomous SDLC Engine. AWS Bedrock &amp; Google Gemini Failover.</p>
          </footer>
        </div>
      )}

      {/* VIEW 2: LOGIN / AUTH PAGE */}
      {currentView === "login" && (
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <AuthCard
            onBackToHome={() => setCurrentView("landing")}
            onSuccess={() => setCurrentView("dashboard")}
          />
        </div>
      )}

      {/* VIEW 3: FULL DASHBOARD */}
      {currentView === "dashboard" && (
        <div className="relative z-10 flex h-screen overflow-hidden">
          {/* Left Sidebar (Minimizable to Lucide Icons Only) */}
          <Sidebar
            currentTab={dashboardTab}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={setIsSidebarCollapsed}
            onTabChange={(tab) => {
              setDashboardTab(tab as any);
              if (tab === "new_project" && isFinished) {
                // Keep artifacts visible or ready
              }
            }}
            onLogout={handleLogout}
            onOpenExportModal={() => setIsExportModalOpen(true)}
          />

          {/* Main Work Area */}
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <TopNavbar
              currentProjectTitle={currentProjectTitle}
              onOpenExportModal={() => setIsExportModalOpen(true)}
              onOpenSecretsModal={() => setIsSecretsModalOpen(true)}
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
                      />

                      {artifacts && (
                        <ArtifactViewer
                          artifacts={artifacts}
                          projectTitle={currentProjectTitle}
                          userPrompt={currentPrompt}
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

      {/* Secrets & Credentials Live Inspector Modal */}
      <SecretsModal
        isOpen={isSecretsModalOpen}
        onClose={() => setIsSecretsModalOpen(false)}
      />
    </div>
  );
}
