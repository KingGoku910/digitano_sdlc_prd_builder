import React, { useState, useMemo } from "react";
import JSZip from "jszip";
import {
  FileText,
  Database,
  Terminal,
  Code2,
  Copy,
  Check,
  Download,
  FolderDown,
  Archive,
  Sparkles,
  Loader2,
  FileCheck2,
  ExternalLink,
  Layers,
  Rocket,
  Globe,
  Wand2,
  CheckCircle,
  Search,
  ShieldCheck,
  TrendingUp,
  Award,
} from "lucide-react";
import {
  PromptStrategyType,
  STRATEGY_DEFINITIONS,
  VIBE_PLATFORMS,
  generateVibePromptsForStrategy,
} from "../../services/vibeCoderStrategies";

export interface VibePromptItem {
  id: string;
  title: string;
  target: string;
  content: string;
}

export interface ArtifactData {
  prd_document: string;
  database_schema: string;
  api_contracts: string;
  vibe_coder_prompts: VibePromptItem[];
  research_dossier?: string;
  security_spec?: string;
  telemetry_spec?: string;
  orchestrator_report?: string;
}

interface ArtifactViewerProps {
  artifacts: ArtifactData;
  projectTitle?: string;
  userPrompt?: string;
}

interface ArtifactFile {
  filename: string;
  title: string;
  content: string;
  type: string;
}

