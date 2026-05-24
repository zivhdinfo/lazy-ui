import type { MouseEvent } from "react";

export function rippleClick(e: MouseEvent<HTMLElement>) {
  const target = e.currentTarget;
  const rect = target.getBoundingClientRect();
  const node = document.createElement("span");
  node.className = "ripple";
  node.style.left = `${e.clientX - rect.left}px`;
  node.style.top = `${e.clientY - rect.top}px`;
  node.style.width = "10px";
  node.style.height = "10px";
  target.appendChild(node);
  window.setTimeout(() => node.remove(), 700);
}
