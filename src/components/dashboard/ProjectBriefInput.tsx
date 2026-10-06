import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  ArrowRight,
  Bot,
  Zap,
  Mic,
  MicOff,
  Volume2,
  Wand2,
  Layers,
  Database,
  Server,
  Palette,
  Layout,
  Cpu,
  Check,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import {
  PlatformType,
  AgentModeType,
  ProjectSpecificationInputs,
  PLATFORM_FRONTEND_OPTIONS,
  PLATFORM_UI_OPTIONS,
  PLATFORM_BACKEND_OPTIONS,
  DATABASE_PRESETS,
  AI_MODELS_CATALOG,
} from "../../types/projectSpec";
import { autoImproveProjectDescription } from "../../services/promptImprover";

interface ProjectBriefInputProps {
  onSubmit: (prompt: string, title: string, specInputs?: ProjectSpecificationInputs) => void;
  isLoading?: boolean;
}

const SAMPLE_BLUEPRINTS = [
  {
    title: "AuditPulse AI",
    type: "Web App" as PlatformType,
    frontend: "Next.js (App Router)",
    ui: ["Tailwind CSS v4", "shadcn/ui"],
    backend: "Python (FastAPI)",
    dbPreset: "supabase_vector",
    models: ["claude-3-7-sonnet", "gemini-3.8-flash"],
    mode: "Multi-Agent" as AgentModeType,
    description: `Build "AuditPulse AI," an enterprise-grade B2B contract risk auditing platform. Mid-market companies, agencies, and legal teams upload vendor NDAs, MSAs, and client agreements. The system parses document text, identifies high-risk liabilities, missing indemnity protections, and hidden auto-renewal clauses, providing an instant overall risk score (0–100) along with line-by-line redline suggestions.`,
  },
  {
    title: "OmniFleet Logistics HUD",
    type: "Web App" as PlatformType,
    frontend: "Next.js (App Router)",
    ui: ["Tailwind CSS v4", "shadcn/ui"],
    backend: "Python (FastAPI)",
    dbPreset: "dynamo_s3",
    models: ["gemini-3.5-pro", "claude-3-5-sonnet"],
    mode: "Multi-Agent" as AgentModeType,
    description: `Real-time freight route dispatch HUD tracking truck telemetry, driver duty cycles, and automated cargo temperature alerts with sub-50ms optimistic state updates.`,
  },
  {
    title: "HealthSync Mobile Patient Portal",
    type: "Mobile App" as PlatformType,
    frontend: "React Native (Expo SDK 52)",
    ui: ["Tamagui", "NativeWind (Tailwind)"],
    backend: "Python (FastAPI Serverless)",
    dbPreset: "postgres_redis",
    models: ["claude-3-5-sonnet", "gpt-4o"],
    mode: "Single Agent" as AgentModeType,
    description: `HIPAA-compliant patient portal with appointment booking, encrypted lab report storage, asynchronous doctor messaging, and push notifications for medication reminders.`,
  },
  {
    title: "Fintech Vault Ledger",
    type: "Web App" as PlatformType,
    frontend: "Next.js (App Router)",
    ui: ["Tailwind CSS v4", "shadcn/ui"],
    backend: "Go (Gin / Fiber)",
    dbPreset: "postgres_redis",
    models: ["claude-3-7-sonnet", "deepseek-r1"],
    mode: "Multi-Agent" as AgentModeType,
    description: `Double-entry transaction ledger with multi-currency wallets, instant peer-to-peer settlement, fraud anomaly detection, and automated reconciliation reports.`,
  },
];

