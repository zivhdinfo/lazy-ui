import { REGISTRY_BASE_URL } from "./base-url";
import type {
  ComponentItem,
  RegistryFile,
  RegistryItemJson,
} from "./types";

/** True for objects/arrays we should treat as "present" only when non-empty. */
function hasKeys(value: Record<string, unknown> | undefined): boolean {
  return !!value && Object.keys(value).length > 0;
}

export function normalizeRegistryName(name: string): string {
  return decodeURIComponent(name).replace(/\.json$/, "");
}

/** Builds the shadcn registry JSON for a component. Server-side: source comes from disk.
 *  Each component ships TWO files: the implementation + an `index.ts` re-export, so the
 *  consumer can import via the directory path (e.g. `@/components/lazy-ui/animated-tabs`).
 *  Additional helper files declared in `extraFiles` are bundled too. When an
 *  entry declares `cssVars`/`css`, they're forwarded so shadcn updates the
 *  consumer's globals.css (theme variables, keyframes, @layer rules) on install. */
export function buildRegistryItemJson(
  item: ComponentItem,
  source: string,
  extraSources: Record<string, string> = {},
): RegistryItemJson {
  // item.target is `.../[slug]/[slug].tsx` — derive the sibling index path.
  const indexTarget = item.target.replace(/\/[^/]+\.tsx$/, "/index.ts");
  const indexContent = `export * from "./${item.slug}";\n`;
  // Merge external + internal deps. Internal slugs become full URLs so the
  // consumer's shadcn CLI can fetch them from this registry.
  const allDeps = [
    ...(item.registryDependencies ?? []),
    ...(item.internalDependencies ?? []).map(
      (slug) => `${REGISTRY_BASE_URL}/${slug}.json`,
    ),
  ];
  const extraFileEntries: RegistryFile[] = (item.extraFiles ?? []).map(
    (extra) => ({
      path: `src/${extra.target}`,
      type: extra.type,
      target: extra.target,
      content: extraSources[extra.src] ?? "",
    }),
  );
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: item.slug,
    type: "registry:component",
    title: item.title,
    description: item.description,
    ...(item.dependencies && item.dependencies.length > 0
      ? { dependencies: item.dependencies }
      : {}),
    ...(allDeps.length > 0 ? { registryDependencies: allDeps } : {}),
    files: [
      {
        path: `src/${item.target}`,
        type: "registry:component",
        target: item.target,
        content: source,
      },
      {
        path: `src/${indexTarget}`,
        type: "registry:component",
        target: indexTarget,
        content: indexContent,
      },
      ...extraFileEntries,
    ],
    ...(hasKeys(item.cssVars) ? { cssVars: item.cssVars } : {}),
    ...(hasKeys(item.css) ? { css: item.css } : {}),
  };
}