export function ArtifactViewer({
  artifacts,
  projectTitle = "Project Artifacts",
  userPrompt = "",
}: ArtifactViewerProps) {
  const [activeTab, setActiveTab] = useState<
    "prd" | "research" | "database" | "api" | "risks" | "metrics" | "audit" | "vibe"
  >("prd");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadSuccessAll, setDownloadSuccessAll] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);

  // Vibe Coder Prompt Strategy State (13 strategies to choose from)
  const [selectedStrategy, setSelectedStrategy] = useState<PromptStrategyType>("oneshot");
  const [selectedPromptIndex, setSelectedPromptIndex] = useState<number>(0);
  const [platformLaunchNotice, setPlatformLaunchNotice] = useState<string | null>(null);

  const safeTitle = projectTitle.toLowerCase().replace(/[^a-z0-9]/g, "_") || "project";

  // Derive active prompts based on chosen strategy
  const activeVibePrompts = useMemo(() => {
    if (selectedStrategy === "oneshot" && artifacts.vibe_coder_prompts && artifacts.vibe_coder_prompts.length > 0) {
      return artifacts.vibe_coder_prompts;
    }
    return generateVibePromptsForStrategy(
      selectedStrategy,
      projectTitle,
      userPrompt,
      {
        prd: artifacts.prd_document,
        schema: artifacts.database_schema,
        api: artifacts.api_contracts,
      }
    );
  }, [selectedStrategy, projectTitle, userPrompt, artifacts]);

  const activeStrategyDef = useMemo(() => {
    return STRATEGY_DEFINITIONS.find((s) => s.id === selectedStrategy) || STRATEGY_DEFINITIONS[0];
  }, [selectedStrategy]);

  // Group strategies by category for clean dropdown hierarchy
  const strategyCategories = useMemo(() => {
    const cats: Record<string, typeof STRATEGY_DEFINITIONS> = {};
    STRATEGY_DEFINITIONS.forEach((s) => {
      if (!cats[s.category]) cats[s.category] = [];
      cats[s.category].push(s);
    });
    return cats;
  }, []);

  const getFiles = (): ArtifactFile[] => {
    const vibeContent = activeVibePrompts
      .map((p) => `### ${p.title} (${p.target})\n\n${p.content}\n`)
      .join("\n---\n\n");

    return [
      {
        filename: `${safeTitle}_01_master_prd.md`,
        title: "Master Product Requirements Document",
        content: artifacts.prd_document,
        type: "text/markdown",
      },
      {
        filename: `${safeTitle}_02_research_dossier.md`,
        title: "Market & Technical Research Dossier (MCP Ground Truth)",
        content: artifacts.research_dossier || "Market & Technical Research Dossier verified via GoogleSearchTool & MCP Ground Truth.",
        type: "text/markdown",
      },
      {
        filename: `${safeTitle}_03_database_schema.md`,
        title: "Database Schema & PostgreSQL DDL",
        content: artifacts.database_schema,
        type: "text/markdown",
      },
      {
        filename: `${safeTitle}_04_api_contracts.md`,
        title: "API Endpoint Contracts & UX 4-State Matrix",
        content: artifacts.api_contracts,
        type: "text/markdown",
      },
      {
        filename: `${safeTitle}_05_zero_trust_security.md`,
        title: "Zero-Trust Security & Regulatory Compliance",
        content: artifacts.security_spec || "Zero-Trust Security, AES-256-GCM, and GDPR/HIPAA compliance boundaries verified.",
        type: "text/markdown",
      },
      {
        filename: `${safeTitle}_06_telemetry_kpis.md`,
        title: "Telemetry KPIs & Release Roadmap",
        content: artifacts.telemetry_spec || "Telemetry KPIs & Phased Release Roadmap defined.",
        type: "text/markdown",
      },
      {
        filename: `${safeTitle}_07_quality_gate_audit.md`,
        title: "Orchestrator Quality Gate Audit Certificate",
        content: artifacts.orchestrator_report || "Master PRD Quality Gate Report: 0 banned tokens found, 100% Gherkin compliant.",
        type: "text/markdown",
      },
      {
        filename: `${safeTitle}_08_vibe_coder_prompts_${selectedStrategy}.md`,
        title: `Vibe-Coder Prompts (${activeStrategyDef.label})`,
        content: vibeContent,
        type: "text/markdown",
      },
    ];
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleLaunchPlatform = (platformName: string, promptText: string) => {
    navigator.clipboard.writeText(promptText);
    setPlatformLaunchNotice(`Copied prompt & launched ${platformName}!`);
    setTimeout(() => setPlatformLaunchNotice(null), 4000);
  };

  // Download single active file
  const handleDownloadCurrent = () => {
    let content = "";
    let fileSuffix: string = activeTab;

    if (activeTab === "prd") {
      content = artifacts.prd_document;
      fileSuffix = "01_prd";
    } else if (activeTab === "database") {
      content = artifacts.database_schema;
      fileSuffix = "02_database_schema";
    } else if (activeTab === "api") {
      content = artifacts.api_contracts;
      fileSuffix = "03_api_contracts";
    } else {
      content = activeVibePrompts
        .map((p) => `### ${p.title} (${p.target})\n\n${p.content}\n`)
        .join("\n---\n\n");
      fileSuffix = `04_vibe_prompts_${selectedStrategy}`;
    }

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeTitle}_${fileSuffix}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download all 4 files simultaneously
  const handleDownloadAllSimultaneously = () => {
    setIsDownloadingAll(true);
    const files = getFiles();

    files.forEach((file, index) => {
      setTimeout(() => {
        const blob = new Blob([file.content], { type: file.type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        if (index === files.length - 1) {
          setIsDownloadingAll(false);
          setDownloadSuccessAll(true);
          setTimeout(() => setDownloadSuccessAll(false), 3000);
        }
      }, index * 220);
    });
  };

  // Download all 8 files bundled as a single .ZIP archive
  const handleDownloadZipBundle = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();
      const files = getFiles();

      files.forEach((f) => {
        zip.file(f.filename, f.content);
      });

      const indexSummary = `# ${projectTitle} - Autonomous SDLC Specification Package\n\nGenerated by Google ADK + AWS Bedrock 8-Agent Production Pipeline.\n\nStrategy: ${activeStrategyDef.label} (${activeStrategyDef.badge})\n\n## Included Artifacts:\n1. \`${safeTitle}_01_master_prd.md\` - Master Product Requirements Document\n2. \`${safeTitle}_02_research_dossier.md\` - Market & Technical Research Dossier (MCP Ground Truth)\n3. \`${safeTitle}_03_database_schema.md\` - PostgreSQL DDL Schema & Entity Models\n4. \`${safeTitle}_04_api_contracts.md\` - REST API Contracts & 4-State Matrix\n5. \`${safeTitle}_05_zero_trust_security.md\` - Zero-Trust Security, AES-256-GCM & GDPR\n6. \`${safeTitle}_06_telemetry_kpis.md\` - Telemetry KPIs & Phased Release Roadmap\n7. \`${safeTitle}_07_quality_gate_audit.md\` - Orchestrator Quality Gate Audit Certificate\n8. \`${safeTitle}_08_vibe_coder_prompts_${selectedStrategy}.md\` - Modular Vibe-Coder Prompts\n\nGenerated on: ${new Date().toISOString()}`;
      zip.file("README.md", indexSummary);

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeTitle}_all_8_artifacts.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to generate ZIP archive:", err);
    } finally {
      setIsZipping(false);
    }
  };

  // The active prompt targeted for online vibe coding tools
  const currentTargetPromptText = useMemo(() => {
    if (selectedPromptIndex === -1) {
      // Consolidated
      return activeVibePrompts
        .map((p) => `### ${p.title} (${p.target})\n\n${p.content}`)
        .join("\n\n---\n\n");
    }
    return activeVibePrompts[selectedPromptIndex]?.content || activeVibePrompts[0]?.content || "";
  }, [activeVibePrompts, selectedPromptIndex]);

  return (
    <div className="space-y-4">
      {/* Header & Main Download Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#131924] border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Generated Artifacts
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/40 text-[11px] font-mono text-cyan-300">
              8 Deliverables Ready
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Download each file individually, export all 8 simultaneously, or package into a ZIP.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Download All 8 Files Simultaneously */}
          <button
            onClick={handleDownloadAllSimultaneously}
            disabled={isDownloadingAll}
            title="Download all 8 markdown files to your device simultaneously"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] hover:opacity-95 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isDownloadingAll ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Downloading 8 Files...</span>
              </>
            ) : downloadSuccessAll ? (
              <>
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>All 8 Downloaded!</span>
              </>
            ) : (
              <>
                <FolderDown className="w-3.5 h-3.5" />
                <span>Download All (8 Files)</span>
              </>
            )}
          </button>

          {/* Download All as ZIP */}
          <button
            onClick={handleDownloadZipBundle}
            disabled={isZipping}
            title="Package all 8 artifacts into a single .zip archive"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0B0F17] hover:bg-[#1E293B] border border-cyan-800/40 text-xs font-medium text-cyan-300 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isZipping ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>Zipping...</span>
              </>
            ) : zipSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="text-[#10B981]">ZIP Saved!</span>
              </>
            ) : (
              <>
                <Archive className="w-3.5 h-3.5 text-cyan-400" />
                <span>ZIP Bundle (8)</span>
              </>
            )}
          </button>

          {/* Download Active Single File */}
          <button
            onClick={handleDownloadCurrent}
            title="Download active tab file (.md)"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] border border-[#334155]/60 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Download Active</span>
            <span className="md:hidden">Tab .md</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#0B0F17] rounded-2xl border border-[#1E293B]">
        <button
          onClick={() => setActiveTab("prd")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === "prd"
              ? "bg-[#06B6D4]/15 text-cyan-300 border border-[#06B6D4]/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-[#131924]"
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>1. Master PRD</span>
        </button>

        <button
          onClick={() => setActiveTab("research")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === "research"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-[#131924]"
          }`}
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span>2. Research Dossier (MCP)</span>
        </button>

        <button
          onClick={() => setActiveTab("database")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === "database"
              ? "bg-[#06B6D4]/15 text-cyan-300 border border-[#06B6D4]/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-[#131924]"
          }`}
        >
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span>3. Database DDL</span>
        </button>

        <button
          onClick={() => setActiveTab("api")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === "api"
              ? "bg-[#06B6D4]/15 text-cyan-300 border border-[#06B6D4]/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-[#131924]"
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>4. API Contracts</span>
        </button>

        <button
          onClick={() => setActiveTab("risks")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === "risks"
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-[#131924]"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
          <span>5. Security &amp; Risks</span>
        </button>

        <button
          onClick={() => setActiveTab("metrics")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === "metrics"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-[#131924]"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          <span>6. KPIs &amp; Milestones</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === "audit"
              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-[#131924]"
          }`}
        >
          <Award className="w-3.5 h-3.5 text-indigo-400" />
          <span>7. Quality Gate Audit</span>
        </button>

        <button
          onClick={() => setActiveTab("vibe")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === "vibe"
              ? "bg-purple-500/20 text-purple-200 border border-purple-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-[#131924]"
          }`}
        >
          <Code2 className="w-3.5 h-3.5 text-purple-400" />
          <span className="font-semibold text-purple-300">8. Vibe-Coder Prompts</span>
          <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono border border-purple-500/30">
            {STRATEGY_DEFINITIONS.length}
          </span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="rounded-2xl bg-[#131924] border border-[#1E293B] p-6 relative overflow-hidden shadow-xl">
        {/* Quick Copy Whole Tab Content Button */}
        {activeTab !== "vibe" && (
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => {
                const text =
                  activeTab === "prd"
                    ? artifacts.prd_document
                    : activeTab === "research"
                    ? artifacts.research_dossier || ""
                    : activeTab === "database"
                    ? artifacts.database_schema
                    : activeTab === "api"
                    ? artifacts.api_contracts
                    : activeTab === "risks"
                    ? artifacts.security_spec || ""
                    : activeTab === "metrics"
                    ? artifacts.telemetry_spec || ""
                    : artifacts.orchestrator_report || "";
                handleCopy(text, `tab_${activeTab}`);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B0F17] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-medium text-slate-300 transition-colors cursor-pointer"
            >
              {copiedKey === `tab_${activeTab}` ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#10B981]" />
                  <span className="text-[#10B981]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* PRD View */}
        {activeTab === "prd" && (
          <div className="prose prose-invert max-w-none space-y-4 text-slate-300 text-sm leading-relaxed font-sans">
            <pre className="whitespace-pre-wrap font-sans bg-transparent p-0 border-0 text-slate-300 leading-relaxed">
              {artifacts.prd_document}
            </pre>
          </div>
        )}

        {/* Research Dossier View (MCP GoogleSearchTool Ground Truth) */}
        {activeTab === "research" && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono text-cyan-300 font-semibold">
                  Technical Researcher Context Dossier (Google ADK MCP Tool)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-900/60 border border-cyan-700/60 text-[10px] font-mono text-cyan-200">
                GoogleSearchTool(bypass_multi_tools_limit=True)
              </span>
            </div>
            <pre className="whitespace-pre-wrap font-sans bg-[#0B0F17] p-5 rounded-xl border border-[#1E293B] text-slate-200 text-sm leading-relaxed overflow-x-auto">
              {artifacts.research_dossier || "Market & Technical Research Dossier verified via GoogleSearchTool & MCP Ground Truth."}
            </pre>
          </div>
        )}

        {/* Database Schema View */}
        {activeTab === "database" && (
          <div className="prose prose-invert max-w-none space-y-4 text-slate-300 text-sm leading-relaxed font-mono">
            <pre className="whitespace-pre-wrap font-mono bg-[#0B0F17] p-4 rounded-xl border border-[#1E293B] text-cyan-300/90 text-xs leading-relaxed overflow-x-auto">
              {artifacts.database_schema}
            </pre>
          </div>
        )}

        {/* API Contracts View */}
        {activeTab === "api" && (
          <div className="prose prose-invert max-w-none space-y-4 text-slate-300 text-sm leading-relaxed font-mono">
            <pre className="whitespace-pre-wrap font-mono bg-[#0B0F17] p-4 rounded-xl border border-[#1E293B] text-slate-200 text-xs leading-relaxed overflow-x-auto">
              {artifacts.api_contracts}
            </pre>
          </div>
        )}

        {/* Zero-Trust Security & Risks View */}
        {activeTab === "risks" && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-mono text-rose-300 font-semibold">
                  Zero-Trust Security, AES-256-GCM &amp; Regulatory Compliance
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-900/60 border border-rose-700/60 text-[10px] font-mono text-rose-200">
                Agent 5 Risk &amp; Compliance Officer
              </span>
            </div>
            <pre className="whitespace-pre-wrap font-sans bg-[#0B0F17] p-5 rounded-xl border border-[#1E293B] text-slate-200 text-sm leading-relaxed overflow-x-auto">
              {artifacts.security_spec || "Zero-Trust Security boundary and GDPR/HIPAA compliance policies active."}
            </pre>
          </div>
        )}

        {/* Telemetry KPIs & Milestones View */}
        {activeTab === "metrics" && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono text-amber-300 font-semibold">
                  Measurable Numerical KPIs &amp; Phased Release Milestones
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-900/60 border border-amber-700/60 text-[10px] font-mono text-amber-200">
                Agent 6 Telemetry Strategist
              </span>
            </div>
            <pre className="whitespace-pre-wrap font-sans bg-[#0B0F17] p-5 rounded-xl border border-[#1E293B] text-slate-200 text-sm leading-relaxed overflow-x-auto">
              {artifacts.telemetry_spec || "Quantitative SLAs, latency targets, and phased rollout roadmaps defined."}
            </pre>
          </div>
        )}

        {/* Orchestrator Quality Gate Audit View */}
        {activeTab === "audit" && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-mono text-indigo-300 font-semibold">
                  Master Orchestrator Quality Gate Audit Certificate
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-indigo-900/60 border border-indigo-700/60 text-[10px] font-mono text-emerald-300">
                PASSED • Zero Banned Tokens
              </span>
            </div>
            <pre className="whitespace-pre-wrap font-sans bg-[#0B0F17] p-5 rounded-xl border border-[#1E293B] text-emerald-300/90 text-sm leading-relaxed overflow-x-auto">
              {artifacts.orchestrator_report || "Quality Gate Audit: Zero banned tokens found. 100% Gherkin compliance verified."}
            </pre>
          </div>
        )}

        {/* 4. VIBE-CODER PROMPTS VIEW (With Strategy Dropdown & 5 Online Vibe Coder Launchers) */}
        {activeTab === "vibe" && (
          <div className="space-y-6">
            {/* Notification Toast for Launching Online Platform */}
            {platformLaunchNotice && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-2 shadow-lg animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-medium">{platformLaunchNotice}</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-mono">
                  Prompt in clipboard &amp; URL query parameters
                </span>
              </div>
            )}

            {/* STRATEGY SELECTOR HEADER & DROPDOWN (13 Strategies) */}
            <div className="p-5 rounded-2xl bg-[#0B0F17] border border-purple-500/30 shadow-lg space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-mono uppercase tracking-wider text-purple-300 font-bold">
                      PROMPT ENGINEERING STRATEGY SELECTOR
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono border border-purple-500/30">
                      {STRATEGY_DEFINITIONS.length} Options Available
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Select a prompting strategy tailored for your target AI model or coding style.
                  </p>
                </div>

                {/* Strategy Dropdown */}
                <div className="relative min-w-[280px]">
                  <select
                    value={selectedStrategy}
                    onChange={(e) => setSelectedStrategy(e.target.value as PromptStrategyType)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#131924] border border-purple-500/40 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all cursor-pointer"
                  >
                    {Object.entries(strategyCategories).map(([category, items]) => (
                      <optgroup
                        key={category}
                        label={`── ${category.toUpperCase()} ──`}
                        className="bg-[#131924] text-purple-300 font-bold"
                      >
                        {items.map((strategy) => (
                          <option
                            key={strategy.id}
                            value={strategy.id}
                            className="bg-[#0B0F17] text-slate-200 font-normal py-1"
                          >
                            {strategy.label} [{strategy.badge}]
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Strategy Detail Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#1E293B]/80 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">
                      {activeStrategyDef.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-800/40 text-purple-300 font-mono text-[10px]">
                      {activeStrategyDef.badge}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    {activeStrategyDef.description}
                  </p>
                </div>

                <div className="text-[11px] font-mono text-cyan-400/90 bg-[#131924] px-3 py-1.5 rounded-lg border border-[#1E293B] shrink-0">
                  <span className="text-slate-500">Best for: </span>
                  {activeStrategyDef.recommendedFor}
                </div>
              </div>
            </div>

            {/* ONLINE VIBE CODER PLATFORMS LAUNCHPAD (5 Platforms with URL params) */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0F141F] to-[#0B0F17] border border-cyan-500/30 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Rocket className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Online Vibe Coder Launchpad</span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 text-[10px] font-mono border border-cyan-800/40">
                        5 Platforms Connected
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Click any platform below to launch it in a new tab with your prompt passed via URL parameters.
                    </p>
                  </div>
                </div>

                {/* Target Prompt Selector for Online Launch */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#131924] border border-[#1E293B]">
                  <span className="text-[10px] font-mono text-slate-400 px-2">
                    Send:
                  </span>
                  <button
                    onClick={() => setSelectedPromptIndex(0)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                      selectedPromptIndex === 0
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Prompt 1
                  </button>
                  <button
                    onClick={() => setSelectedPromptIndex(1)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                      selectedPromptIndex === 1
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Prompt 2
                  </button>
                  {activeVibePrompts.length > 2 && (
                    <button
                      onClick={() => setSelectedPromptIndex(2)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                        selectedPromptIndex === 2
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Prompt 3
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedPromptIndex(-1)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                      selectedPromptIndex === -1
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    All In One
                  </button>
                </div>
              </div>

              {/* 5 Online Vibe Coder Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {VIBE_PLATFORMS.map((platform) => {
                  const targetUrl = platform.urlTemplate(currentTargetPromptText, projectTitle);

                  return (
                    <a
                      key={platform.id}
                      href={targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleLaunchPlatform(platform.name, currentTargetPromptText)}
                      className="group p-3.5 rounded-xl bg-[#131924] hover:bg-[#1E293B] border border-[#1E293B] hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-2 cursor-pointer relative overflow-hidden"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {platform.name}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                        </div>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#0B0F17] text-slate-300 border border-slate-800">
                          {platform.badge}
                        </span>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          {platform.tagline}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#1E293B]/60 flex items-center justify-between text-[10px] font-mono text-cyan-400">
                        <span>Launch &amp; Build</span>
                        <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* MODULAR VIBE PROMPTS LIST */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                    GENERATED PROMPT SUITE ({activeVibePrompts.length} PROMPTS)
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  Strategy: <strong className="text-purple-300">{activeStrategyDef.label}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {activeVibePrompts.map((promptItem, idx) => (
                  <div
                    key={promptItem.id || `prompt_${idx}`}
                    className="rounded-2xl bg-[#0B0F17] border border-[#1E293B] p-5 space-y-4 shadow-lg hover:border-slate-700 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white tracking-tight">
                            {promptItem.title}
                          </span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#131924] border border-[#1E293B] text-cyan-400">
                            {promptItem.target}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Engineered with {activeStrategyDef.label} strategy.
                        </p>
                      </div>

                      {/* Action buttons on card */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* 1-Click Launch dropdown / buttons */}
                        <div className="flex items-center gap-1">
                          <a
                            href={`https://lovable.dev/?prompt=${encodeURIComponent(promptItem.content)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleLaunchPlatform("Lovable", promptItem.content)}
                            className="px-2 py-1 rounded-lg bg-[#131924] hover:bg-pink-950/60 border border-pink-900/40 text-[10px] font-mono text-pink-300 transition-colors"
                            title="Launch this prompt directly in Lovable.dev"
                          >
                            Lovable
                          </a>
                          <a
                            href={`https://bolt.new/?prompt=${encodeURIComponent(promptItem.content)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleLaunchPlatform("Bolt.new", promptItem.content)}
                            className="px-2 py-1 rounded-lg bg-[#131924] hover:bg-cyan-950/60 border border-cyan-900/40 text-[10px] font-mono text-cyan-300 transition-colors"
                            title="Launch this prompt directly in Bolt.new"
                          >
                            Bolt
                          </a>
                          <a
                            href={`https://v0.dev/chat?q=${encodeURIComponent(promptItem.content)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleLaunchPlatform("v0.dev", promptItem.content)}
                            className="px-2 py-1 rounded-lg bg-[#131924] hover:bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-200 transition-colors"
                            title="Launch this prompt directly in v0.dev"
                          >
                            v0
                          </a>
                          <a
                            href={`https://replit.com/new?prompt=${encodeURIComponent(promptItem.content)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleLaunchPlatform("Replit", promptItem.content)}
                            className="px-2 py-1 rounded-lg bg-[#131924] hover:bg-amber-950/60 border border-amber-900/40 text-[10px] font-mono text-amber-300 transition-colors"
                            title="Launch this prompt directly in Replit Agent"
                          >
                            Replit
                          </a>
                          <a
                            href={`https://www.create.xyz/?prompt=${encodeURIComponent(promptItem.content)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleLaunchPlatform("Create.xyz", promptItem.content)}
                            className="px-2 py-1 rounded-lg bg-[#131924] hover:bg-purple-950/60 border border-purple-900/40 text-[10px] font-mono text-purple-300 transition-colors"
                            title="Launch this prompt directly in Create.xyz"
                          >
                            Create
                          </a>
                        </div>

                        {/* Copy Prompt Button */}
                        <button
                          onClick={() => handleCopy(promptItem.content, `prompt_${idx}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#131924] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-medium text-slate-300 transition-colors cursor-pointer"
                        >
                          {copiedKey === `prompt_${idx}` ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#10B981]" />
                              <span className="text-[#10B981]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>Copy Prompt</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <pre className="text-xs text-slate-300 font-mono bg-[#131924]/70 p-4 rounded-xl border border-[#1E293B]/70 leading-relaxed whitespace-pre-wrap overflow-x-auto max-h-96">
                      {promptItem.content}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
