"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, ArrowRight, Bot, Zap, Mic, MicOff, Volume2 } from "lucide-react";

interface ProjectBriefInputProps {
  onSubmit: (prompt: string, title: string) => void;
  isLoading?: boolean;
}

const SAMPLE_PROMPTS = [
  {
    title: "E-Commerce Platform",
    prompt:
      "Build an e-commerce platform with product catalog, shopping cart, Stripe checkout, and an admin dashboard for inventory management. Use Next.js for the frontend and FastAPI for the backend.",
  },
  {
    title: "Healthcare Patient Portal",
    prompt:
      "Create a HIPAA-compliant telehealth patient portal with appointment booking, doctor chat, encrypted medical records storage in DynamoDB, and automated reminder notifications.",
  },
  {
    title: "Fintech Ledger & KYC",
    prompt:
      "Build a modern fintech double-entry ledger platform with multi-currency wallets, instant P2P transfers, KYC identity verification hooks, and real-time fraud alert streaming.",
  },
  {
    title: "DevOps Monitoring Agent",
    prompt:
      "Design an autonomous cloud infrastructure monitoring agent that detects latency spikes, alerts via webhooks, and auto-scales container tasks using AWS Lambda and ECS.",
  },
];

export function ProjectBriefInput({ onSubmit, isLoading = false }: ProjectBriefInputProps) {
  const [projectTitle, setProjectTitle] = useState("");
  const [promptText, setPromptText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Initialize SpeechRecognition if available in browser
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
      alert("Voice typing is not supported in this browser. Please use Chrome, Edge, or Safari.");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    if (!promptText.trim()) return;
    const finalTitle = projectTitle.trim() || promptText.slice(0, 35).trim() + "...";
    onSubmit(promptText, finalTitle);
  };

  const handleSelectSample = (sample: { title: string; prompt: string }) => {
    setProjectTitle(sample.title);
    setPromptText(sample.prompt);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Phase Badge & Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-xs font-mono text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Engine — Phase 1: Project Brief</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/40 text-[11px] font-mono text-purple-300">
            <Zap className="w-3 h-3 text-purple-400" />
            <span>Primary: AWS Bedrock (Claude 3.5 Sonnet)</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-[11px] font-mono text-emerald-300">
            <Volume2 className="w-3 h-3 text-emerald-400" />
            <span>Voice Typing Enabled</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Describe your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06B6D4] to-[#3B82F6]">project vision</span>
        </h1>

        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          Enter a brief description or use Voice Typing. The autonomous 7-agent team will generate a PRD,
          database schema, API contracts, and Vibe-Coder prompts using AWS Bedrock with Gemini 3.8 Flash failover.
        </p>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Project Name (Optional) */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 font-mono">
            PROJECT NAME (OPTIONAL)
          </label>
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            placeholder="e.g. NextGen E-Commerce MVP"
            className="w-full px-4 py-2.5 bg-[#131924] border border-[#1E293B] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4] transition-all"
          />
        </div>

        {/* Textarea with Voice Typing Integration */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="project-description-textarea"
              className="block text-xs font-medium text-slate-400 font-mono"
            >
              PROJECT DESCRIPTION & SPECIFICATIONS
            </label>

            {/* Voice Typing Action Trigger */}
            <button
              type="button"
              onClick={toggleVoiceTyping}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isListening
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse shadow-sm shadow-rose-500/30"
                  : "bg-[#1E293B] text-slate-300 hover:text-white hover:bg-[#334155] border border-[#334155]"
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5 text-rose-400" />
                  <span>Listening... Tap to Stop</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Voice Typing</span>
                </>
              )}
            </button>
          </div>

          <div className={`relative rounded-2xl bg-[#131924] border transition-all overflow-hidden p-1 ${
            isListening ? "border-rose-500/60 ring-2 ring-rose-500/20" : "border-[#1E293B] focus-within:border-[#06B6D4]"
          }`}>
            <textarea
              id="project-description-textarea"
              required
              rows={5}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Example: Build an e-commerce platform with product catalog, shopping cart, Stripe checkout, and an admin dashboard for inventory management. Use Next.js for the frontend and FastAPI for the backend."
              className="w-full p-3 bg-transparent text-sm text-white placeholder-slate-500 resize-none focus:outline-none leading-relaxed"
            />

            {/* Bottom Bar inside Textarea container */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-2 bg-[#0B0F17]/60 border-t border-[#1E293B]/60 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>
                  {isListening ? (
                    <span className="text-rose-400 font-mono">Listening to your voice... speak now</span>
                  ) : (
                    "7 AI Agents ready to deploy"
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
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
        </div>
      </form>

      {/* Suggested Inspiration Templates */}
      <div className="space-y-2 pt-2">
        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
          Or start with a curated blueprint:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SAMPLE_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(item)}
              className="text-left p-3.5 rounded-xl bg-[#131924]/60 hover:bg-[#131924] border border-[#1E293B] hover:border-cyan-500/40 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </span>
                <Zap className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>
              <p className="text-[12px] text-slate-400 line-clamp-2 leading-relaxed">
                {item.prompt}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
