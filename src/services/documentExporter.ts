/**
 * Document Exporter Utility
 * Generates formatted Markdown (.md), Microsoft Word (.docx), and PDF (.pdf) documents
 * directly in the browser with professional typography, code formatting, and structure.
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  AlignmentType,
  ShadingType,
} from "docx";
import { jsPDF } from "jspdf";
import JSZip from "jszip";
import { sanitizeAndFormatMarkdown } from "./markdownSanitizer";

export type ExportFormat = "md" | "docx" | "pdf";

export interface ExportableFile {
  filename: string;
  title: string;
  content: string;
}

/**
 * Downloads a string as a Markdown (.md) file.
 */
export function downloadMarkdown(filename: string, content: string): void {
  const sanitized = sanitizeAndFormatMarkdown(content);
  const blob = new Blob([sanitized], { type: "text/markdown;charset=utf-8" });
  triggerBrowserDownload(blob, filename.endsWith(".md") ? filename : `${filename}.md`);
}

/**
 * Converts Markdown content into a structured Microsoft Word (.docx) document and triggers download.
 */
export async function downloadDocx(filename: string, title: string, content: string): Promise<void> {
  const blob = await generateDocxBlob(title, content);
  triggerBrowserDownload(blob, filename.endsWith(".docx") ? filename : `${filename}.docx`);
}

/**
 * Converts Markdown content into a formatted PDF (.pdf) document and triggers download.
 */
