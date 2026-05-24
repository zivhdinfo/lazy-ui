import type { ReactNode } from "react";

import { LazyShell } from "./lazy-shell";
import { RightColumn } from "./right-column";
import { Sidebar } from "./sidebar";

export function DocsShell({ children }: { children: ReactNode }) {
  return (
    <LazyShell>
      <div className="shell">
        <Sidebar />
        {children}
        <RightColumn />
      </div>
    </LazyShell>
  );
}
