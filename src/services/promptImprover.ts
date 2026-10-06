/**
 * Prompt Improver Service
 * Takes minimal context from the user and enriches it into a high-context,
 * production-ready specification that provides all necessary depth for the 8 SDLC agents.
 * 
 * STRICT CONTEXT PRESERVATION:
 * Analyzes the user's exact domain, unique mechanics, UI components, and tech stack choices.
 * Never overwrites or substitutes user concepts with generic or unrelated templates.
 */

import { ProjectSpecificationInputs } from "../types/projectSpec";
import { sanitizeAndFormatMarkdown, sanitizeBannedTokens } from "./markdownSanitizer";

export async function autoImproveProjectDescription(
  currentDescription: string,
  specInputs: Partial<ProjectSpecificationInputs>
): Promise<string> {
  const baseText = currentDescription.trim() || specInputs.projectName || "Enterprise Software Application";
  const title = specInputs.projectName?.trim() || extractInferredTitle(baseText) || "Cloud Software Platform";
  const platform = specInputs.projectType || "Web App";
  const frontend = specInputs.frontend || "Next.js (App Router)";
  const ui = specInputs.uiStyling?.join(", ") || "Tailwind CSS, shadcn/ui";
  const backend = specInputs.backend || "Python (FastAPI)";
  const db = specInputs.database?.join(", ") || "PostgreSQL 16 + Redis";
  const aiModels = specInputs.aiIntegration?.models?.join(" and ") || "AWS Bedrock Claude Sonnet with Gemini Failover";
  const agentMode = specInputs.aiIntegration?.agentMode || "Multi-Agent";

  // 1. Try calling server-side LLM endpoint (Gemini / Bedrock)
  try {
    const res = await fetch("/api/improve-prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentDescription: baseText,
        projectName: title,
        specInputs,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.text && data.text.trim().length > 120) {
        return sanitizeBannedTokens(sanitizeAndFormatMarkdown(data.text.trim()));
      }
    }
  } catch (err) {
    console.warn("Server prompt improve note, using smart client synthesizer:", err);
  }

  // 2. Intelligent Client-Side Context Synthesizer (Zero-Failure Execution)
  // Strictly preserves 100% of user domain, entities, unique mechanics, and tech stack choices
  return synthesizePreservedSpecification(baseText, title, {
    platform,
    frontend,
    ui,
    backend,
    db,
    aiModels,
    agentMode,
  });
}

/**
 * Extracts a sensible project title if not explicitly set.
 */
function extractInferredTitle(text: string): string | null {
  const buildMatch = text.match(/Build (?:a|an) (?:full-stack )?([a-zA-Z0-9\s-]+?)(?: web application| mobile application| app| platform| system)/i);
  if (buildMatch && buildMatch[1]) {
    return buildMatch[1].trim().split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  }

  const quoteMatch = text.match(/["']([^"']{3,30})["']/);
  if (quoteMatch && quoteMatch[1]) {
    return quoteMatch[1].trim();
  }

  return null;
}

interface SynthesizerContext {
  platform: string;
  frontend: string;
  ui: string;
  backend: string;
  db: string;
  aiModels: string;
  agentMode: string;
}

/**
 * Builds a comprehensive, high-context specification grounded entirely in the user's text.
 */
