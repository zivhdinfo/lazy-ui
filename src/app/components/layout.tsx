import type { ReactNode } from "react";

import { DocsShell } from "@/components/lazy/docs-shell";

// Shared chrome for every /components route. Living in a layout (not the page)
// means the sidebar + chrome persist across navigation between the grid and
// each component, so the sidebar keeps its open categories and scroll position
// instead of remounting and re-animating on every click.
export default function ComponentsLayout({ children }: { children: ReactNode }) {
  return <DocsShell>{children}</DocsShell>;
}
