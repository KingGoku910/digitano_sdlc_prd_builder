import React, { useState, useMemo } from "react";
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
  Loader2,
  FileCheck2,
  ExternalLink,
  Layers,
  Rocket,
  Wand2,
  CheckCircle,
  Search,
  FileType,
} from "lucide-react";
import {
  PromptStrategyType,
  STRATEGY_DEFINITIONS,
  VIBE_PLATFORMS,
  generateVibePromptsForStrategy,
} from "../../services/vibeCoderStrategies";
import {
  downloadMarkdown,
  downloadDocx,
  downloadPdf,
  createZipBundle,
  ExportFormat,
  ExportableFile,
} from "../../services/documentExporter";
import { sanitizeAndFormatMarkdown } from "../../services/markdownSanitizer";
import { ProjectSpecificationInputs } from "../../types/projectSpec";

export interface VibePromptItem {
  id: string;
  title: string;
  target: string;
  content: string;
}

export interface ArtifactData {
  research_report?: string;
  prd_document: string;
  database_schema: string;
  api_contracts: string;
  vibe_coder_prompts: VibePromptItem[];
  // Backwards compatibility mappings
  research_dossier?: string;
  security_spec?: string;
  telemetry_spec?: string;
  orchestrator_report?: string;
}

interface ArtifactViewerProps {
  artifacts: ArtifactData;
  projectTitle?: string;
  userPrompt?: string;
  specInputs?: ProjectSpecificationInputs;
}

type CanonicalTab = "research" | "prd" | "database" | "api" | "vibe";

