import { ComponentsGrid } from "@/components/lazy/components-grid";
import { DocsShell } from "@/components/lazy/docs-shell";
import { getPublishedComponentsOnly } from "@/registry/components";

export default function ComponentsPage() {
  const components = getPublishedComponentsOnly();
  return (
    <div className="lazy-root">
      <DocsShell>
        <ComponentsGrid items={components} />
      </DocsShell>
    </div>
  );
}
