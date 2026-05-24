import type { ReactNode } from "react";

import { NavPill } from "./nav-pill";

export function LazyShell({ children }: { children: ReactNode }) {
  return (
    <div className="app nav-pill-on">
      <NavPill />
      {children}
    </div>
  );
}
