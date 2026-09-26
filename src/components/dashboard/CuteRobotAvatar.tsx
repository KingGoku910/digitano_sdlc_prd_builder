import React from "react";

interface CuteRobotAvatarProps {
  agentId: string;
  size?: number;
  className?: string;
  isThinking?: boolean;
}

export const CuteRobotAvatar: React.FC<CuteRobotAvatarProps> = ({
  agentId,
  size = 48,
  className = "",
  isThinking = false,
}) => {
  // Color themes per agent
  const palette: Record<
    string,
    { head: string; visor: string; eye: string; glow: string; detail: string }
  > = {
    agent_01: {
      head: "#0F2838",
      visor: "#06B6D4",
      eye: "#38BDF8",
      glow: "#06B6D4",
      detail: "#22D3EE",
    }, // Product Owner
    agent_02: {
      head: "#241838",
      visor: "#8B5CF6",
      eye: "#C084FC",
      glow: "#A855F7",
      detail: "#E879F9",
    }, // Software Analyst
    agent_03: {
      head: "#331626",
      visor: "#EC4899",
      eye: "#F472B6",
      glow: "#F43F5E",
      detail: "#FB7185",
    }, // UI Lead
    agent_04: {
      head: "#0E2B22",
      visor: "#10B981",
      eye: "#34D399",
      glow: "#059669",
      detail: "#6EE7B7",
    }, // Backend Lead
    agent_05: {
      head: "#2D200E",
      visor: "#F59E0B",
      eye: "#FBBF24",
      glow: "#D97706",
      detail: "#FDE047",
    }, // Full Stack
    agent_06: {
      head: "#11223E",
      visor: "#3B82F6",
      eye: "#60A5FA",
      glow: "#2563EB",
      detail: "#93C5FD",
    }, // Infra Architect
    agent_07: {
      head: "#1E183E",
      visor: "#6366F1",
      eye: "#818CF8",
      glow: "#4F46E5",
      detail: "#A5B4FC",
    }, // Scrum Master
  };

  const theme = palette[agentId] || palette.agent_01;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-2xl overflow-hidden p-1 bg-[#0B0F17] border border-[#1E293B] shadow-inner ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full ${isThinking ? "animate-pulse" : ""}`}
      >
        <defs>
          <radialGradient id={`glow-${agentId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={theme.glow} stopOpacity="0.8" />
            <stop offset="100%" stopColor={theme.glow} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`grad-${agentId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.visor} />
            <stop offset="100%" stopColor={theme.detail} />
          </linearGradient>
        </defs>

        {/* Ambient Halo Glow */}
        <circle cx="50" cy="50" r="44" fill={`url(#glow-${agentId})`} opacity="0.4" />

        {/* Antenna / Sensor */}
        {agentId === "agent_01" && (
          <g>
            <line x1="50" y1="18" x2="50" y2="8" stroke={theme.visor} strokeWidth="3" strokeLinecap="round" />
            <circle cx="50" cy="8" r="4.5" fill={theme.eye} />
          </g>
        )}
        {agentId === "agent_02" && (
          <g>
            <line x1="42" y1="18" x2="35" y2="8" stroke={theme.visor} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="35" cy="8" r="3.5" fill={theme.eye} />
            <line x1="58" y1="18" x2="65" y2="8" stroke={theme.visor} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="65" cy="8" r="3.5" fill={theme.eye} />
          </g>
        )}
        {agentId === "agent_03" && (
          <g>
            <ellipse cx="50" cy="12" rx="14" ry="5" stroke={theme.detail} strokeWidth="2.5" fill="none" />
          </g>
        )}
        {agentId === "agent_04" && (
          <g>
            <rect x="46" y="8" width="8" height="10" rx="3" fill={theme.visor} />
            <circle cx="50" cy="13" r="2" fill="#FFFFFF" />
          </g>
        )}
        {agentId === "agent_05" && (
          <g>
            <path d="M40 18 L34 10 M60 18 L66 10" stroke={theme.visor} strokeWidth="3" strokeLinecap="round" />
            <rect x="31" y="6" width="6" height="6" rx="2" fill={theme.eye} />
            <rect x="63" y="6" width="6" height="6" rx="2" fill={theme.eye} />
          </g>
        )}
        {agentId === "agent_06" && (
          <g>
            <path d="M42 12 Q50 6 58 12" stroke={theme.detail} strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle cx="50" cy="14" r="3.5" fill={theme.eye} />
          </g>
        )}
        {agentId === "agent_07" && (
          <g>
            <polygon points="40,16 45,8 50,14 55,8 60,16" fill={theme.visor} />
            <circle cx="50" cy="6" r="2" fill="#FFFFFF" />
          </g>
        )}

        {/* Robot Ears / Side Sensors */}
        <rect x="14" y="38" width="6" height="18" rx="3" fill={theme.head} stroke={theme.visor} strokeWidth="1.5" />
        <rect x="80" y="38" width="6" height="18" rx="3" fill={theme.head} stroke={theme.visor} strokeWidth="1.5" />

        {/* Humanoid Robot Head (Curved Chassis) */}
        <rect
          x="20"
          y="20"
          width="60"
          height="54"
          rx="18"
          fill={theme.head}
          stroke="#1E293B"
          strokeWidth="2"
        />

        {/* Glossy Visor Screen */}
        <rect
          x="26"
          y="30"
          width="48"
          height="28"
          rx="10"
          fill="#050811"
          stroke={theme.visor}
          strokeWidth="1.5"
        />

        {/* Cute Expressive Glowing Eyes */}
        <ellipse cx="38" cy="43" rx="5" ry="6.5" fill={theme.eye} />
        <circle cx="36.5" cy="40.5" r="2" fill="#FFFFFF" />
        
        <ellipse cx="62" cy="43" rx="5" ry="6.5" fill={theme.eye} />
        <circle cx="60.5" cy="40.5" r="2" fill="#FFFFFF" />

        {/* Cute Blushing Cheeks */}
        <circle cx="31" cy="52" r="3.5" fill={theme.detail} opacity="0.6" />
        <circle cx="69" cy="52" r="3.5" fill={theme.detail} opacity="0.6" />

        {/* Robot Smile / Screen Display */}
        <path
          d="M44 51 Q50 56 56 51"
          stroke={theme.eye}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Chassis Neck & Shoulders */}
        <rect x="42" y="74" width="16" height="6" rx="2" fill="#131924" stroke="#1E293B" />
        <path
          d="M26 80 Q50 78 74 80 L84 94 Q50 96 16 94 Z"
          fill={theme.head}
          stroke="#1E293B"
          strokeWidth="1.5"
        />
        {/* Core Chest Indicator */}
        <circle cx="50" cy="87" r="3.5" fill={`url(#grad-${agentId})`} />
      </svg>
    </div>
  );
};
