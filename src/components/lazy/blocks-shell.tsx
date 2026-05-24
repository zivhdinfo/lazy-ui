import type { ReactNode } from "react";

import { LazyShell } from "./lazy-shell";

/**
 * Shell used by the /blocks gallery and /blocks/<slug> detail pages.
 * Top navbar (LazyShell) + a centered full-width main area — no sidebar,
 * no right column. Keeps blocks out of the per-component docs chrome.
 */
export function BlocksShell({ children }: { children: ReactNode }) {
  return (
    <LazyShell>
      <div className="blocks-shell">{children}</div>
    </LazyShell>
  );
}
