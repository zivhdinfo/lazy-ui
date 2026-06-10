import { Suspense } from "react";

import { ComponentsGrid } from "@/components/lazy/components-grid";
import { getPublishedComponentsOnly } from "@/registry/components";

// Chrome (sidebar + header) lives in components/layout.tsx so it persists
// across navigation; the page renders only its own content.
export default function ComponentsPage() {
  const components = getPublishedComponentsOnly();
  return (
    <Suspense fallback={null}>
      <ComponentsGrid items={components} />
    </Suspense>
  );
}