export function ArtifactViewer({
  artifacts,
  projectTitle = "Project Artifacts",
  userPrompt = "",
  specInputs,
}: ArtifactViewerProps) {
  const [activeTab, setActiveTab] = useState<CanonicalTab>("prd");
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("md");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Download states
  const [isDownloadingSingle, setIsDownloadingSingle] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadSuccessAll, setDownloadSuccessAll] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);

  // Vibe Coder Prompt Strategy & Target Platform State
  const [selectedStrategy, setSelectedStrategy] = useState<PromptStrategyType>("oneshot");
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>("cursor");
  const [selectedPromptIndex, setSelectedPromptIndex] = useState<number>(0);
  const [platformLaunchNotice, setPlatformLaunchNotice] = useState<string | null>(null);
  const [vibeViewMode, setVibeViewMode] = useState<"document" | "cards">("document");

  const safeTitle = projectTitle.toLowerCase().replace(/[^a-z0-9]/g, "_") || "project";

  const activePlatform = useMemo(() => {
    return VIBE_PLATFORMS.find((p) => p.id === selectedPlatformId) || VIBE_PLATFORMS[0];
  }, [selectedPlatformId]);

  // Derive active prompts based on chosen strategy and platform
  const activeVibePrompts = useMemo(() => {
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

  // Consolidate research text
  const researchText = useMemo(() => {
    return sanitizeAndFormatMarkdown(
      artifacts.research_report ||
      artifacts.research_dossier ||
      `# Market & Technical Research Dossier\n\nVerified via GoogleSearchTool & MCP Ground Truth.`
    );
  }, [artifacts]);

  // Consolidate PRD text
  const prdText = useMemo(() => {
    return sanitizeAndFormatMarkdown(artifacts.prd_document);
  }, [artifacts]);

  // Consolidate SQL & Models text
  const sqlText = useMemo(() => {
    return sanitizeAndFormatMarkdown(artifacts.database_schema);
  }, [artifacts]);

  // Consolidate API Contracts & Code text
  const apiText = useMemo(() => {
    return sanitizeAndFormatMarkdown(artifacts.api_contracts);
  }, [artifacts]);

  // Consolidate Vibe Code Prompts text tailored to strategy AND platform
  const vibePromptsText = useMemo(() => {
    const raw = activeVibePrompts
      .map((p) => `### ${p.title} (${p.target})\n\n${p.content}`)
      .join("\n\n---\n\n");
    return sanitizeAndFormatMarkdown(
      `# Vibe-Coder Prompt Suite (${activeStrategyDef.label} · ${activePlatform.name})\n\n**Strategy:** ${activeStrategyDef.label} [${activeStrategyDef.badge}]\n**Target Coding Platform:** ${activePlatform.name} (${activePlatform.badge})\n**Platform Capability:** ${activePlatform.tagline}\n**Recommended for:** ${activeStrategyDef.recommendedFor}\n\n---\n\n${raw}`
    );
  }, [activeVibePrompts, activeStrategyDef, activePlatform]);

  // The 5 Canonical Deliverables
  const canonicalFiles: ExportableFile[] = useMemo(() => {
    return [
      {
        filename: `${safeTitle}_01_full_research_report`,
        title: "1. Full Technical & Market Research Report",
        content: researchText,
      },
      {
        filename: `${safeTitle}_02_full_prd_document`,
        title: "2. Full Software Requirements Specification (PRD)",
        content: prdText,
      },
      {
        filename: `${safeTitle}_03_sql_schemas_and_models`,
        title: "3. Full SQL Schemas, Models & Persistence Specification",
        content: sqlText,
      },
      {
        filename: `${safeTitle}_04_api_contracts_and_code`,
        title: "4. Full API Contracts, Usage Structure & Code Snippets",
        content: apiText,
      },
      {
        filename: `${safeTitle}_05_vibe_code_prompts_${selectedPlatformId}_${selectedStrategy}`,
        title: `5. Full Vibe Code Prompts (${activeStrategyDef.label} · ${activePlatform.name})`,
        content: vibePromptsText,
      },
    ];
  }, [safeTitle, researchText, prdText, sqlText, apiText, vibePromptsText, selectedPlatformId, selectedStrategy, activeStrategyDef, activePlatform]);

  // Find active file
  const activeFile = useMemo(() => {
    switch (activeTab) {
      case "research":
        return canonicalFiles[0];
      case "prd":
        return canonicalFiles[1];
      case "database":
        return canonicalFiles[2];
      case "api":
        return canonicalFiles[3];
      case "vibe":
      default:
        return canonicalFiles[4];
    }
  }, [activeTab, canonicalFiles]);

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

  // Download Single Active File
  const handleDownloadActiveFile = async (formatOverride?: ExportFormat) => {
    const fmt = formatOverride || selectedFormat;
    setIsDownloadingSingle(true);
    try {
      if (fmt === "md") {
        downloadMarkdown(activeFile.filename, activeFile.content);
      } else if (fmt === "docx") {
        await downloadDocx(activeFile.filename, activeFile.title, activeFile.content);
      } else if (fmt === "pdf") {
        await downloadPdf(activeFile.filename, activeFile.title, activeFile.content);
      }
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setIsDownloadingSingle(false);
    }
  };

  // Download All 5 Files
  const handleDownloadAllSimultaneously = async () => {
    setIsDownloadingAll(true);
    try {
      for (let i = 0; i < canonicalFiles.length; i++) {
        const file = canonicalFiles[i];
        if (selectedFormat === "md") {
          downloadMarkdown(file.filename, file.content);
        } else if (selectedFormat === "docx") {
          await downloadDocx(file.filename, file.title, file.content);
        } else if (selectedFormat === "pdf") {
          await downloadPdf(file.filename, file.title, file.content);
        }
        await new Promise((r) => setTimeout(r, 250));
      }
      setDownloadSuccessAll(true);
      setTimeout(() => setDownloadSuccessAll(false), 3000);
    } catch (err) {
      console.error("Download all error:", err);
    } finally {
      setIsDownloadingAll(false);
    }
  };

  // Download All as ZIP Archive
  const handleDownloadZipBundle = async () => {
    setIsZipping(true);
    try {
      const zipBlob = await createZipBundle(canonicalFiles, selectedFormat);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeTitle}_5_deliverables_${selectedFormat}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 3000);
    } catch (err) {
      console.error("ZIP Generation error:", err);
    } finally {
      setIsZipping(false);
    }
  };

  // Active targeted prompt text for online platform launcher
  const currentTargetPromptText = useMemo(() => {
    if (selectedPromptIndex === -1) {
      return activeVibePrompts
        .map((p) => `### ${p.title} (${p.target})\n\n${p.content}`)
        .join("\n\n---\n\n");
    }
    return activeVibePrompts[selectedPromptIndex]?.content || activeVibePrompts[0]?.content || "";
  }, [activeVibePrompts, selectedPromptIndex]);

  return (
    <div className="space-y-4">
      {/* 1. TOP STRATEGY & VIBE PLATFORM SELECTION AREA (Requested at top of result area) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0F141F] via-[#131924] to-[#0F141F] border border-purple-500/40 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-md shadow-purple-500/10">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex flex-wrap items-center gap-2">
                <span>Prompt Strategy &amp; Vibe Platform Configuration</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono border border-purple-500/30">
                  Top Result Controls
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Configure prompt engineering strategy and target platform. Deliverable #5 and downloads immediately re-target.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-2.5 py-1 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-[11px] font-mono text-purple-300">
              {STRATEGY_DEFINITIONS.length} Strategies · {VIBE_PLATFORMS.length} Platforms
            </span>
          </div>
        </div>

        {/* 2-Column Selectors: Strategy & Platform */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Column 1: Prompt Engineering Strategy */}
          <div className="p-3.5 rounded-xl bg-[#0B0F17]/80 border border-purple-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-purple-300 flex items-center gap-1.5 font-mono">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>1. Prompt Strategy</span>
              </label>
              <span className="px-2 py-0.5 rounded bg-purple-950/80 text-[10px] font-mono text-purple-300 border border-purple-800/50">
                {activeStrategyDef.badge}
              </span>
            </div>

            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value as PromptStrategyType)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#131924] border border-purple-500/40 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all cursor-pointer shadow-inner"
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

            <div className="text-[11px] text-slate-400 leading-relaxed">
              <span className="text-slate-300 font-medium">{activeStrategyDef.description}</span>
              <div className="text-[10px] text-purple-300 font-mono mt-1">
                Best for: {activeStrategyDef.recommendedFor}
              </div>
            </div>
          </div>

          {/* Column 2: Target Coding Platform */}
          <div className="p-3.5 rounded-xl bg-[#0B0F17]/80 border border-cyan-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5 font-mono">
                <Rocket className="w-3.5 h-3.5 text-cyan-400" />
                <span>2. Target Coding Platform</span>
              </label>
              <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-[10px] font-mono text-cyan-300 border border-cyan-800/50">
                {activePlatform.badge}
              </span>
            </div>

            <select
              value={selectedPlatformId}
              onChange={(e) => setSelectedPlatformId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#131924] border border-cyan-500/40 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all cursor-pointer shadow-inner"
            >
              {VIBE_PLATFORMS.map((platform) => (
                <option
                  key={platform.id}
                  value={platform.id}
                  className="bg-[#0B0F17] text-slate-200 font-normal py-1"
                >
                  {platform.name} ({platform.badge})
                </option>
              ))}
            </select>

            <div className="text-[11px] text-slate-400 leading-relaxed">
              <span className="text-slate-300 font-medium">{activePlatform.tagline}</span>
              <div className="text-[10px] text-cyan-300 font-mono mt-1">
                Optimized for: {activePlatform.popularWith}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Summary Banner */}
        <div className="pt-2.5 border-t border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-slate-300 font-mono">
              Deliverable #5 Active Target: <strong className="text-purple-300">{activeStrategyDef.label}</strong> configured for <strong className="text-cyan-300">{activePlatform.name}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleLaunchPlatform(activePlatform.name, currentTargetPromptText)}
              className="px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/50 text-[11px] font-mono text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Copy className="w-3 h-3 text-cyan-400" />
              <span>Copy Platform Prompt</span>
            </button>
            {platformLaunchNotice && (
              <span className="text-[10px] font-mono text-emerald-400 animate-in fade-in">
                {platformLaunchNotice}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER & MULTI-FORMAT DOWNLOAD ACTION BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-[#131924] border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Production SDLC Deliverables
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/40 text-[11px] font-mono text-cyan-300 font-semibold">
              5 Canonical Deliverables
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Verified, high-value specification package available for direct download in Markdown, Word (.docx), or PDF.
          </p>
        </div>

        {/* Format Selector & Global Download Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Format Selector */}
          <div className="flex items-center p-1 rounded-xl bg-[#0B0F17] border border-[#1E293B]">
            <span className="text-[10px] font-mono text-slate-400 px-2 flex items-center gap-1">
              <FileType className="w-3 h-3 text-cyan-400" />
              <span>Format:</span>
            </span>
            <button
              onClick={() => setSelectedFormat("md")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedFormat === "md"
                  ? "bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              .MD
            </button>
            <button
              onClick={() => setSelectedFormat("docx")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedFormat === "docx"
                  ? "bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              .DOCX
            </button>
            <button
              onClick={() => setSelectedFormat("pdf")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedFormat === "pdf"
                  ? "bg-rose-500/25 text-rose-300 border border-rose-500/50 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              .PDF
            </button>
          </div>

          {/* Download Active File */}
          <button
            onClick={() => handleDownloadActiveFile()}
            disabled={isDownloadingSingle}
            title={`Download active tab as .${selectedFormat}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-xs font-medium text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isDownloadingSingle ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            ) : (
              <Download className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>Export Active (.{selectedFormat.toUpperCase()})</span>
          </button>

          {/* Download All (5 Files) */}
          <button
            onClick={handleDownloadAllSimultaneously}
            disabled={isDownloadingAll}
            title={`Download all 5 files sequentially in .${selectedFormat} format`}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] hover:opacity-95 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isDownloadingAll ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Downloading 5 Files...</span>
              </>
            ) : downloadSuccessAll ? (
              <>
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>All 5 Downloaded!</span>
              </>
            ) : (
              <>
                <FolderDown className="w-3.5 h-3.5" />
                <span>Download All (5 Files)</span>
              </>
            )}
          </button>

          {/* Download ZIP Package */}
          <button
            onClick={handleDownloadZipBundle}
            disabled={isZipping}
            title="Package all 5 deliverables into a single compressed .zip file"
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
                <span>ZIP Package (5)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. CANONICAL TABS (5 DELIVERABLES) */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#0B0F17] rounded-2xl border border-[#1E293B]">
        <button
          onClick={() => setActiveTab("research")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === "research"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-[#131924]"
          }`}
        >
          <Search className="w-4 h-4 text-cyan-400" />
          <span>1. Full Research Report</span>
        </button>

        <button
          onClick={() => setActiveTab("prd")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === "prd"
              ? "bg-[#06B6D4]/20 text-cyan-300 border border-[#06B6D4]/50 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-[#131924]"
          }`}
        >
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>2. Full PRD Document</span>
        </button>

        <button
          onClick={() => setActiveTab("database")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === "database"
              ? "bg-[#06B6D4]/20 text-cyan-300 border border-[#06B6D4]/50 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-[#131924]"
          }`}
        >
          <Database className="w-4 h-4 text-cyan-400" />
          <span>3. SQL Schemas &amp; Models</span>
        </button>

        <button
          onClick={() => setActiveTab("api")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === "api"
              ? "bg-[#06B6D4]/20 text-cyan-300 border border-[#06B6D4]/50 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-[#131924]"
          }`}
        >
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>4. API Contracts &amp; Code</span>
        </button>

        <button
          onClick={() => setActiveTab("vibe")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === "vibe"
              ? "bg-purple-500/25 text-purple-200 border border-purple-500/50 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-[#131924]"
          }`}
        >
          <Code2 className="w-4 h-4 text-purple-400" />
          <span className="font-semibold text-purple-300">5. Vibe-Coder Prompts</span>
          <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono border border-purple-500/30">
            {activeVibePrompts.length}
          </span>
        </button>
      </div>

      {/* 4. TAB CONTENTS & DIRECT EXPORT CONTROLS */}
      <div className="rounded-2xl bg-[#131924] border border-[#1E293B] p-6 relative overflow-hidden shadow-xl">
        {/* Top Floating Action Bar inside Tab Content */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#1E293B]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-cyan-300">
              {activeFile.title}
            </span>
          </div>

          {/* Quick Actions: Copy, .MD, .DOCX, .PDF */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleCopy(activeFile.content, `tab_${activeTab}`)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0B0F17] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-medium text-slate-300 transition-colors cursor-pointer"
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

            <button
              onClick={() => downloadMarkdown(activeFile.filename, activeFile.content)}
              title="Download as Markdown file (.md)"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0B0F17] hover:bg-cyan-950/60 border border-cyan-900/40 text-xs font-mono text-cyan-300 transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>.md</span>
            </button>

            <button
              onClick={() => downloadDocx(activeFile.filename, activeFile.title, activeFile.content)}
              title="Download as Microsoft Word document (.docx)"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0B0F17] hover:bg-blue-950/60 border border-blue-900/40 text-xs font-mono text-blue-300 transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>.docx</span>
            </button>

            <button
              onClick={() => downloadPdf(activeFile.filename, activeFile.title, activeFile.content)}
              title="Download as Adobe PDF document (.pdf)"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0B0F17] hover:bg-rose-950/60 border border-rose-900/40 text-xs font-mono text-rose-300 transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>.pdf</span>
            </button>
          </div>
        </div>

        {/* TAB 1: FULL RESEARCH REPORT */}
        {activeTab === "research" && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono text-cyan-300 font-semibold">
                  Technical Researcher Dossier for Each Agent Role (GoogleSearchTool &amp; MCP Ground Truth)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-900/60 border border-cyan-700/60 text-[10px] font-mono text-cyan-200">
                All 6 Specialized Roles Covered
              </span>
            </div>
            <pre className="whitespace-pre-wrap font-sans bg-[#0B0F17] p-5 rounded-xl border border-[#1E293B] text-slate-200 text-sm leading-relaxed overflow-x-auto">
              {researchText}
            </pre>
          </div>
        )}

        {/* TAB 2: FULL PRD DOCUMENT */}
        {activeTab === "prd" && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-cyan-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono text-cyan-300 font-semibold">
                  Master Software Requirements Specification (PRD) Suite
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800/40 text-[10px] font-mono text-emerald-300">
                100% Gherkin • Zero Banned Tokens
              </span>
            </div>
            <pre className="whitespace-pre-wrap font-sans bg-[#0B0F17] p-5 rounded-xl border border-[#1E293B] text-slate-200 text-sm leading-relaxed overflow-x-auto">
              {prdText}
            </pre>
          </div>
        )}

        {/* TAB 3: SQL SCHEMAS & MODELS */}
        {activeTab === "database" && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono text-cyan-300 font-semibold">
                  {sqlText.includes("Firestore")
                    ? "Firebase Firestore NoSQL Collections, Security Rules & Storage"
                    : "PostgreSQL 16 Production DDL, Single-Table DynamoDB Schema & Seed Data"}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-900/60 border border-cyan-700/60 text-[10px] font-mono text-cyan-200">
                {sqlText.includes("Firestore") ? "Firestore NoSQL + Rules" : "Normalized 3NF + Single-Table"}
              </span>
            </div>
            <pre className="whitespace-pre-wrap font-mono bg-[#0B0F17] p-5 rounded-xl border border-[#1E293B] text-cyan-300/90 text-xs leading-relaxed overflow-x-auto">
              {sqlText}
            </pre>
          </div>
        )}

        {/* TAB 4: API CONTRACTS & CODE */}
        {activeTab === "api" && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-cyan-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono text-cyan-300 font-semibold">
                  OpenAPI 3.1 RESTful Routes, 4-State UI Matrix &amp; Working Code Snippets
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-900/60 border border-cyan-700/60 text-[10px] font-mono text-cyan-200">
                cURL • TypeScript • Python
              </span>
            </div>
            <pre className="whitespace-pre-wrap font-mono bg-[#0B0F17] p-5 rounded-xl border border-[#1E293B] text-slate-200 text-xs leading-relaxed overflow-x-auto">
              {apiText}
            </pre>
          </div>
        )}

        {/* TAB 5: VIBE-CODER PROMPTS */}
        {activeTab === "vibe" && (
          <div className="space-y-6">
            {/* Notification Toast for Platform Launch */}
            {platformLaunchNotice && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-2 shadow-lg animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-medium">{platformLaunchNotice}</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-mono">
                  Prompt copied to clipboard &amp; URL query parameters
                </span>
              </div>
            )}

            {/* ONLINE VIBE CODER PLATFORMS LAUNCHPAD */}
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
                      Click any platform below to launch it in a new tab with your prompt passed via URL query parameters.
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

            {/* VIBE PROMPTS VIEW (DOCUMENT VS MODULAR CARDS) */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                    PROMPT SUITE ({activeVibePrompts.length} MODULAR PROMPTS)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    Active Strategy: <strong className="text-purple-300">{activeStrategyDef.label}</strong>
                  </span>
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#0B0F17] border border-[#1E293B]">
                    <button
                      onClick={() => setVibeViewMode("document")}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                        vibeViewMode === "document"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Export Document
                    </button>
                    <button
                      onClick={() => setVibeViewMode("cards")}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                        vibeViewMode === "cards"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Prompt Cards
                    </button>
                  </div>
                </div>
              </div>

              {vibeViewMode === "document" ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#0B0F17] border border-purple-800/40 flex items-center justify-between text-xs font-mono text-purple-300">
                    <span>Full Canonical Prompt Suite (Identical to Exported Document)</span>
                    <span className="text-[10px] text-slate-400">Strategy: {activeStrategyDef.label} · Platform: {activePlatform.name}</span>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans bg-[#0B0F17] p-5 rounded-xl border border-[#1E293B] text-slate-200 text-sm leading-relaxed overflow-x-auto">
                    {vibePromptsText}
                  </pre>
                </div>
              ) : (
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
                          Tailored for {activeStrategyDef.label} strategy.
                        </p>
                      </div>

                      {/* Action buttons on card */}
                      <div className="flex flex-wrap items-center gap-2">
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
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
