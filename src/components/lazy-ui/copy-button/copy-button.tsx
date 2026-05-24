"use client";

import { useState, type MouseEvent } from "react";

import { AnimateTooltip } from "@/components/lazy-ui/animate-tooltip";
import { RevealAnimate } from "@/components/lazy-ui/reveal-animate";

/** Icon swap animation between the copy and check glyphs. */
export type IconAnimate = "blur" | "draw" | "reveal";

export type CopyButtonProps = {
  /** Text written to the clipboard on click. */
  content: string;
  /** Show the label text alongside (or via tooltip) the icon. @default false */
  text?: boolean;
  /** Where to render the label when `text` is true. @default "inline" */
  textAs?: "inline" | "tooltip";
  /** Use a RevealAnimate wipe for the inline-label swap. @default true */
  revealAnimate?: boolean;
  /** How the copy/check icon swap animates. @default "blur" */
  iconAnimate?: IconAnimate;
  /** Label text. @default "Copy" */
  label?: string;
  /** Label swapped in while in the copied state. @default "Copied" */
  copiedLabel?: string;
  /** How long the copied state lingers before reverting (ms). @default 4000 */
  delay?: number;
  /** Controlled copied state. Leave undefined for uncontrolled. */
  copied?: boolean;
  /** Fires whenever the copied state changes. */
  onCopiedChange?: (copied: boolean) => void;
  /** Extra class names merged onto the button. */
  className?: string;
};

/**
 * CopyButton — copies `content` to the clipboard and swaps a copy/check icon.
 *
 * - `iconAnimate`: pick the icon swap effect — `blur` (default, scale + opacity
 *    + blur), `draw` (stroke-dashoffset draw-in, same technique as the Checkbox
 *    indicator), or `reveal` (RevealAnimate mask wipe).
 * - `revealAnimate`: when `text=true textAs="inline"`, toggles a RevealAnimate
 *    crossfade on the label — old text wipes back toward the icon, new text
 *    wipes out from the icon. Disable for an instant text swap.
 */
