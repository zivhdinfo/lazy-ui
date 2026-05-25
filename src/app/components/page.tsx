import { Suspense } from "react";

import { ComponentsGrid } from "@/components/lazy/components-grid";
import { DocsShell } from "@/components/lazy/docs-shell";
import { GridBackground } from "@/components/lazy-ui/grid-background";
import { getPublishedComponentsOnly } from "@/registry/components";

export default function ComponentsPage() {
  const components = getPublishedComponentsOnly();
  return (
    <div className="lazy-root">
      {/* Page-wide grid backdrop. Fixed so it stays put on scroll and only
          covers the content column (sidebar sits in front of it). */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-y-0 right-0 z-0"
        style={{ left: "var(--sidebar-w)" }}
      >
        <GridBackground
          variant="dashed"
          size={28}
          lineWidth={1}
          dashLength={4}
          dashGap={6}
          color="rgba(255,255,255,0.08)"
          fade="edges"
          fadeStrength={0.85}
        />
      </div>
      <DocsShell>
        <Suspense fallback={null}>
          <ComponentsGrid items={components} />
        </Suspense>
      </DocsShell>
    </div>
  );
}
