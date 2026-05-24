export type RegistryFile = {
  path: string;
  type: "registry:component" | "registry:lib" | "registry:hook";
  target: string;
  content: string;
};

export type RegistryItemJson = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json";
  name: string;
  type: "registry:component";
  title: string;
  description: string;
  files: RegistryFile[];
  /** npm packages to install alongside this item. */
  dependencies?: string[];
  /** Other registry items shadcn should install alongside this one. */
  registryDependencies?: string[];
};

/** An additional file shipped alongside a component's primary source. */
export type ExtraRegistryFile = {
  /** Path relative to `src/` (e.g. "lib/get-strict-context.tsx"). */
  src: string;
  /** Where shadcn drops the file in the consumer project. */
  target: string;
  /** Tells shadcn which folder the file belongs in. */
  type: "registry:component" | "registry:lib" | "registry:hook";
};

/**
 * Discriminates a single-purpose primitive from a full page-section block.
 * Blocks live at `/blocks/<slug>`; components live at `/components/<slug>`.
 */
export type ComponentKind = "component" | "block";

export type ComponentItem = {
  slug: string;
  title: string;
  description: string;
  category: string;
  /** Where shadcn drops the source file inside the consumer project. */
  target: string;
  status: "published" | "draft";
  /** Section in the docs site. Defaults to "component". */
  kind?: ComponentKind;
  /** External registry items — shadcn default registry names or full URLs. */
  registryDependencies?: string[];
  /** Slugs from THIS registry. Auto-prefixed with REGISTRY_BASE_URL on serialize. */
  internalDependencies?: string[];
  /** npm packages the consumer needs installed. */
  dependencies?: string[];
  /** Extra source files (helpers, hooks, primitives) shipped with this component. */
  extraFiles?: ExtraRegistryFile[];
};
