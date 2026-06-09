import type { ReactNode } from "react";

import { DocsChrome } from "./docs-chrome";
import { Sidebar } from "./sidebar";

export function DocsShell({ children }: { children: ReactNode }) {
  return (
    <DocsChrome>
      <div className="shell">
        <Sidebar />
        {children}
      </div>
    </DocsChrome>
  );
}
