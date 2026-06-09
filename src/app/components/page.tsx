import { Suspense } from "react";

import { ComponentsGrid } from "@/components/lazy/components-grid";
import { DocsShell } from "@/components/lazy/docs-shell";
import { getPublishedComponentsOnly } from "@/registry/components";

export default function ComponentsPage() {
  const components = getPublishedComponentsOnly();
  return (
    <DocsShell>
      <Suspense fallback={null}>
        <ComponentsGrid items={components} />
      </Suspense>
    </DocsShell>
  );
}
