/** Format helpers reused across Customize slider definitions. */

export const fmtPx = (n: number) => `${Math.round(n)}px`;
export const fmtPct = (n: number) => `${Math.round(n * 100)}%`;
export const fmtMs = (n: number) => `${Math.round(n)}ms`;
export const fmtX = (n: number) => `${n.toFixed(2)}x`;
export const fmt1 = (n: number) => n.toFixed(1);
export const fmt2 = (n: number) => n.toFixed(2);
export const fmt3 = (n: number) => n.toFixed(3);
export const fmtSec1 = (n: number) => `${n.toFixed(1)}s`;
export const fmtSec2 = (n: number) => `${n.toFixed(2)}s`;
export const fmtCount = (n: number) => `${Math.round(n)}`;
