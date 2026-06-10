import type { ComponentView } from "./types";

import { view as matrixGrid } from "./configs/animate/matrix-grid";
import { view as copyButton } from "./configs/buttons/copy-button";
import { view as flipButton } from "./configs/buttons/flip-button";
import { view as shinyText } from "./configs/text-animate/shiny-text";

// One line per migrated component. Components without an entry still get a full
// detail page (Code / Install / Props / Usage) — only the live preview shows a
// "coming soon" placeholder until a config lands here.
const VIEWS: Record<string, ComponentView> = {
  "copy-button": copyButton,
  "flip-button": flipButton,
  "matrix-grid": matrixGrid,
  "shiny-text": shinyText,
};

export function viewFor(slug: string): ComponentView | undefined {
  return VIEWS[slug];
}
