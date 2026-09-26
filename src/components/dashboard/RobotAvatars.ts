/**
 * High-fidelity Cute Humanoid Robot Stock Avatars for SDLC Scrum Agents
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
  agent_01: {
    id: "agent_01",
    name: "Product Owner Bot",
    primaryColor: "#06B6D4", // Cyan
    accentColor: "#3B82F6",
    antennaType: "beacon",
    expression: "visionary",
    accessory: "Executive Hologram Pad",
  },
  agent_02: {
    id: "agent_02",
    name: "Software Analyst Bot",
    primaryColor: "#8B5CF6", // Purple
    accentColor: "#A855F7",
    antennaType: "radar",
    expression: "analytical",
    accessory: "Neural Data Monocle",
  },
  agent_03: {
    id: "agent_03",
    name: "UI Lead Bot",
    primaryColor: "#EC4899", // Pink
    accentColor: "#F43F5E",
    antennaType: "halo",
    expression: "creative",
    accessory: "Vector Prism Visor",
  },
  agent_04: {
    id: "agent_04",
    name: "Backend Lead Bot",
    primaryColor: "#10B981", // Emerald
    accentColor: "#14B8A6",
    antennaType: "sensor",
    expression: "focused",
    accessory: "Database Quantum Core",
  },
  agent_05: {
    id: "agent_05",
    name: "Full Stack Bot",
    primaryColor: "#F59E0B", // Amber
    accentColor: "#EAB308",
    antennaType: "dual",
    expression: "smiling",
    accessory: "Multi-Tool Cyber Wrench",
  },
  agent_06: {
    id: "agent_06",
    name: "Infra Architect Bot",
    primaryColor: "#3B82F6", // Blue
    accentColor: "#6366F1",
    antennaType: "dish",
    expression: "determined",
    accessory: "Cloud Gateway Thrusters",
  },
  agent_07: {
    id: "agent_07",
    name: "Scrum Master Bot",
    primaryColor: "#6366F1", // Indigo
    accentColor: "#8B5CF6",
    antennaType: "crown",
    expression: "commanding",
    accessory: "Sprint Conductor Scepter",
  },
};
