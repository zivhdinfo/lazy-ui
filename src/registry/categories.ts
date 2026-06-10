import type { ComponentItem } from "./types";

// Single source of truth for the component URL `type` segment.
// Routes (`/components/<type>/<slug>`), the sidebar, the gallery cards, and the
// sitemap all derive their links from here so the scheme never drifts.
// Block categories (`Blocks · …`) are intentionally absent — blocks keep their
// own `/blocks/<slug>` route and never use this map.
export const CATEGORY_TO_TYPE: Record<string, string> = {
  Navigation: "navigation",
  Buttons: "buttons",
  Forms: "forms",
  Feedback: "feedback",
  Overlay: "overlay",
  Effects: "effects",
  Animate: "animate",
  "Text Animate": "text-animate",
  "Device Mocks": "device-mocks",
  Background: "background",
};

const TYPE_TO_CATEGORY: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_TO_TYPE).map(([category, type]) => [type, category]),
);

/** Slugify a category into its URL `type` segment. */
export function typeForCategory(category: string): string {
  return (
    CATEGORY_TO_TYPE[category] ?? category.toLowerCase().replace(/\s+/g, "-")
  );
}

/** Resolve a URL `type` segment back to its registry category, if known. */
export function categoryForType(type: string): string | undefined {
  return TYPE_TO_CATEGORY[type];
}

/** True when `type` is a recognized component type segment. */
export function isComponentType(type: string): boolean {
  return type in TYPE_TO_CATEGORY;
}

/** Canonical detail-page href for a component registry item. */
export function componentHref(item: ComponentItem): string {
  return `/components/${typeForCategory(item.category)}/${item.slug}`;
}
