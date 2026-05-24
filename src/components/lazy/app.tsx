import { DocsShell } from "./docs-shell";
import { IntroPage } from "./intro-page";

export function LazyApp({ sources }: { sources: Record<string, string> }) {
  return (
    <DocsShell>
      <IntroPage sources={sources} />
    </DocsShell>
  );
}