export function ProjectBriefInput({ onSubmit, isLoading = false }: ProjectBriefInputProps) {
  // Mode toggle: Simple vs Advanced
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

  // 1. Project Name
  const [projectName, setProjectName] = useState("");

  // 2. Project Type
  const [projectType, setProjectType] = useState<PlatformType>("Web App");

  // 3. Frontend
  const [frontend, setFrontend] = useState<string>("Next.js (App Router)");

  // 4. UI & Styling
  const [uiStyling, setUiStyling] = useState<string[]>(["Tailwind CSS v4", "shadcn/ui"]);

  // 5. Backend
  const [backend, setBackend] = useState<string>("Python (FastAPI)");

  // 6. Database Dependencies
  const [selectedDbPreset, setSelectedDbPreset] = useState<string>("postgres_redis");
  const [customDatabases, setCustomDatabases] = useState<string[]>(["PostgreSQL 16", "Redis (In-Memory)"]);

  // 7. AI Integration
  const [selectedModels, setSelectedModels] = useState<string[]>(["claude-3-7-sonnet", "gemini-3.8-flash"]);
  const [selectedManufacturerTab, setSelectedManufacturerTab] = useState<"Google" | "Anthropic" | "OpenAI" | "DeepSeek">("Google");
  const [agentMode, setAgentMode] = useState<AgentModeType>("Multi-Agent");

  // 8. Description & Wand Auto-Improvement
  const [promptText, setPromptText] = useState("");
  const [isImprovingPrompt, setIsImprovingPrompt] = useState(false);
  const [improveSuccessNotice, setImproveSuccessNotice] = useState<string | null>(null);

  // Voice Typing
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Update default frontend/backend options when project type changes
  useEffect(() => {
    const validFrontends = PLATFORM_FRONTEND_OPTIONS[projectType];
    if (!validFrontends.includes(frontend)) {
      setFrontend(validFrontends[0]);
    }

    const validBackends = PLATFORM_BACKEND_OPTIONS[projectType];
    if (!validBackends.includes(backend)) {
      setBackend(validBackends[0]);
    }

    const validUi = PLATFORM_UI_OPTIONS[projectType];
    setUiStyling((prev) => {
      const filtered = prev.filter((u) => validUi.includes(u));
      return filtered.length > 0 ? filtered : [validUi[0]];
    });
  }, [projectType]);

  // Update databases when preset changes
  useEffect(() => {
    const preset = DATABASE_PRESETS.find((p) => p.id === selectedDbPreset);
    if (preset) {
      setCustomDatabases(preset.databases);
    }
  }, [selectedDbPreset]);

  // Voice Typing setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setVoiceSupported(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setPromptText((prev) => {
            const separator = prev && !prev.endsWith(" ") ? " " : "";
            return prev + separator + transcript;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition notice:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceTyping = () => {
    if (!voiceSupported || !recognitionRef.current) {
      setVoiceNotice("Voice typing is not supported in this browser.");
      setTimeout(() => setVoiceNotice(null), 3500);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn("Could not start speech recognition:", err);
      }
    }
  };

  // Wand Auto-Improve Action
  const handleAutoImprove = async () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setIsImprovingPrompt(true);
    try {
      // If project name is not set, infer from prompt
      let activeTitle = projectName.trim();
      if (!activeTitle) {
        const match = promptText.match(/Build (?:a|an) (?:full-stack )?([a-zA-Z0-9\s-]+?)(?: web application| mobile application| app| platform| system)/i);
        if (match && match[1]) {
          activeTitle = match[1].trim().split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
          setProjectName(activeTitle);
        }
      }

      // Auto-detect and align stack options mentioned in description
      if (/next\.?js/i.test(promptText)) {
        setFrontend("Next.js (App Router)");
      } else if (/react native/i.test(promptText)) {
        setProjectType("Mobile App");
        setFrontend("React Native (Expo SDK 52)");
      } else if (/flutter/i.test(promptText)) {
        setProjectType("Mobile App");
        setFrontend("Flutter 3.x (Dart)");
      }

      if (/tailwind/i.test(promptText) && !uiStyling.includes("Tailwind CSS v4")) {
        setUiStyling((prev) => Array.from(new Set([...prev, "Tailwind CSS v4"])));
      }
      if (/shadcn/i.test(promptText) && !uiStyling.includes("shadcn/ui")) {
        setUiStyling((prev) => Array.from(new Set([...prev, "shadcn/ui"])));
      }

      if (/fastapi|python/i.test(promptText)) {
        setBackend("Python (FastAPI)");
      }

      if (/firebase|firestore/i.test(promptText)) {
        setCustomDatabases((prev) => Array.from(new Set([...prev, "Firebase Firestore DB", "Firebase Cloud Storage"])));
      }

      const detectedModels: string[] = [];
      if (/claude/i.test(promptText)) {
        detectedModels.push("claude-3-5-sonnet");
      }
      if (/gpt-4o|chatgpt/i.test(promptText)) {
        detectedModels.push("gpt-4o");
      }
      if (detectedModels.length > 0) {
        setSelectedModels(detectedModels.slice(0, 2));
      }

      const specState: Partial<ProjectSpecificationInputs> = {
        projectName: activeTitle,
        projectType,
        frontend: /next\.?js/i.test(promptText) ? "Next.js (App Router)" : frontend,
        uiStyling,
        backend: /fastapi|python/i.test(promptText) ? "Python (FastAPI)" : backend,
        database: customDatabases,
        aiIntegration: { models: detectedModels.length > 0 ? detectedModels.slice(0, 2) : selectedModels, agentMode },
      };

      const enriched = await autoImproveProjectDescription(promptText, specState);
      setPromptText(enriched);
      setImproveSuccessNotice("Description analyzed & enhanced with 100% context preservation!");
      setTimeout(() => setImproveSuccessNotice(null), 4000);
    } catch (err) {
      console.error("Auto-improve error:", err);
    } finally {
      setIsImprovingPrompt(false);
    }
  };

  const handleToggleUiOption = (option: string) => {
    setUiStyling((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const handleToggleAiModel = (modelId: string) => {
    setSelectedModels((prev) => {
      if (prev.includes(modelId)) {
        return prev.filter((m) => m !== modelId);
      }
      if (prev.length >= 2) {
        // Replace secondary
        return [prev[0], modelId];
      }
      return [...prev, modelId];
    });
  };

  const handleSelectSample = (sample: (typeof SAMPLE_BLUEPRINTS)[0]) => {
    setProjectName(sample.title);
    setProjectType(sample.type);
    setFrontend(sample.frontend);
    setUiStyling(sample.ui);
    setBackend(sample.backend);
    setSelectedDbPreset(sample.dbPreset);
    setSelectedModels(sample.models);
    setAgentMode(sample.mode);
    setPromptText(sample.description);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    if (!promptText.trim()) return;

    const finalTitle = projectName.trim() || promptText.slice(0, 32).trim() + "...";

    const specInputs: ProjectSpecificationInputs = {
      projectName: finalTitle,
      projectType,
      frontend,
      uiStyling,
      backend,
      database: customDatabases,
      databasePreset: selectedDbPreset,
      aiIntegration: {
        models: selectedModels,
        agentMode,
      },
      description: promptText.trim(),
    };

    // Construct enriched unified prompt to send to agents
    const unifiedPrompt = `Project Name: ${finalTitle}
Project Type: ${projectType}
Build Stack:
- Frontend: ${frontend} (${uiStyling.join(", ")})
- Backend: ${backend}
- Database: ${customDatabases.join(", ")}
- AI Engine: ${selectedModels.join(", ")} (${agentMode})

Description & Requirements:
${promptText.trim()}`;

    onSubmit(unifiedPrompt, finalTitle, specInputs);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Mode Switcher */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-xs font-mono text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Engine — Step 1: Project Architecture Specification</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/40 text-[11px] font-mono text-purple-300">
              <Zap className="w-3 h-3 text-purple-400" />
              <span>Google ADK + AWS Bedrock</span>
            </div>
          </div>

          {/* Simple vs Advanced Mode Toggle */}
          <button
            type="button"
            onClick={() => setIsAdvancedMode(!isAdvancedMode)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#131924] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-medium text-slate-300 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isAdvancedMode ? "Switch to Simple View" : "Advanced Stack Options"}</span>
          </button>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Configure your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06B6D4] to-[#3B82F6]">system architecture</span>
        </h1>

        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          Define your target platform, frontend, backend, databases, and AI models. The 8 Google ADK agents will generate a publication-ready PRD, schema, API contracts, and Vibe-Coder prompts.
        </p>
      </div>

      {improveSuccessNotice && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2 shadow-lg animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{improveSuccessNotice}</span>
        </div>
      )}

      {voiceNotice && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
          {voiceNotice}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ROW 1: Project Name & Project Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1.5 font-mono">
              1. PROJECT NAME
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. AuditPulse AI or NextGen HealthVault"
              className="w-full px-4 py-2.5 bg-[#131924] border border-[#1E293B] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 font-mono">
              2. PROJECT TYPE
            </label>
            <div className="relative">
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as PlatformType)}
                className="w-full px-3.5 py-2.5 bg-[#131924] border border-[#1E293B] rounded-xl text-sm font-medium text-white focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4] transition-all cursor-pointer"
              >
                <option value="Web App">Web App</option>
                <option value="Mobile App">Mobile App</option>
                <option value="Desktop App">Desktop App</option>
              </select>
            </div>
          </div>
        </div>

        {/* ADVANCED STACK BUILD SELECTION (Collapsible or always visible in advanced mode) */}
        <div className={`space-y-4 rounded-2xl bg-[#0B0F17] border border-[#1E293B] p-4 transition-all ${isAdvancedMode ? "block" : "hidden sm:block"}`}>
          <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                Build Stack &amp; Architecture Configuration ({projectType})
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Adapts dynamically to {projectType}
            </span>
          </div>

          {/* 3. FRONTEND FRAMEWORK (Radio Buttons) */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 font-mono">
              3. PROJECT FRONTEND (PLATFORM: {projectType.toUpperCase()})
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {PLATFORM_FRONTEND_OPTIONS[projectType].map((option) => (
                <label
                  key={option}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    frontend === option
                      ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-300 font-semibold shadow-sm"
                      : "bg-[#131924] border-[#1E293B] text-slate-300 hover:text-white hover:bg-[#1E293B]"
                  }`}
                >
                  <input
                    type="radio"
                    name="frontend-option"
                    value={option}
                    checked={frontend === option}
                    onChange={() => setFrontend(option)}
                    className="accent-cyan-400 sr-only"
                  />
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                    frontend === option ? "border-cyan-400 bg-cyan-400" : "border-slate-600"
                  }`}>
                    {frontend === option && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </span>
                  <span className="truncate">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 4. UI & STYLING (Checkboxes) */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 font-mono">
              4. PROJECT UI &amp; STYLING LIBRARIES (MULTIPLE SELECTIONS)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {PLATFORM_UI_OPTIONS[projectType].map((uiOpt) => {
                const isSelected = uiStyling.includes(uiOpt);
                return (
                  <button
                    key={uiOpt}
                    type="button"
                    onClick={() => handleToggleUiOption(uiOpt)}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "bg-purple-500/15 border-purple-500/50 text-purple-300 font-semibold shadow-sm"
                        : "bg-[#131924] border-[#1E293B] text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="truncate">{uiOpt}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. BACKEND (Radio Buttons) */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 font-mono">
              5. PROJECT BACKEND RUNTIME
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PLATFORM_BACKEND_OPTIONS[projectType].map((backendOpt) => (
                <label
                  key={backendOpt}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    backend === backendOpt
                      ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-300 font-semibold shadow-sm"
                      : "bg-[#131924] border-[#1E293B] text-slate-300 hover:text-white hover:bg-[#1E293B]"
                  }`}
                >
                  <input
                    type="radio"
                    name="backend-option"
                    value={backendOpt}
                    checked={backend === backendOpt}
                    onChange={() => setBackend(backendOpt)}
                    className="accent-cyan-400 sr-only"
                  />
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                    backend === backendOpt ? "border-cyan-400 bg-cyan-400" : "border-slate-600"
                  }`}>
                    {backend === backendOpt && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </span>
                  <span className="truncate">{backendOpt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 6. DATABASE DEPENDENCIES */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 font-mono flex items-center justify-between">
              <span>6. PROJECT DATABASE DEPENDENCIES (SQL / NOSQL / VECTOR)</span>
              <span className="text-[11px] text-cyan-400">Curated Presets</span>
            </label>
            <select
              value={selectedDbPreset}
              onChange={(e) => setSelectedDbPreset(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#131924] border border-[#1E293B] rounded-xl text-xs font-medium text-white focus:outline-none focus:border-[#06B6D4] transition-all cursor-pointer mb-2"
            >
              {DATABASE_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id} className="bg-[#0B0F17] text-slate-200">
                  {preset.name}
                </option>
              ))}
            </select>

            {/* Selected Database Tags */}
            <div className="flex flex-wrap gap-1.5">
              {customDatabases.map((dbName) => (
                <span
                  key={dbName}
                  className="px-2.5 py-1 rounded-lg bg-[#131924] border border-cyan-800/40 text-[11px] font-mono text-cyan-300 flex items-center gap-1"
                >
                  <Database className="w-3 h-3 text-cyan-400" />
                  <span>{dbName}</span>
                </span>
              ))}
            </div>
          </div>

          {/* 7. AI INTEGRATION */}
          <div className="space-y-3 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="block text-xs font-medium text-slate-400 font-mono">
                7. PROJECT AI INTEGRATION (SELECT UP TO 2 MODELS: PRIMARY &amp; SECONDARY)
              </label>

              {/* Agent Mode Radio */}
              <div className="flex items-center gap-2 p-1 rounded-xl bg-[#131924] border border-[#1E293B]">
                {(["No AI agent", "Single Agent", "Multi-Agent"] as AgentModeType[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setAgentMode(mode)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                      agentMode === mode
                        ? "bg-purple-500/25 text-purple-300 border border-purple-500/40"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Manufacturer Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-[#131924] rounded-xl border border-[#1E293B] max-w-md">
              {(["Google", "Anthropic", "OpenAI", "DeepSeek"] as const).map((manuf) => (
                <button
                  key={manuf}
                  type="button"
                  onClick={() => setSelectedManufacturerTab(manuf)}
                  className={`flex-1 py-1 text-center text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    selectedManufacturerTab === manuf
                      ? "bg-cyan-500/20 text-cyan-300 font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {manuf}
                </button>
              ))}
            </div>

            {/* Models Catalog for Selected Manufacturer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {AI_MODELS_CATALOG.filter((m) => m.manufacturer === selectedManufacturerTab).map((model) => {
                const isSelected = selectedModels.includes(model.id);
                const isPrimary = selectedModels[0] === model.id;
                const isSecondary = selectedModels[1] === model.id;

                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => handleToggleAiModel(model.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-cyan-500/15 border-cyan-500/50 text-white shadow-sm"
                        : "bg-[#131924] border-[#1E293B] text-slate-300 hover:bg-[#1E293B]"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold flex items-center gap-1.5">
                        <span>{model.name}</span>
                        {isPrimary && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-950 text-cyan-300 font-mono border border-cyan-800">
                            Primary
                          </span>
                        )}
                        {isSecondary && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-950 text-purple-300 font-mono border border-purple-800">
                            Failover
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {model.badge}
                      </span>
                    </div>

                    <span className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-cyan-400 border-cyan-400 text-black" : "border-slate-600"
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 8. PROJECT DESCRIPTION & SPECIFICATIONS + WAND BUTTON & VOICE TYPING */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <label
              htmlFor="project-description-textarea"
              className="block text-xs font-medium text-slate-400 font-mono"
            >
              8. PROJECT DESCRIPTION &amp; SPECIFICATIONS
            </label>

            {/* Action Bar: Wand Auto-Improve + Voice Typing */}
            <div className="flex items-center gap-2">
              {/* WAND AUTO-IMPROVE BUTTON */}
              <button
                type="button"
                onClick={handleAutoImprove}
                disabled={isImprovingPrompt}
                title="Automatically expand your rough idea into a complete, high-context SDLC specification"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-semibold text-white shadow-md shadow-purple-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isImprovingPrompt ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Expanding Context...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5 text-purple-200" />
                    <span>Auto-Improve Specs (Wand)</span>
                  </>
                )}
              </button>

              {/* VOICE TYPING BUTTON */}
              <button
                type="button"
                onClick={toggleVoiceTyping}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isListening
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse shadow-sm shadow-rose-500/30"
                    : "bg-[#1E293B] text-slate-300 hover:text-white hover:bg-[#334155] border border-[#334155]"
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5 text-rose-400" />
                    <span>Listening...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Voice Typing</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className={`relative rounded-2xl bg-[#131924] border transition-all overflow-hidden p-1 ${
            isListening ? "border-rose-500/60 ring-2 ring-rose-500/20" : "border-[#1E293B] focus-within:border-[#06B6D4]"
          }`}>
            <textarea
              id="project-description-textarea"
              required
              rows={7}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Describe what you want to build. You can provide a brief summary and click 'Auto-Improve Specs (Wand)' above to generate full technical requirements, or type a comprehensive brief."
              className="w-full p-3.5 bg-transparent text-sm text-white placeholder-slate-500 resize-none focus:outline-none leading-relaxed font-sans"
            />

            {/* Bottom Bar inside Textarea container */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-2 bg-[#0B0F17]/60 border-t border-[#1E293B]/60 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>
                  {isListening ? (
                    <span className="text-rose-400 font-mono">Listening to your voice... speak now</span>
                  ) : (
                    "8 Google ADK Agents configured & ready to deploy"
                  )}
                </span>
              </div>

              <button
                id="deploy-ai-agents-btn"
                type="submit"
                disabled={isLoading || !promptText.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] hover:opacity-95 text-white font-medium text-sm transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
              >
                <span>Deploy AI Agents</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Suggested Inspiration Templates */}
      <div className="space-y-2 pt-1">
        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
          Or start with a curated enterprise blueprint:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SAMPLE_BLUEPRINTS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(item)}
              className="text-left p-3.5 rounded-xl bg-[#131924]/60 hover:bg-[#131924] border border-[#1E293B] hover:border-cyan-500/40 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#0B0F17] text-slate-300 border border-[#1E293B]">
                    {item.type}
                  </span>
                </div>
                <Zap className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>
              <p className="text-[12px] text-slate-400 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
