import React from "react";

/**
 * A lightweight, safe Markdown renderer for Prava Travel Stories.
 * Supports headings (#, ##, ###), bold (**), italics (*), bullet lists (- or *),
 * blockquotes (>), links [text](url), images ![alt](url), and paragraphs.
 */
export function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  let inList = false;
  let listItems: string[] = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="my-3 space-y-1.5 list-disc list-inside text-muted-foreground">
          {listItems.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {formatInline(item)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trimEnd();

    // Empty lines
    if (!line.trim()) {
      flushList();
      return;
    }

    // Unordered List item
    if (/^[-*+]\s+/.test(line.trim())) {
      inList = true;
      listItems.push(line.trim().replace(/^[-*+]\s+/, ""));
      return;
    }

    flushList();

    // Headings
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={index} className="text-lg font-bold text-foreground mt-6 mb-2 tracking-tight">
          {formatInline(line.replace(/^###\s+/, ""))}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={index} className="text-xl font-bold text-foreground mt-8 mb-3 pb-1 border-b border-border tracking-tight">
          {formatInline(line.replace(/^##\s+/, ""))}
        </h2>
      );
    } else if (line.startsWith("# ")) {
      elements.push(
        <h1 key={index} className="text-2xl font-extrabold text-foreground mt-8 mb-4 tracking-tight">
          {formatInline(line.replace(/^#\s+/, ""))}
        </h1>
      );
    }
    // Blockquote
    else if (line.startsWith("> ")) {
      elements.push(
        <blockquote
          key={index}
          className="my-4 border-l-4 border-primary pl-4 italic text-muted-foreground bg-muted/20 py-2 rounded-r-sm"
        >
          {formatInline(line.replace(/^>\s+/, ""))}
        </blockquote>
      );
    }
    // Image ![alt](url)
    else if (/^!\[(.*?)\]\((.*?)\)$/.test(line.trim())) {
      const match = line.trim().match(/^!\[(.*?)\]\((.*?)\)$/);
      if (match) {
        elements.push(
          <div key={index} className="my-6 rounded-md overflow-hidden border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={match[2]} alt={match[1] || "Story image"} className="w-full h-auto max-h-[480px] object-cover" />
            {match[1] && (
              <p className="text-center text-[11px] text-muted-foreground py-1.5 bg-muted/30">{match[1]}</p>
            )}
          </div>
        );
      }
    }
    // Standard Paragraph
    else {
      elements.push(
        <p key={index} className="my-3 text-sm text-foreground/90 leading-relaxed">
          {formatInline(line)}
        </p>
      );
    }
  });

  flushList();

  return <div className="space-y-1">{elements}</div>;
}

/**
 * Parses inline formatting: **bold**, *italic*, `code`, and [links](url)
 */
function formatInline(text: string): React.ReactNode {
  // Regex to split on bold, italic, code, links
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    // Check for link: [text](url)
    const linkMatch = remaining.match(/\[(.*?)\]\((.*?)\)/);
    // Check for bold: **text**
    const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
    // Check for italic: *text*
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/);
    // Check for code: `text`
    const codeMatch = remaining.match(/`(.*?)`/);

    // Find closest match
    let earliestType: "link" | "bold" | "italic" | "code" | null = null;
    let earliestIndex = Infinity;

    if (linkMatch && linkMatch.index !== undefined && linkMatch.index < earliestIndex) {
      earliestIndex = linkMatch.index;
      earliestType = "link";
    }
    if (boldMatch && boldMatch.index !== undefined && boldMatch.index < earliestIndex) {
      earliestIndex = boldMatch.index;
      earliestType = "bold";
    }
    if (italicMatch && italicMatch.index !== undefined && italicMatch.index < earliestIndex) {
      earliestIndex = italicMatch.index;
      earliestType = "italic";
    }
    if (codeMatch && codeMatch.index !== undefined && codeMatch.index < earliestIndex) {
      earliestIndex = codeMatch.index;
      earliestType = "code";
    }

    if (earliestType === null) {
      parts.push(remaining);
      break;
    }

    // Push text before match
    if (earliestIndex > 0) {
      parts.push(remaining.substring(0, earliestIndex));
    }

    if (earliestType === "link" && linkMatch) {
      parts.push(
        <a
          key={`inline-${keyIdx++}`}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:text-primary/80"
        >
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.substring(earliestIndex + linkMatch[0].length);
    } else if (earliestType === "bold" && boldMatch) {
      parts.push(
        <strong key={`inline-${keyIdx++}`} className="font-bold text-foreground">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.substring(earliestIndex + boldMatch[0].length);
    } else if (earliestType === "italic" && italicMatch) {
      parts.push(
        <em key={`inline-${keyIdx++}`} className="italic">
          {italicMatch[1]}
        </em>
      );
      remaining = remaining.substring(earliestIndex + italicMatch[0].length);
    } else if (earliestType === "code" && codeMatch) {
      parts.push(
        <code key={`inline-${keyIdx++}`} className="px-1 py-0.5 rounded bg-muted text-[11px] font-mono text-foreground">
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.substring(earliestIndex + codeMatch[0].length);
    }
  }

  return <>{parts}</>;
}
