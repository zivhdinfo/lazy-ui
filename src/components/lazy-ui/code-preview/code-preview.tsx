"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

export type CodePreviewProps = {
  /** Code as plain text. Used to count lines for the collapse cap. */
  code: string;
  /** Max visible lines before the "Show all" toggle appears. @default 10 */
  maxLines?: number;
  /** Optional left-side header content, e.g. a filename. */
  title?: ReactNode;
  /** Optional right-side header content, e.g. a copy button. */
  meta?: ReactNode;
  /** Optional pre-rendered code (e.g. syntax-highlighted). Falls back to plain `code`. */
  children?: ReactNode;
  /** Extra class names merged onto the root card. */
  className?: string;
};

/**
 * CodePreview — a bordered code card that caps the visible height at
 * `maxLines` and offers a "Show all" toggle when the source is longer.
 *
 * - Uses the CSS `1lh` unit so the clip respects the rendered line height.
 * - Fades the bottom edge of the clipped view via a `mask-image` so the cut
 *   feels intentional, not abrupt.
 * - `children` overrides the rendered code: pass syntax-highlighted nodes
 *   here; `code` is only used to count lines.
 */
export function CodePreview({
  code,
  maxLines = 10,
  title,
  meta,
  children,
  className,
}: CodePreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const lineCount = code.split("\n").length;
  const truncated = lineCount > maxLines;
  const collapsed = truncated && !expanded;
  const hasHeader = title !== undefined || meta !== undefined;

  const fade =
    "linear-gradient(to bottom, black 70%, transparent 100%)";
  const bodyStyle: CSSProperties = collapsed
    ? {
        maxHeight: `calc(${maxLines} * 1lh)`,
        maskImage: fade,
        WebkitMaskImage: fade,
      }
    : {};

  return (
    <div
      data-code-preview=""
      className={[
        "isolate overflow-hidden rounded-xl border border-white/10 bg-neutral-950 font-mono text-[12.5px] leading-relaxed",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {hasHeader && (
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] bg-white/[0.015] px-4 py-2 text-[11px] text-neutral-400">
          <span className="min-w-0 truncate">{title}</span>
          <span className="shrink-0">{meta}</span>
        </div>
      )}
      <div className="relative overflow-hidden" style={bodyStyle}>
        <pre className="m-0 overflow-x-auto px-5 py-4 text-neutral-100">
          {children ?? code}
        </pre>
      </div>
      {truncated && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="block w-full border-t border-white/[0.06] bg-white/[0.015] py-2 text-center text-[11px] font-medium text-neutral-300 transition-colors hover:bg-white/[0.04] hover:text-white"
        >
          {expanded ? "Show less" : `Show all ${lineCount} lines`}
        </button>
      )}
    </div>
  );
}