export async function downloadPdf(filename: string, title: string, content: string): Promise<void> {
  const blob = await generatePdfBlob(title, content);
  triggerBrowserDownload(blob, filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}

/**
 * Trigger browser file download from a Blob.
 */
function triggerBrowserDownload(blob: Blob, fullFilename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fullFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Generate a Microsoft Word (.docx) Blob from Markdown content.
 */
export async function generateDocxBlob(title: string, markdownContent: string): Promise<Blob> {
  const sanitized = sanitizeAndFormatMarkdown(markdownContent);
  const lines = sanitized.split("\n");

  const paragraphs: (Paragraph | Table)[] = [];

  // Title Banner
  paragraphs.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.LEFT,
      spacing: { after: 200 },
    })
  );

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Generated: ${new Date().toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })} | Autonomous SDLC Specification Suite`,
          italics: true,
          color: "64748B",
          size: 18,
        }),
      ],
      spacing: { after: 360 },
    })
  );

  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let inTable = false;
  let tableBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Check code fence
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        // End code block
        inCodeBlock = false;
        paragraphs.push(createDocxCodeBlock(codeBuffer.join("\n")));
        codeBuffer = [];
      } else {
        // Flush table if open
        if (inTable) {
          paragraphs.push(createDocxTable(tableBuffer));
          tableBuffer = [];
          inTable = false;
        }
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // Check Table
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      inTable = true;
      tableBuffer.push(trimmed);
      continue;
    } else if (inTable) {
      // End table
      inTable = false;
      paragraphs.push(createDocxTable(tableBuffer));
      tableBuffer = [];
    }

    // Empty line
    if (!trimmed) {
      continue;
    }

    // Headings
    if (trimmed.startsWith("# ")) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace(/^#\s+/, ""),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 360, after: 140 },
        })
      );
    } else if (trimmed.startsWith("## ")) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace(/^##\s+/, ""),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 280, after: 120 },
        })
      );
    } else if (trimmed.startsWith("### ")) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace(/^###\s+/, ""),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (trimmed.startsWith("#### ")) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace(/^####\s+/, ""),
          heading: HeadingLevel.HEADING_4,
          spacing: { before: 160, after: 80 },
        })
      );
    } else if (trimmed.startsWith("---") || trimmed.startsWith("***")) {
      // Horizontal Rule
      paragraphs.push(
        new Paragraph({
          border: {
            bottom: {
              color: "CBD5E1",
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
          spacing: { before: 160, after: 160 },
        })
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      // Bullet list item
      const bulletContent = trimmed.replace(/^[\-\*]\s+/, "");
      paragraphs.push(
        new Paragraph({
          children: parseInlineFormattingToDocx(bulletContent),
          bullet: { level: 0 },
          spacing: { before: 40, after: 40 },
        })
      );
    } else if (/^\d+\.\s+/.test(trimmed)) {
      // Numbered list item
      const numContent = trimmed.replace(/^\d+\.\s+/, "");
      paragraphs.push(
        new Paragraph({
          children: parseInlineFormattingToDocx(numContent),
          bullet: { level: 0 }, // fallback bullet or list
          spacing: { before: 40, after: 40 },
        })
      );
    } else {
      // Standard Paragraph
      paragraphs.push(
        new Paragraph({
          children: parseInlineFormattingToDocx(trimmed),
          spacing: { before: 80, after: 80 },
        })
      );
    }
  }

  // Flush remaining buffers
  if (inCodeBlock && codeBuffer.length > 0) {
    paragraphs.push(createDocxCodeBlock(codeBuffer.join("\n")));
  }
  if (inTable && tableBuffer.length > 0) {
    paragraphs.push(createDocxTable(tableBuffer));
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch = 1440 twips
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: paragraphs,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * Creates a styled code block in DOCX.
 */
function createDocxCodeBlock(code: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: code,
        font: "Consolas",
        size: 18, // 9pt
        color: "0F172A",
      }),
    ],
    shading: {
      type: ShadingType.SOLID,
      color: "F1F5F9",
    },
    border: {
      left: {
        color: "0284C7",
        space: 8,
        style: BorderStyle.SINGLE,
        size: 24,
      },
    },
    spacing: { before: 160, after: 160 },
  });
}

/**
 * Creates a clean styled Table in DOCX.
 */
function createDocxTable(tableLines: string[]): Table {
  const rows: TableRow[] = [];

  const parsedRows = tableLines
    .filter((l) => !/^\|[\s\-:|]+\|$/.test(l)) // Filter out separator row |---|---|
    .map((l) =>
      l
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim())
    );

  parsedRows.forEach((rowCells, rowIndex) => {
    const isHeader = rowIndex === 0;

    const cells = rowCells.map(
      (cellText) =>
        new TableCell({
          width: { size: 100 / (rowCells.length || 1), type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: cellText,
                  bold: isHeader,
                  color: isHeader ? "FFFFFF" : "1E293B",
                  size: 18, // 9pt
                }),
              ],
              spacing: { before: 60, after: 60 },
            }),
          ],
          shading: isHeader
            ? { type: ShadingType.SOLID, color: "0F172A" }
            : rowIndex % 2 === 1
            ? { type: ShadingType.SOLID, color: "F8FAFC" }
            : undefined,
          margins: { top: 100, bottom: 100, left: 140, right: 140 },
        })
    );

    rows.push(new TableRow({ children: cells }));
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
  });
}

/**
 * Parses bold, italic, and inline code formatting for DOCX.
 */
function parseInlineFormattingToDocx(text: string): TextRun[] {
  const runs: TextRun[] = [];
  // Regex to split by **bold**, *italic*, and `code`
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(regex);

  for (const part of parts) {
    if (!part) continue;

    if (part.startsWith("**") && part.endsWith("**")) {
      runs.push(
        new TextRun({
          text: part.slice(2, -2),
          bold: true,
          color: "0F172A",
          size: 21, // ~10.5pt
        })
      );
    } else if (part.startsWith("*") && part.endsWith("*")) {
      runs.push(
        new TextRun({
          text: part.slice(1, -1),
          italics: true,
          color: "334155",
          size: 21,
        })
      );
    } else if (part.startsWith("`") && part.endsWith("`")) {
      runs.push(
        new TextRun({
          text: part.slice(1, -1),
          font: "Consolas",
          color: "0284C7",
          size: 19,
        })
      );
    } else {
      runs.push(
        new TextRun({
          text: part,
          color: "1E293B",
          size: 21,
        })
      );
    }
  }

  return runs.length > 0 ? runs : [new TextRun({ text, size: 21 })];
}

/**
 * Generate a PDF Blob using jsPDF.
 */
export async function generatePdfBlob(title: string, markdownContent: string): Promise<Blob> {
  const sanitized = sanitizeAndFormatMarkdown(markdownContent);
  const lines = sanitized.split("\n");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 45;
  const maxContentWidth = pageWidth - margin * 2;
  const bottomThreshold = pageHeight - margin - 20;

  let y = margin;

  // Header Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  const titleLines = doc.splitTextToSize(title, maxContentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 22;

  // Subtitle / Date
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(
    `Generated ${new Date().toLocaleDateString()} | Google ADK + AWS Bedrock Architecture Suite`,
    margin,
    y
  );
  y += 18;

  // Horizontal line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 24;

  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let inTable = false;
  let tableBuffer: string[] = [];

  function checkPageBreak(neededHeight: number) {
    if (y + neededHeight > bottomThreshold) {
      doc.addPage();
      y = margin + 15;
    }
  }

  function renderPdfTable(tblLines: string[]) {
    const rawRows = tblLines
      .filter((l) => !/^\|[\s\-:|]+\|$/.test(l))
      .map((l) =>
        l
          .split("|")
          .slice(1, -1)
          .map((c) => c.trim().replace(/\*\*/g, ""))
      );

    if (rawRows.length === 0) return;

    const colCount = Math.max(...rawRows.map((r) => r.length)) || 1;

    // Smart column width calculation based on content lengths
    const colMaxLens: number[] = new Array(colCount).fill(8);
    rawRows.forEach((row) => {
      row.forEach((cell, cIdx) => {
        if (cell.length > colMaxLens[cIdx]) {
          colMaxLens[cIdx] = cell.length;
        }
      });
    });

    const weights = colMaxLens.map((len) => Math.max(12, Math.min(80, Math.pow(len, 0.72) * 2.8)));
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const colWidths = weights.map((w) => (w / totalWeight) * maxContentWidth);

    for (let rIdx = 0; rIdx < rawRows.length; rIdx++) {
      const row = rawRows[rIdx];
      const isHeader = rIdx === 0;

      // Calculate max row height needed for wrapped cell text
      let maxCellLines = 1;
      const cellTexts: string[][] = [];

      doc.setFont("helvetica", isHeader ? "bold" : "normal");
      doc.setFontSize(isHeader ? 8.5 : 8);

      for (let cIdx = 0; cIdx < colCount; cIdx++) {
        const text = row[cIdx] || "";
        const lines = doc.splitTextToSize(text, colWidths[cIdx] - 10);
        cellTexts.push(lines);
        if (lines.length > maxCellLines) {
          maxCellLines = lines.length;
        }
      }

      const lineHeight = isHeader ? 11 : 10;
      const rowHeight = Math.max(18, maxCellLines * lineHeight + 8);
      checkPageBreak(rowHeight + 4);

      // Draw Row cells
      let currentX = margin;
      for (let cIdx = 0; cIdx < colCount; cIdx++) {
        const currentColWidth = colWidths[cIdx];

        // Background
        if (isHeader) {
          doc.setFillColor(15, 23, 42); // slate-900
          doc.rect(currentX, y - 2, currentColWidth, rowHeight, "F");
        } else if (rIdx % 2 === 1) {
          doc.setFillColor(248, 250, 252); // slate-50
          doc.rect(currentX, y - 2, currentColWidth, rowHeight, "F");
        }

        // Border
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.rect(currentX, y - 2, currentColWidth, rowHeight, "S");

        // Text
        doc.setTextColor(isHeader ? 255 : 30, isHeader ? 255 : 41, isHeader ? 255 : 59);
        const cellLines = cellTexts[cIdx];
        cellLines.forEach((lText, lIdx) => {
          doc.text(lText, currentX + 5, y + 8 + lIdx * lineHeight);
        });

        currentX += currentColWidth;
      }

      y += rowHeight;
    }
    y += 10;
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Check code blocks
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        inCodeBlock = false;
        doc.setFont("courier", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);

        const codeLinesToRender: string[] = [];
        for (const codeLine of codeBuffer) {
          const splitCode = doc.splitTextToSize(codeLine || " ", maxContentWidth - 16);
          codeLinesToRender.push(...splitCode);
        }

        const codeLineHeight = 9.5;
        let cIdx = 0;
        while (cIdx < codeLinesToRender.length) {
          const availableHeight = bottomThreshold - y;
          const linesCanFit = Math.max(1, Math.floor((availableHeight - 12) / codeLineHeight));
          const chunk = codeLinesToRender.slice(cIdx, cIdx + linesCanFit);
          const chunkHeight = chunk.length * codeLineHeight + 8;

          checkPageBreak(chunkHeight + 4);

          // Draw unified box for this chunk
          doc.setFillColor(241, 245, 249);
          doc.rect(margin, y - 2, maxContentWidth, chunkHeight, "F");
          doc.setDrawColor(203, 213, 225);
          doc.setLineWidth(0.5);
          doc.rect(margin, y - 2, maxContentWidth, chunkHeight, "S");

          // Left cyan accent bar
          doc.setFillColor(2, 132, 199);
          doc.rect(margin, y - 2, 3, chunkHeight, "F");

          // Render text
          chunk.forEach((lineText, idx) => {
            doc.text(lineText, margin + 8, y + 7 + idx * codeLineHeight);
          });

          y += chunkHeight + 4;
          cIdx += chunk.length;
        }
        codeBuffer = [];
        y += 8;
      } else {
        if (inTable) {
          renderPdfTable(tableBuffer);
          tableBuffer = [];
          inTable = false;
        }
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // Check Table Lines
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      inTable = true;
      tableBuffer.push(trimmed);
      continue;
    } else if (inTable) {
      inTable = false;
      renderPdfTable(tableBuffer);
      tableBuffer = [];
    }

    if (!trimmed) {
      y += 6;
      continue;
    }

    // Headings
    if (trimmed.startsWith("# ")) {
      const headingText = trimmed.replace(/^#\s+/, "");
      checkPageBreak(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(2, 132, 199); // cyan-600
      const hLines = doc.splitTextToSize(headingText, maxContentWidth);
      doc.text(hLines, margin, y);
      y += hLines.length * 16 + 8;
    } else if (trimmed.startsWith("## ")) {
      const headingText = trimmed.replace(/^##\s+/, "");
      checkPageBreak(25);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      const hLines = doc.splitTextToSize(headingText, maxContentWidth);
      doc.text(hLines, margin, y);
      y += hLines.length * 14 + 6;
    } else if (trimmed.startsWith("### ")) {
      const headingText = trimmed.replace(/^###\s+/, "");
      checkPageBreak(22);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(30, 41, 59);
      const hLines = doc.splitTextToSize(headingText, maxContentWidth);
      doc.text(hLines, margin, y);
      y += hLines.length * 13 + 5;
    } else if (trimmed.startsWith("#### ")) {
      const headingText = trimmed.replace(/^####\s+/, "");
      checkPageBreak(20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);
      const hLines = doc.splitTextToSize(headingText, maxContentWidth);
      doc.text(hLines, margin, y);
      y += hLines.length * 12 + 4;
    } else if (trimmed.startsWith("---") || trimmed.startsWith("***")) {
      checkPageBreak(15);
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y, pageWidth - margin, y);
      y += 12;
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const bulletContent = trimmed.replace(/^[\-\*]\s+/, "");
      const cleanText = bulletContent.replace(/\*\*/g, "").replace(/\`/g, "");
      const bLines = doc.splitTextToSize(cleanText, maxContentWidth - 14);
      checkPageBreak(bLines.length * 12 + 4);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(2, 132, 199);
      doc.text("•", margin + 2, y);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 41, 59);
      doc.text(bLines, margin + 14, y);
      y += bLines.length * 12 + 3;
    } else {
      // Regular paragraph line
      const cleanText = trimmed.replace(/\*\*/g, "").replace(/\`/g, "");
      const pLines = doc.splitTextToSize(cleanText, maxContentWidth);
      checkPageBreak(pLines.length * 12 + 4);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text(pLines, margin, y);
      y += pLines.length * 12 + 4;
    }
  }

  // Add Page Numbers in running footer
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      `Page ${p} of ${totalPages}  |  ${title}`,
      pageWidth / 2,
      pageHeight - 20,
      { align: "center" }
    );
  }

  return doc.output("blob");
}

/**
 * Creates a ZIP archive containing all files in the chosen format ('md', 'docx', 'pdf', or 'all').
 */
export async function createZipBundle(
  files: ExportableFile[],
  format: "md" | "docx" | "pdf" | "all" = "all"
): Promise<Blob> {
  const zip = new JSZip();

  for (const file of files) {
    const baseName = file.filename.replace(/\.[^/.]+$/, "");

    if (format === "md" || format === "all") {
      const sanitized = sanitizeAndFormatMarkdown(file.content);
      zip.file(`${baseName}.md`, sanitized);
    }

    if (format === "docx" || format === "all") {
      const docxBlob = await generateDocxBlob(file.title, file.content);
      zip.file(`${baseName}.docx`, docxBlob);
    }

    if (format === "pdf" || format === "all") {
      const pdfBlob = await generatePdfBlob(file.title, file.content);
      zip.file(`${baseName}.pdf`, pdfBlob);
    }
  }

  // Add README index
  const indexReadme = `# Autonomous SDLC Specification Package\n\nGenerated: ${new Date().toISOString()}\n\nIncluded Canonical Deliverables:\n${files
    .map((f, i) => `${i + 1}. **${f.title}** (${f.filename})`)
    .join("\n")}\n\nAvailable Formats: Markdown (.md), Microsoft Word (.docx), and Adobe PDF (.pdf).\n`;
  zip.file("README.md", indexReadme);

  return await zip.generateAsync({ type: "blob" });
}