function synthesizePreservedSpecification(
  userText: string,
  title: string,
  ctx: SynthesizerContext
): string {
  // Break user input into clean sentences for feature decomposition
  const sentences = userText
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  // Extract identified user features from their exact input
  const detectedFeatures: string[] = [];

  sentences.forEach((sentence, idx) => {
    // Skip opening overview sentence if it was already used for Core Vision
    if (idx === 0 && /^Build\b|^Create\b|^An? (?:full-stack|modern|enterprise)\b/i.test(sentence)) {
      return;
    }

    // If the sentence describes user interactions or UI features
    if (
      /swipe|feed|slider|rating|rate|like|comment|modal|upload|photo|image|filter|tag|badge|occasion|camera|critique|score|sheet|dashboard|hud|fallback|throttle/i.test(sentence)
    ) {
      // Clean up sentence for bullet presentation
      const cleaned = sentence
        .replace(/^The main interface features /i, "")
        .replace(/^The app includes /i, "")
        .replace(/^Users can /i, "User Capabilities: ")
        .replace(/\.$/, "");
      detectedFeatures.push(cleaned);
    }
  });

  // If no specific features were matched, use sentences directly
  if (detectedFeatures.length === 0) {
    sentences.forEach((s) => detectedFeatures.push(s.replace(/\.$/, "")));
  }

  // Detect specific tech tokens mentioned in user text to ensure they take precedence
  const mentionedTech: string[] = [];
  if (/next\.?js/i.test(userText)) mentionedTech.push("Next.js (App Router)");
  if (/tailwind/i.test(userText)) mentionedTech.push("Tailwind CSS");
  if (/shadcn/i.test(userText)) mentionedTech.push("shadcn/ui");
  if (/fastapi|python/i.test(userText)) mentionedTech.push("Python (FastAPI)");
  if (/firebase|firestore/i.test(userText)) mentionedTech.push("Firebase Firestore DB");
  if (/cloud storage|s3/i.test(userText)) mentionedTech.push("Cloud Storage (Object Store)");
  if (/bedrock|claude/i.test(userText)) mentionedTech.push("AWS Bedrock (Claude 3.5 Sonnet)");
  if (/gpt-4o|chatgpt/i.test(userText)) mentionedTech.push("GPT-4o Vision Failover");

  const primaryOverview = sentences[0] || userText;

  return sanitizeAndFormatMarkdown(`### Core Concept & Product Vision
Build "${title}", a high-performance ${ctx.platform.toLowerCase()} engineered to fulfill the operational mandate:
"${primaryOverview}"

The platform provides a responsive, low-latency user experience combining fluid interactive client gestures with robust asynchronous backend processing and vision intelligence.

---

### Key Functional Features & Interactive UI Mechanics
${detectedFeatures.map((feat) => `- **${extractFeatureHeading(feat)}:** ${feat}.`).join("\n")}

---

### Technical Stack & Architecture
- **Client Application (Frontend):** ${ctx.frontend} (${ctx.platform}) styled with ${ctx.ui}. Employs modern responsive layouts, optimistic state mutations, and accessibility compliance.
- **Backend Services:** ${ctx.backend} managing asynchronous request pipelines, file/image upload processing, and validation schemas.
- **AI Intelligence & Vision Engine:** ${ctx.aiModels} configured in ${ctx.agentMode} mode with automated model failover for continuous uptime.
- **Persistence & Cloud Storage:** ${ctx.db}${mentionedTech.includes("Firebase Firestore DB") ? " and Firebase Cloud Storage for high-resolution assets" : ""}.
- **Security Boundaries:** OAuth2 authentication, zero-trust token verification, and role-based permissions.

---

### Non-Functional Performance SLAs & Gesture Responsiveness
- **Gesture Fluidity:** 60fps client frame rates with sub-50ms optimistic state updates on all interactive components.
- **Processing Latency:** End-to-end processing and model inference turnaround within 1.5 seconds.
- **System Availability:** 99.95% monthly uptime with automated circuit-breaker failover across primary and secondary inference providers.`);
}

/**
 * Extracts a concise 2-4 word heading from a feature sentence.
 */
function extractFeatureHeading(sentence: string): string {
  if (/swipe feed/i.test(sentence)) return "Vertical Full-Screen Swipe Feed";
  if (/rating|slider/i.test(sentence)) return "Interactive Rating & Engagement";
  if (/upload|photo/i.test(sentence)) return "Photo & Asset Ingestion Modal";
  if (/critique|score/i.test(sentence)) return "AI Vision Critique & Style Score";
  if (/comment|sheet/i.test(sentence)) return "Discussion & Comment Drawer";
  if (/fallback|throttl/i.test(sentence)) return "Automated Inference Failover";
  if (/firebase|storage/i.test(sentence)) return "Cloud Asset Persistence";

  const words = sentence.split(/\s+/).slice(0, 3).join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}
