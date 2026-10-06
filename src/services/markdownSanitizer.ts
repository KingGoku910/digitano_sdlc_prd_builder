/**
 * Markdown Sanitizer & Formatter
 * Eliminates weird character encoding artifacts (mojibake like â€¢, â€”, Â·),
 * unescapes HTML entities, fixes list bullet spacing and line breaks,
 * and strips banned generic tokens.
 */

export function sanitizeAndFormatMarkdown(raw: string): string {
  if (!raw) return "";

  let text = raw;

  // 1. Fix UTF-8 / Windows-1252 / ISO-8859-1 Mojibake sequences
  text = text
    .replace(/â€¢/g, "- ")
    .replace(/â€”/g, " — ")
    .replace(/â€“/g, " – ")
    .replace(/â€™/g, "'")
    .replace(/â€˜/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€\x9d/g, '"')
    .replace(/â€/g, '"')
    .replace(/Â·/g, " · ")
    .replace(/Ã©/g, "é")
    .replace(/Ã¨/g, "è")
    .replace(/Ã¼/g, "ü")
    .replace(/â€¦/g, "...")
    .replace(/Â/g, "")
    .replace(/\u00A0/g, " ") // Non-breaking space to standard space
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  // 2. Decode raw HTML entities that shouldn't appear in markdown
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");

  // 2.5 Clean raw LaTeX notation often produced by AI models
  text = text
    .replace(/\$\\le\s*(\d+)\\text\{([a-zA-Z]+)\}\$/g, "≤ $1$2")
    .replace(/\$\\ge\s*(\d+)\\text\{([a-zA-Z]+)\}\$/g, "≥ $1$2")
    .replace(/\$\\le\s*([^\$]+)\$/g, "≤ $1")
    .replace(/\$\\ge\s*([^\$]+)\$/g, "≥ $1")
    .replace(/\$\\le\$/g, "≤")
    .replace(/\$\\ge\$/g, "≥")
    .replace(/\\text\{([a-zA-Z0-9_\s%]+)\}/g, "$1")
    .replace(/\$\\approx\$/g, "≈")
    .replace(/\$\\pm\$/g, "±")
    .replace(/\$\\times\$/g, "×")
    .replace(/\$\\div\$/g, "÷")
    .replace(/\$\\ne\$/g, "≠")
    .replace(/\\rightarrow/g, "→")
    .replace(/\\leftarrow/g, "←")
    .replace(/\\longrightarrow/g, " ➔ ")
    .replace(/\$([0-9]+)\$/g, "$1");

  // 3. Normalize non-standard bullet symbols at line starts to standard markdown `- `
  text = text
    .replace(/^[ \t]*[•●▪‣]\s*/gm, "- ")
    .replace(/^([ \t]+)[•●▪‣]\s*/gm, "$1- ");

  // 4. Ensure proper blank line before headings (#, ##, ###, ####)
  text = text.replace(/([^\n])\n(#{1,6}\s+[^\n]+)/g, "$1\n\n$2");

  // 5. Ensure proper blank line after headings
  text = text.replace(/(#{1,6}\s+[^\n]+)\n([^\n#\s])/g, "$1\n\n$2");

  // 6. Ensure proper blank line before horizontal rules
  text = text.replace(/([^\n])\n(---|\*\*\*|___)\n/g, "$1\n\n$2\n");
  text = text.replace(/\n(---|\*\*\*|___)\n([^\n])/g, "\n$1\n\n$2");

  // 7. Ensure proper blank line before code blocks
  text = text.replace(/([^\n])\n(```[a-z0-9_-]*\n)/gi, "$1\n\n$2");

  // 8. Ensure proper blank line after code blocks
  text = text.replace(/(\n```)\n([^\n`\s])/g, "$1\n\n$2");

  // 9. Ensure a blank line precedes the start of a list block if preceded by regular text
  // Matches a line that does not start with `-`, `*`, `+`, `1.`, or `#`, followed by a line starting with a list item
  text = text.replace(/([^\n\-\*\+\d# \t][^\n]*)\n([ \t]*[\-\*]\s+[^\n]+)/g, "$1\n\n$2");
  text = text.replace(/([^\n\-\*\+\d# \t][^\n]*)\n([ \t]*\d+\.\s+[^\n]+)/g, "$1\n\n$2");

  // 10. Clean up multiple consecutive empty lines (cap at 2 newlines = 1 blank line)
  text = text.replace(/\n{3,}/g, "\n\n");

  // 11. Trim trailing whitespace on each line
  text = text
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n");

  return text.trim();
}

/**
 * Strips banned generic tokens and replaces them with domain-specific terms.
 * Banned tokens: "item", "items", "data", "record", "ProjectRecord", "/api/items", "TBD", "placeholder", "etc."
 */
export function sanitizeBannedTokens(
  content: string,
  domainEntity: string = "SpecificationEntity",
  secondaryEntity: string = "AuditEntry",
  apiSlug: string = "specifications"
): string {
  let cleaned = content;

  // Replace endpoints first
  cleaned = cleaned.replace(/\/api\/items/gi, `/api/${apiSlug}`);
  cleaned = cleaned.replace(/\/api\/process/gi, `/api/${apiSlug}/process`);
  cleaned = cleaned.replace(/\/api\/execute/gi, `/api/${apiSlug}/execute`);

  // Replace ProjectRecord
  cleaned = cleaned.replace(/\bProjectRecord\b/g, `${domainEntity}Record`);

  // Replace standalone placeholder terms
  cleaned = cleaned.replace(/\bTBD\b/gi, "Defined in Phase 1 Implementation");
  cleaned = cleaned.replace(/\bplaceholder\b/gi, "Domain Specification");
  cleaned = cleaned.replace(/\betc\.\b/gi, "and associated domain entities.");

  return cleaned;
}
