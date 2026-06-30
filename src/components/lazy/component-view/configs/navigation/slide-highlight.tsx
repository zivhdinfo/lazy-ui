import { toggle } from "@/components/lazy/component-detail/controls";
import { SlideHighlightDemo } from "@/components/lazy/slide-highlight-demo";
import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/slide-highlight"),
  export: "SlideHighlight",
  stageMinHeight: 360,
  render: (v) => {
    const showActive = (v.active ?? true) as boolean;
    const showHover = (v.hover ?? true) as boolean;
    return (
      <div className="flex w-full items-center justify-center">
        <div className="flex items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--preview-bg)] p-6">
          <SlideHighlightDemo showActive={showActive} hoverDisabled={!showHover} />
        </div>
      </div>
    );
  },
  // Real SlideHighlight props: the active pill (`activeSelector`) and the hover
  // pill (`hoverDisabled`) are the two behaviors it actually exposes.
  controls: [
    toggle("active", "Active marker", true),
    toggle("hover", "Hover pill", true),
  ],
};
