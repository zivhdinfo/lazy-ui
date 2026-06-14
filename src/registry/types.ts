export type RegistryFile = {
  path: string;
  type: "registry:component" | "registry:lib" | "registry:hook";
  target: string;
  content: string;
};

/**
 * CSS variables shadcn writes into the consumer's theme on install:
 * `theme` → the `@theme inline` block, `light` → `:root`, `dark` → `.dark`.
 * Values are written verbatim (e.g. "oklch(0.5 0 0)", "0.5rem").
 */
export type RegistryCssVars = {
  theme?: Record<string, string>;
  light?: Record<string, string>;
  dark?: Record<string, string>;
};

/**
 * Arbitrary CSS shadcn appends to the consumer's globals.css — a CSS-in-JSON
 * tree. A string leaf is a declaration value; a nested object is an at-rule
 * (`@keyframes`, `@layer base`) or a selector. Example:
 * `{ "@keyframes spin": { from: { transform: "rotate(0)" }, to: { transform: "rotate(360deg)" } } }`.
 */
export type RegistryCssNode = string | { [selector: string]: RegistryCssNode };
export type RegistryCss = Record<string, RegistryCssNode>;

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
  /** CSS variables shadcn injects into the consumer's globals.css. */
  cssVars?: RegistryCssVars;
  /** Extra CSS (keyframes, @layer rules, utilities) appended to globals.css. */
  css?: RegistryCss;
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
  /** CSS variables shadcn injects into the consumer's globals.css on install. */
  cssVars?: RegistryCssVars;
  /** Extra CSS (keyframes, @layer rules, utilities) shadcn appends on install. */
  css?: RegistryCss;
};
