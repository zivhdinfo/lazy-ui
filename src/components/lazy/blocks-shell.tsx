import type { ReactNode } from "react";

import { DocsChrome } from "./docs-chrome";

/**
 * Shell used by the /blocks gallery and /blocks/<slug> detail pages.
 * Carved header (DocsChrome) + a centered full-width main area — no sidebar,
 * no right column. Keeps blocks out of the per-component docs chrome.
 */
export function BlocksShell({ children }: { children: ReactNode }) {
  return (
    <DocsChrome>
      <div className="blocks-shell">{children}</div>
    </DocsChrome>
  );
}
