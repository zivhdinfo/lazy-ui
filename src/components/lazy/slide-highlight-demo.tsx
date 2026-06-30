"use client";

import { useState } from "react";

import { SlideHighlight } from "@/components/lazy-ui/slide-highlight";

const ITEMS = [
  { value: "overview", label: "Overview" },
  { value: "analytics", label: "Analytics" },
  { value: "reports", label: "Reports" },
  { value: "settings", label: "Settings" },
];

// Mirrors the sidebar usage: a list of buttons where one is active. The hover
// pill follows the cursor (drop it with `hoverDisabled`); the active pill marks
// the selection and slides on click (drop it by omitting `activeSelector`).
// Both pills inherit `currentColor`, so the demo reads on either docs theme.
export function SlideHighlightDemo({
  hoverDisabled = false,
  showActive = true,
}: {
  /** Forwarded to SlideHighlight — hide the cursor-following hover pill. */
  hoverDisabled?: boolean;
  /** Pass `activeSelector` (on) or omit it (off) to toggle the active pill. */
  showActive?: boolean;
}) {
  const [active, setActive] = useState(ITEMS[0].value);

  return (
    <SlideHighlight
      activeSelector={showActive ? "[data-slide-active]" : undefined}
      activeKey={active}
      hoverDisabled={hoverDisabled}
      className="relative isolate flex w-56 flex-col gap-1 p-1.5 text-[var(--text)]"
    >
      {ITEMS.map((item) => {
        const isActive = item.value === active;
        return (
          <button
            key={item.value}
            type="button"
            data-slide-item
            data-slide-active={isActive ? "" : undefined}
            onClick={() => setActive(item.value)}
            className={[
              "relative cursor-pointer rounded-lg px-3.5 py-2 text-left text-[13px] transition-colors duration-200",
              isActive
                ? "font-medium text-[var(--text)]"
                : "text-[var(--text-3)] hover:text-[var(--text)]",
            ].join(" ")}
          >
            {item.label}
          </button>
        );
      })}
    </SlideHighlight>
  );
}
