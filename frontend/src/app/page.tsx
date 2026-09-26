"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Zap, Users, Code, Sparkles, Shield, Cpu, Terminal } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#0B0F17] text-white flex flex-col justify-between overflow-hidden selection:bg-cyan-500/20">
      {/* Top Navbar */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#06B6D4] to-[#3B82F6] p-[1px]">
            <div className="w-full h-full bg-[#131924] rounded-[11px] flex items-center justify-center">
              <img
                src="/logo.svg"
                alt="Digitano Logo"
                width={20}
                height={20}
                className="w-5 h-5"
              />
            </div>
          </div>
          <span className="font-bold text-lg tracking-tight">Digitano Builder</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:opacity-95 transition-opacity"
          >
            Launch Studio
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-20 flex flex-col items-center text-center">
        {/* Top Tag Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-xs font-mono text-cyan-300 mb-8 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Autonomous Multi-Agent SDLC Engine</span>
        </div>

        {/* Hero Title */}
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
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] hover:opacity-95 text-white font-semibold text-sm transition-all shadow-xl shadow-cyan-500/25 cursor-pointer transform hover:-translate-y-0.5"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

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
        <div className="mt-28 w-full">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-3">
            CORE CAPABILITIES
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Everything you need to ship faster
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto mb-14 leading-relaxed">
            A purpose-built multi-agent engine that transforms how teams approach the
            software development lifecycle — from idea to deployment.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Card 1 */}
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

            {/* Card 2 */}
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

            {/* Card 3 */}
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
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span>Start building with Digitano</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-[#1E293B]/80 py-6 px-6 text-center text-xs text-slate-500">
        <p>Digitano Builder &copy; 2026. Autonomous SDLC Engine. AWS Bedrock &amp; Google Gemini Failover.</p>
      </footer>
    </div>
  );
}
