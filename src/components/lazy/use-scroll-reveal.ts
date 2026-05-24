"use client";

import { useEffect } from "react";

export function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    els.forEach((el) => el.classList.add("in"));
  }, []);
}

export function attachSpotlight(node: HTMLElement | null) {
  if (!node) return;
  const onMove = (e: MouseEvent) => {
    const r = node.getBoundingClientRect();
    node.style.setProperty("--mx", `${e.clientX - r.left}px`);
    node.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  node.addEventListener("mousemove", onMove);
}

/** Track cursor inside `node` and write `--tilt-x` / `--tilt-y` as numbers in
 *  the range −0.5..0.5. The element's CSS uses them in a 3D rotate transform.
 *  Idempotent — a per-node dataset flag prevents double-attaching when React
 *  re-runs callback refs on re-render. */
export function attachTilt(node: HTMLElement | null) {
  if (!node || node.dataset.tiltAttached === "1") return;
  node.dataset.tiltAttached = "1";
  const onMove = (e: MouseEvent) => {
    const r = node.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    node.style.setProperty("--tilt-x", nx.toFixed(3));
    // Invert Y so cursor at top tilts the top edge toward the viewer.
    node.style.setProperty("--tilt-y", (-ny).toFixed(3));
  };
  const onLeave = () => {
    node.style.setProperty("--tilt-x", "0");
    node.style.setProperty("--tilt-y", "0");
  };
  node.addEventListener("mousemove", onMove);
  node.addEventListener("mouseleave", onLeave);
}
