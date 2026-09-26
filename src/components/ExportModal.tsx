import React, { useState } from "react";
import { X, Copy, Check, FileCode, FolderGit2, Download, CheckCircle2 } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MONOREPO_FILES: Array<{
  path: string;
  category: "backend" | "frontend" | "config";
  language: string;
  summary: string;
}> = [
  {
    path: "backend/main.py",
    category: "backend",
    language: "python",
    summary: "FastAPI server, CORS, Cognito RS256 JWKS token validation & SSE router",
  },
  {
    path: "backend/router.py",
    category: "backend",
    language: "python",
    summary: "7-Agent SDLC Orchestrator with AWS Bedrock to Google Gemini failover",
  },
  {
    path: "backend/dynamo_service.py",
    category: "backend",
    language: "python",
    summary: "Single-Table DynamoDB schema (PK: USER# / SK: PROJECT#) & boto3 CRUD",
  },
  {
    path: "backend/render.yaml",
    category: "backend",
    language: "yaml",
    summary: "Render infrastructure-as-code specification for Python web service",
  },
  {
    path: "backend/requirements.txt",
    category: "backend",
    language: "txt",
    summary: "Python dependencies (fastapi, uvicorn, sse-starlette, boto3, python-jose)",
  },
  {
    path: "frontend/src/config/aws-cognito.ts",
    category: "frontend",
    language: "typescript",
    summary: "AWS Cognito SDK client setup (us-east-1_Gx1XLOLRJ) & USER_PASSWORD_AUTH",
  },
  {
    path: "frontend/src/services/api.ts",
    category: "frontend",
    language: "typescript",
    summary: "Axios client with Bearer Token interceptor & backend health checker",
  },
  {
    path: "frontend/netlify.toml",
    category: "frontend",
    language: "toml",
    summary: "Netlify build and SPA redirect rules (/* -> /index.html 200)",
  },
  {
    path: "frontend/package.json",
    category: "frontend",
    language: "json",
    summary: "Next.js 16+, Tailwind CSS, lucide-react, amazon-cognito-identity-js",
  },
  {
    path: "README.md",
    category: "config",
    language: "markdown",
    summary: "Complete full-stack architecture specification and deployment guides",
  },
];

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [selectedFile, setSelectedFile] = useState(MONOREPO_FILES[0]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopySpec = () => {
    navigator.clipboard.writeText(
      `File: ${selectedFile.path}\nDescription: ${selectedFile.summary}\nLocation: /${selectedFile.path} in repository workspace.`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[85vh] rounded-2xl bg-[#131924] border border-[#1E293B] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] bg-[#0B0F17]/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Digitano Monorepo Workspace</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/50">
                  Ready to Export
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                All backend (FastAPI/DynamoDB) and frontend (Next.js/Netlify) files are ready for GitHub &amp; Render.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Left sidebar with files, right panel with details */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* File Tree List */}
          <div className="w-full md:w-72 border-r border-[#1E293B] bg-[#0B0F17]/50 overflow-y-auto p-3 space-y-1">
            <div className="text-[11px] font-mono text-slate-400 px-2 py-1 uppercase tracking-wider">
              Repository Tree
            </div>
            {MONOREPO_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2.5 cursor-pointer ${
                    isSelected
                      ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]/60"
                  }`}
                >
                  <FileCode className="w-4 h-4 shrink-0 text-cyan-400" />
                  <span className="truncate">{file.path}</span>
                </button>
              );
            })}
          </div>

          {/* Details / Spec Preview */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#131924]">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
              <div>
                <div className="text-sm font-bold text-white font-mono">
                  /{selectedFile.path}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Category: <span className="uppercase text-cyan-400">{selectedFile.category}</span> · Language: {selectedFile.language}
                </div>
              </div>

              <button
                onClick={handleCopySpec}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B0F17] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-medium text-slate-300 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    <span className="text-[#10B981]">Path Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy File Path</span>
                  </>
                )}
              </button>
            </div>

            <div className="rounded-xl bg-[#0B0F17] border border-[#1E293B] p-4 text-xs font-mono text-slate-300 space-y-2">
              <div className="text-cyan-400 font-semibold">// File Specification:</div>
              <p className="text-slate-300 leading-relaxed font-sans">{selectedFile.summary}</p>
              <div className="pt-2 text-slate-400 text-[11px]">
                The actual file is generated and persisted in the local workspace filesystem at:
                <br />
                <span className="text-cyan-300">/{selectedFile.path}</span>
              </div>
            </div>

            {/* Cloud Deployment Badges */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-[#1E293B] space-y-1">
                <span className="text-[11px] font-mono text-purple-400 uppercase font-semibold">
                  Render Deployment
                </span>
                <p className="text-xs text-slate-400">
                  Ready for auto-deploy using <code className="text-slate-300">backend/render.yaml</code> with Python 3.10+ and Uvicorn.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-[#1E293B] space-y-1">
                <span className="text-[11px] font-mono text-cyan-400 uppercase font-semibold">
                  Netlify Deployment
                </span>
                <p className="text-xs text-slate-400">
                  Ready for static/SPA export using <code className="text-slate-300">frontend/netlify.toml</code> with redirects to /index.html.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#1E293B] bg-[#0B0F17]/80 flex items-center justify-between text-xs text-slate-400">
          <span>Decoupled Architecture: Next.js + FastAPI + AWS Bedrock + DynamoDB</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
