import type { ReactNode } from "react";

import { DocsShell } from "@/components/lazy/docs-shell";

// Shared chrome for every /get-started route. Living in a layout means the
// sidebar + header persist across navigation between the intro and each topic.
export default function GetStartedLayout({ children }: { children: ReactNode }) {
  return <DocsShell>{children}</DocsShell>;
}
