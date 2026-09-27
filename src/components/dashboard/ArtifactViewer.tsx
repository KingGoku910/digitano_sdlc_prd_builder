import React, { useState } from "react";
import {
  FileText,
  Database,
  Terminal,
  Code2,
  Copy,
  Check,
  Download,
  Sparkles,
} from "lucide-react";

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
}

export function ArtifactViewer({ artifacts, projectTitle = "Project Artifacts" }: ArtifactViewerProps) {
  const [activeTab, setActiveTab] = useState<"prd" | "database" | "api" | "vibe">("prd");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownload = () => {
    let content = "";
    if (activeTab === "prd") content = artifacts.prd_document;
    else if (activeTab === "database") content = artifacts.database_schema;
    else if (activeTab === "api") content = artifacts.api_contracts;
    else {
      content = artifacts.vibe_coder_prompts
        .map((p) => `### ${p.title} (${p.target})\n\n${p.content}\n`)
        .join("\n---\n\n");
    }

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectTitle.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${activeTab}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Generated Artifacts
          </h2>
          <p className="text-xs text-slate-400">
            All artifacts from your 7-agent AI Scrum team.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#131924] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-medium text-slate-300 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Download .md</span>
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
          <span>PRD Document</span>
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
          <span>Database Schema</span>
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
          <span>API Contracts</span>
        </button>

        <button
          onClick={() => setActiveTab("vibe")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === "vibe"
              ? "bg-[#06B6D4]/15 text-cyan-300 border border-[#06B6D4]/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-[#131924]"
          }`}
        >
          <Code2 className="w-4 h-4 text-cyan-400" />
          <span>&lt;/&gt; Vibe-Coder Prompts</span>
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

        {/* Vibe-Coder Prompts View */}
        {activeTab === "vibe" && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/30 text-xs text-cyan-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                Copy these prompts directly into Cursor, Claude Code, Windsurf, or Bolt to implement each layer autonomously.
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {artifacts.vibe_coder_prompts.map((promptItem) => (
                <div
                  key={promptItem.id}
                  className="rounded-xl bg-[#0B0F17] border border-[#1E293B] p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {promptItem.title}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#131924] border border-[#1E293B] text-cyan-400">
                        {promptItem.target}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopy(promptItem.content, promptItem.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#131924] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-medium text-slate-300 transition-colors cursor-pointer"
                    >
                      {copiedKey === promptItem.id ? (
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

                  <p className="text-xs text-slate-300 font-mono bg-[#131924]/60 p-3 rounded-lg border border-[#1E293B]/60 leading-relaxed whitespace-pre-wrap">
                    {promptItem.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
