/**
 * High-fidelity Cute Humanoid Robot Stock Avatars for Google ADK Agents
 * Clean SVG avatar definitions representing each agent's specialized role.
 */

export interface RobotAvatarInfo {
  id: string;
  name: string;
  primaryColor: string;
  accentColor: string;
  antennaType: "radar" | "halo" | "crown" | "sensor" | "dish" | "dual" | "beacon";
  expression: "smiling" | "focused" | "creative" | "analytical" | "determined" | "visionary" | "commanding";
  accessory: string;
}

export const AGENT_ROBOT_PROFILES: Record<string, RobotAvatarInfo> = {
  researcher_agent: {
    id: "researcher_agent",
    name: "Technical Researcher Bot",
    primaryColor: "#06B6D4", // Cyan
    accentColor: "#3B82F6",
    antennaType: "radar",
    expression: "analytical",
    accessory: "MCP GoogleSearch Scanner",
  },
  agent_1_vision: {
    id: "agent_1_vision",
    name: "Vision & Scope Bot",
    primaryColor: "#3B82F6", // Blue
    accentColor: "#6366F1",
    antennaType: "beacon",
    expression: "visionary",
    accessory: "Product Scope Hologram",
  },
  agent_2_requirements: {
    id: "agent_2_requirements",
    name: "Requirements Engineer Bot",
    primaryColor: "#8B5CF6", // Purple
    accentColor: "#A855F7",
    antennaType: "sensor",
    expression: "focused",
    accessory: "Gherkin Acceptance Matrix",
  },
  agent_3_architecture: {
    id: "agent_3_architecture",
    name: "Systems Architect Bot",
    primaryColor: "#10B981", // Emerald
    accentColor: "#14B8A6",
    antennaType: "dish",
    expression: "determined",
    accessory: "PostgreSQL DDL Core",
  },
  agent_4_uiux: {
    id: "agent_4_uiux",
    name: "UX/UI Designer Bot",
    primaryColor: "#EC4899", // Pink
    accentColor: "#F43F5E",
    antennaType: "halo",
    expression: "creative",
    accessory: "4-State Canvas Visor",
  },
  agent_5_risks: {
    id: "agent_5_risks",
    name: "Risk & Compliance Bot",
    primaryColor: "#EF4444", // Red/Rose
    accentColor: "#F97316",
    antennaType: "dual",
    expression: "determined",
    accessory: "Zero-Trust Encryption Shield",
  },
  agent_6_metrics: {
    id: "agent_6_metrics",
    name: "Telemetry Strategist Bot",
    primaryColor: "#F59E0B", // Amber
    accentColor: "#EAB308",
    antennaType: "beacon",
    expression: "analytical",
    accessory: "KPI Telemetry Gauge",
  },
  orchestrator_agent: {
    id: "orchestrator_agent",
    name: "Master Orchestrator Bot",
    primaryColor: "#6366F1", // Indigo
    accentColor: "#8B5CF6",
    antennaType: "crown",
    expression: "commanding",
    accessory: "Quality Gatekeeper Crown",
  },

  // Aliases for backward compatibility
  agent_01: {
    id: "agent_01",
    name: "Vision & Scope Bot",
    primaryColor: "#3B82F6",
    accentColor: "#6366F1",
    antennaType: "beacon",
    expression: "visionary",
    accessory: "Product Scope Hologram",
  },
  agent_02: {
    id: "agent_02",
    name: "Requirements Bot",
    primaryColor: "#8B5CF6",
    accentColor: "#A855F7",
    antennaType: "sensor",
    expression: "focused",
    accessory: "Gherkin Acceptance Matrix",
  },
  agent_03: {
    id: "agent_03",
    name: "Systems Architect Bot",
    primaryColor: "#10B981",
    accentColor: "#14B8A6",
    antennaType: "dish",
    expression: "determined",
    accessory: "PostgreSQL DDL Core",
  },
  agent_04: {
    id: "agent_04",
    name: "UX/UI Designer Bot",
    primaryColor: "#EC4899",
    accentColor: "#F43F5E",
    antennaType: "halo",
    expression: "creative",
    accessory: "4-State Canvas Visor",
  },
  agent_05: {
    id: "agent_05",
    name: "Risk & Compliance Bot",
    primaryColor: "#EF4444",
    accentColor: "#F97316",
    antennaType: "dual",
    expression: "determined",
    accessory: "Zero-Trust Encryption Shield",
  },
  agent_06: {
    id: "agent_06",
    name: "Telemetry Strategist Bot",
    primaryColor: "#F59E0B",
    accentColor: "#EAB308",
    antennaType: "beacon",
    expression: "analytical",
    accessory: "KPI Telemetry Gauge",
  },
  agent_07: {
    id: "agent_07",
    name: "Master Orchestrator Bot",
    primaryColor: "#6366F1",
    accentColor: "#8B5CF6",
    antennaType: "crown",
    expression: "commanding",
    accessory: "Quality Gatekeeper Crown",
  },
};
