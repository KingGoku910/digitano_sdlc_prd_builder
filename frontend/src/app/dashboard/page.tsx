"use client";

import React, { useState } from "react";
import { Sidebar } from "../../components/navigation/Sidebar";
import { TopNavbar } from "../../components/navigation/TopNavbar";
import { ProjectBriefInput } from "../../components/dashboard/ProjectBriefInput";
import { AgentProgressTracker, AgentState } from "../../components/dashboard/AgentProgressTracker";
import { ArtifactViewer, ArtifactData } from "../../components/dashboard/ArtifactViewer";

const INITIAL_AGENTS: AgentState[] = [
  { id: "agent_01", name: "Product Owner", tag: "PO", number: "Agent 01", role: "Scope & User Stories", status: "pending", logs: [] },
  { id: "agent_02", name: "Software Analyst", tag: "SA", number: "Agent 02", role: "System Architecture & Constraints", status: "pending", logs: [] },
  { id: "agent_03", name: "UI Lead", tag: "UI", number: "Agent 03", role: "Tailwind Design System & Tokens", status: "pending", logs: [] },
  { id: "agent_04", name: "Backend Lead", tag: "BE", number: "Agent 04", role: "FastAPI Endpoints & DynamoDB", status: "pending", logs: [] },
  { id: "agent_05", name: "Full Stack", tag: "FS", number: "Agent 05", role: "React Hooks & State Flow", status: "pending", logs: [] },
  { id: "agent_06", name: "Infra Architect", tag: "IA", number: "Agent 06", role: "AWS Serverless IaC & Render", status: "pending", logs: [] },
  { id: "agent_07", name: "Scrum Master", tag: "SM", number: "Agent 07", role: "Consolidated PRD & Vibe Prompts", status: "pending", logs: [] },
];

export default function DashboardPage() {
  const [currentTab, setCurrentTab] = useState("new_project");
  const [agents, setAgents] = useState<AgentState[]>(INITIAL_AGENTS);
  const [completedCount, setCompletedCount] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [artifacts, setArtifacts] = useState<ArtifactData | null>(null);
  const [currentProjectTitle, setCurrentProjectTitle] = useState("");

  const handleStartProject = async (prompt: string, title: string) => {
    setCurrentProjectTitle(title);
    setIsExecuting(true);
    setIsFinished(false);
    setArtifacts(null);
    setCompletedCount(0);
    // Reset agents to initial
    setAgents(INITIAL_AGENTS.map((a) => ({ ...a, status: "pending", logs: [] })));
  };

  const handleReset = () => {
    setIsExecuting(false);
    setIsFinished(false);
    setArtifacts(null);
    setCompletedCount(0);
    setAgents(INITIAL_AGENTS.map((a) => ({ ...a, status: "pending", logs: [] })));
  };

  return (
    <div className="flex h-screen bg-[#0B0F17] text-white overflow-hidden selection:bg-cyan-500/20">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopNavbar currentProjectTitle={currentProjectTitle} />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          {!isExecuting && !isFinished ? (
            <ProjectBriefInput onSubmit={handleStartProject} isLoading={isExecuting} />
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
                />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
