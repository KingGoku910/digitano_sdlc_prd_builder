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
  const [activeTab, setActiveTab] = useState<"prd" | "database" | "api" | "vibe">("prd");
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
        filename: `${safeTitle}_01_prd.md`,
        title: "Product Requirements Document",
        content: artifacts.prd_document,
        type: "text/markdown",
      },
      {
        filename: `${safeTitle}_02_database_schema.md`,
        title: "Database Schema & Data Model",
        content: artifacts.database_schema,
        type: "text/markdown",
      },
      {
        filename: `${safeTitle}_03_api_contracts.md`,
        title: "API Endpoint Contracts",
        content: artifacts.api_contracts,
        type: "text/markdown",
      },
      {
        filename: `${safeTitle}_04_vibe_coder_prompts_${selectedStrategy}.md`,
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

  // Download all 4 files bundled as a single .ZIP archive
  const handleDownloadZipBundle = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();
      const files = getFiles();

      files.forEach((f) => {
        zip.file(f.filename, f.content);
      });

      const indexSummary = `# ${projectTitle} - Autonomous SDLC Specification Package\n\nGenerated by Digitano 7-Agent SDLC Engine.\n\nStrategy: ${activeStrategyDef.label} (${activeStrategyDef.badge})\n\n## Included Artifacts:\n1. \`${safeTitle}_01_prd.md\` - Full Product Requirements Document\n2. \`${safeTitle}_02_database_schema.md\` - Database Schema & Data Models\n3. \`${safeTitle}_03_api_contracts.md\` - REST API Contracts & Endpoints\n4. \`${safeTitle}_04_vibe_coder_prompts_${selectedStrategy}.md\` - Modular Vibe-Coder Prompts for Cursor, Claude Code, Lovable, Bolt.new\n\nGenerated on: ${new Date().toISOString()}`;
      zip.file("README.md", indexSummary);

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeTitle}_all_4_artifacts.zip`;
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
              4 Deliverables Ready
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Download each file individually, export all 4 simultaneously, or package into a ZIP.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Download All 4 Files Simultaneously */}
          <button
            onClick={handleDownloadAllSimultaneously}
            disabled={isDownloadingAll}
            title="Download all 4 markdown files to your device simultaneously"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] hover:opacity-95 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isDownloadingAll ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Downloading 4 Files...</span>
              </>
            ) : downloadSuccessAll ? (
              <>
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>All 4 Downloaded!</span>
              </>
            ) : (
              <>
                <FolderDown className="w-3.5 h-3.5" />
                <span>Download All (4 Files)</span>
              </>
            )}
          </button>

          {/* Download All as ZIP */}
          <button
            onClick={handleDownloadZipBundle}
            disabled={isZipping}
            title="Package all 4 artifacts into a single .zip archive"
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
                <span>ZIP Bundle</span>
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
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#0B0F17] rounded-2xl border border-[#1E293B]">
        <button
          onClick={() => setActiveTab("prd")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === "prd"
              ? "bg-[#06B6D4]/15 text-cyan-300 border border-[#06B6D4]/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-[#131924]"
          }`}
        >
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>1. PRD Document</span>
        </button>

        <button
          onClick={() => setActiveTab("database")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === "database"
              ? "bg-[#06B6D4]/15 text-cyan-300 border border-[#06B6D4]/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-[#131924]"
          }`}
        >
          <Database className="w-4 h-4 text-cyan-400" />
          <span>2. Database Schema</span>
        </button>

        <button
          onClick={() => setActiveTab("api")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === "api"
              ? "bg-[#06B6D4]/15 text-cyan-300 border border-[#06B6D4]/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-[#131924]"
          }`}
        >
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>3. API Contracts</span>
        </button>

        <button
          onClick={() => setActiveTab("vibe")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === "vibe"
              ? "bg-purple-500/20 text-purple-200 border border-purple-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-[#131924]"
          }`}
        >
          <Code2 className="w-4 h-4 text-purple-400" />
          <span className="font-semibold text-purple-300">4. Vibe-Coder Prompts</span>
          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono border border-purple-500/30">
            {STRATEGY_DEFINITIONS.length} Strategies
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
                    : activeTab === "database"
                    ? artifacts.database_schema
                    : artifacts.api_contracts;
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
