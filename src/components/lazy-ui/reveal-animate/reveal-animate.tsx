"use client";

import { type CSSProperties, type ReactNode } from "react";

export type RevealAnimateProps = {
  /** Content to reveal. */
  children: ReactNode;
  /** Reveal when true, hide when false. Toggle to play. @default true */
  trigger?: boolean;
  /** Side the reveal sweeps in from. @default "left" */
  from?: "left" | "right";
  /** Animation duration in ms. @default 450 */
  duration?: number;
  /** Extra class names. */
  className?: string;
};

/**
 * RevealAnimate — a lightweight masked reveal. Toggle `trigger` and the content
 * sweeps in (or out) under a soft mask with a small blur. Pure inline CSS,
 * no internal state, no animation library.
 *
 * Reveals from the left by default — the mask anchors on the right when
 * hidden, so the visible region grows outward from `from`.
 */
export function RevealAnimate({
  children,
  trigger = true,
  from = "left",
  duration = 450,
  className,
}: RevealAnimateProps) {
  const axis = from === "left" ? "to right" : "to left";
  const hiddenPos = from === "left" ? "100% 0" : "0 0";
  const revealedPos = from === "left" ? "0 0" : "100% 0";
  const mask = `linear-gradient(${axis}, black 40%, transparent 60%)`;
  const pos = trigger ? revealedPos : hiddenPos;

  const style: CSSProperties = {
    display: "inline-block",
    maskImage: mask,
    WebkitMaskImage: mask,
    maskSize: "200% 100%",
    WebkitMaskSize: "200% 100%",
    maskPosition: pos,
    WebkitMaskPosition: pos,
    filter: trigger ? "blur(0)" : "blur(3px)",
    transition: `mask-position ${duration}ms ease-out, -webkit-mask-position ${duration}ms ease-out, filter ${duration}ms ease-out`,
  };

  return (
    <span className={className} style={style}>
      {children}
    </span>
  );
}