export function CopyButton({
  content,
  text = false,
  textAs = "inline",
  revealAnimate = true,
  iconAnimate = "blur",
  label = "Copy",
  copiedLabel = "Copied",
  delay = 4000,
  copied: controlled,
  onCopiedChange,
  className,
}: CopyButtonProps) {
  const [internal, setInternal] = useState(false);
  const isCopied = controlled ?? internal;
  const showsInlineLabel = text && textAs === "inline";
  // Reveal sweep direction flips between transitions so the round trip feels
  // symmetric: click sweeps left→right, the auto-revert sweeps right→left.
  const [revealFrom, setRevealFrom] = useState<"left" | "right">("left");

  const setCopied = (next: boolean) => {
    if (controlled === undefined) setInternal(next);
    onCopiedChange?.(next);
  };

  const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCopied) return;
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(content);
      setRevealFrom("left");
      setCopied(true);
      window.setTimeout(() => {
        setRevealFrom("right");
        setCopied(false);
      }, delay);
    } catch {
      // ignore — most likely a permission/secure-context denial
    }
  };

  const button = (
    <button
      type="button"
      data-copy-button=""
      data-copied={isCopied || undefined}
      aria-label={isCopied ? copiedLabel : label}
      onClick={handleClick}
      className={[
        "group inline-flex items-center rounded-md text-[11px] text-neutral-400 transition-colors hover:bg-white/[0.04] hover:text-white active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-300",
        showsInlineLabel ? "h-6 gap-1.5 px-2" : "size-6 justify-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <IconSwap mode={iconAnimate} isCopied={isCopied} revealFrom={revealFrom} />
      {showsInlineLabel && (
        <LabelSwap
          label={label}
          copiedLabel={copiedLabel}
          isCopied={isCopied}
          revealAnimate={revealAnimate}
          revealFrom={revealFrom}
        />
      )}
    </button>
  );

  if (text && textAs === "tooltip") {
    return (
      <AnimateTooltip content={isCopied ? copiedLabel : label}>
        {button}
      </AnimateTooltip>
    );
  }

  return button;
}

function IconSwap({
  mode,
  isCopied,
  revealFrom,
}: {
  mode: IconAnimate;
  isCopied: boolean;
  revealFrom: "left" | "right";
}) {
  // All three modes share the same "stacked overlay with hidden spacer" setup.
  // Only the per-icon classes differ.
  const wrapper = "relative grid size-3.5 place-items-center transition-transform duration-200 ease-out group-hover:scale-125 group-active:scale-90";

  if (mode === "reveal") {
    return (
      <span className={wrapper}>
        <CopyIcon className="invisible" />
        <RevealAnimate
          trigger={!isCopied}
          from={revealFrom}
          className="absolute inset-0 grid place-items-center"
        >
          <CopyIcon />
        </RevealAnimate>
        <RevealAnimate
          trigger={isCopied}
          from={revealFrom}
          className="absolute inset-0 grid place-items-center"
        >
          <CheckIcon />
        </RevealAnimate>
      </span>
    );
  }

  if (mode === "draw") {
    // Stroke-dashoffset draw-in, same technique as the Checkbox indicator.
    // pathLength={1} on each child normalizes dasharray to 1, so dashoffset 1
    // hides the stroke and 0 reveals it. Inheritance cascades the value to the
    // children via [&_*]:; the entering icon gets a small delay so the leaving
    // one undraws first.
    const layer =
      "absolute inset-0 grid place-items-center [&_*]:[stroke-dasharray:1] [&_*]:transition-[stroke-dashoffset] [&_*]:duration-300 [&_*]:ease-out";
    const drawn = "[&_*]:[stroke-dashoffset:0] [&_*]:delay-100";
    const undrawn = "[&_*]:[stroke-dashoffset:1]";
    return (
      <span className={wrapper}>
        <CopyIcon className="invisible" />
        <span
          aria-hidden
          className={[layer, isCopied ? undrawn : drawn].join(" ")}
        >
          <CopyIcon />
        </span>
        <span
          aria-hidden
          className={[layer, isCopied ? drawn : undrawn].join(" ")}
        >
          <CheckIcon />
        </span>
      </span>
    );
  }

  // blur (default): scale + opacity + blur.
  const transition =
    "transition-[transform,opacity,filter] duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)]";
  const activeClass = "scale-100 opacity-100 blur-0";
  const inactiveClass = "scale-0 opacity-0 blur-md";

  return (
    <span className={wrapper}>
      <CopyIcon className="invisible" />
      <span
        aria-hidden
        className={[
          "absolute inset-0 grid place-items-center",
          transition,
          isCopied ? inactiveClass : activeClass,
        ].join(" ")}
      >
        <CopyIcon />
      </span>
      <span
        aria-hidden
        className={[
          "absolute inset-0 grid place-items-center",
          transition,
          isCopied ? activeClass : inactiveClass,
        ].join(" ")}
      >
        <CheckIcon />
      </span>
    </span>
  );
}

function LabelSwap({
  label,
  copiedLabel,
  isCopied,
  revealAnimate,
  revealFrom,
}: {
  label: string;
  copiedLabel: string;
  isCopied: boolean;
  revealAnimate: boolean;
  revealFrom: "left" | "right";
}) {
  if (!revealAnimate) {
    return <span>{isCopied ? copiedLabel : label}</span>;
  }
  return (
    <span className="relative inline-grid">
      <RevealAnimate
        trigger={!isCopied}
        from={revealFrom}
        className="col-start-1 row-start-1 whitespace-nowrap"
      >
        {label}
      </RevealAnimate>
      <RevealAnimate
        trigger={isCopied}
        from={revealFrom}
        className="col-start-1 row-start-1 whitespace-nowrap"
      >
        {copiedLabel}
      </RevealAnimate>
    </span>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ width: "100%", height: "100%" }}
    >
      <rect pathLength={1} width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path pathLength={1} d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ width: "100%", height: "100%" }}
    >
      <polyline pathLength={1} points="4 12 9 17 20 6" />
    </svg>
  );
}
