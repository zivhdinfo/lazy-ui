"use client";

import type { ReactNode } from "react";

import {
  Accordion,
  type AccordionIcon,
  type AccordionItem,
  type AccordionLayout,
  type AccordionMode,
  type AccordionSize,
  type AccordionVariant,
} from "@/components/lazy-ui/accordion";
import {
  select,
  slider,
  toggle,
} from "@/components/lazy/component-detail/controls";
import { fmtX } from "@/components/lazy/component-detail/format";
import type { ComponentView } from "@/components/lazy/component-view/types";

// Questions a developer actually asks before pasting a component library in —
// answered in the Lazy-ui voice: own every line, no black box, no begging.
const DEMO: AccordionItem[] = [
  {
    id: "what",
    title: "What is Lazy-ui?",
    content:
      "A copy-and-paste component library for React and Tailwind. You take the file, not a dependency — every component lands in your repo as source you can read and edit.",
  },
  {
    id: "own",
    title: "Do I own the code I paste?",
    content:
      "Yes. Once a component is in your project it is your file. Rename it, gut it, ship it in client work — there is nothing to attribute and nothing to license.",
  },
  {
    id: "updates",
    title: "What happens when a component updates?",
    content:
      "Nothing, until you decide. Pasted files never change under you. Re-run the CLI on a component when you want the newer version and diff it like any other change.",
  },
  {
    id: "motion",
    title: "Is animation required?",
    content:
      "Components are animated by default and every one honours prefers-reduced-motion. Where motion is a prop, turning it off leaves a static component that still looks finished.",
  },
  {
    id: "tailwind",
    title: "Which Tailwind version does it need?",
    content:
      "Tailwind v4. Components ship as utility classes plus the odd CSS variable — no config plugin, no theme file to merge, no build step of ours in your pipeline.",
  },
  {
    id: "dark",
    title: "Does it work in dark mode?",
    content:
      "Every component carries its own light and dark styling through the dark: variant, so it follows whatever theme switch your app already uses.",
  },
];

/** Solid panel so the rows read against a surface, not the stage's dot grid. */
function Surface({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
      {children}
    </div>
  );
}

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/accordion"),
  export: "Accordion",
  componentName: "Accordion",
  importPath: "@/components/lazy-ui/accordion",
  stageMinHeight: 600,
  // `layout="split"` is a container query, not a media query — the width handle
  // is how you prove the heading column folds on its own.
  responsive: true,
  cardRender: (v) => (
    <div className="flex h-full w-full items-center px-5">
      <Accordion
        items={DEMO.slice(0, 3)}
        variant={(v.variant ?? "line") as AccordionVariant}
        icon={(v.icon ?? "chevron") as AccordionIcon}
        size="sm"
        defaultOpen={0}
        indicator={(v.indicator ?? false) as boolean}
      />
    </div>
  ),
  render: (v) => (
    <div className="flex min-h-[560px] w-full items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[980px]">
        <Surface>
          <Accordion
            items={DEMO}
            heading="Frequently asked questions"
            description={
              <>
                Anything else, write to{" "}
                <a
                  href="mailto:hello@lazy-ui.dev"
                  className="text-black underline underline-offset-4 transition-opacity hover:opacity-70 dark:text-white"
                >
                  hello@lazy-ui.dev
                </a>
                .
              </>
            }
            layout={(v.layout ?? "split") as AccordionLayout}
            variant={(v.variant ?? "line") as AccordionVariant}
            icon={(v.icon ?? "chevron") as AccordionIcon}
            mode={(v.mode ?? "single") as AccordionMode}
            size={(v.size ?? "md") as AccordionSize}
            speed={(v.speed ?? 1) as number}
            numbered={(v.numbered ?? false) as boolean}
            indicator={(v.indicator ?? false) as boolean}
            defaultOpen={0}
          />
        </Surface>
      </div>
    </div>
  ),
  controls: [
    select(
      "layout",
      "Layout",
      [
        { value: "split", label: "Split heading" },
        { value: "stacked", label: "Stacked" },
      ],
      "split",
    ),
    select(
      "variant",
      "Variant",
      [
        { value: "line", label: "Hairlines" },
        { value: "card", label: "Cards" },
      ],
      "line",
    ),
    select(
      "icon",
      "Icon",
      [
        { value: "chevron", label: "Chevron" },
        { value: "plus", label: "Plus → cross" },
        { value: "minus", label: "Plus → minus" },
        { value: "none", label: "None" },
      ],
      "chevron",
    ),
    select(
      "mode",
      "Mode",
      [
        { value: "single", label: "One at a time" },
        { value: "multiple", label: "Many open" },
      ],
      "single",
    ),
    select(
      "size",
      "Size",
      [
        { value: "sm", label: "Small" },
        { value: "md", label: "Medium" },
        { value: "lg", label: "Large" },
      ],
      "md",
    ),
    slider("speed", "Speed", {
      min: 0.25,
      max: 2.5,
      step: 0.05,
      defaultValue: 1,
      format: fmtX,
    }),
    toggle("numbered", "Numbered", false),
    toggle("indicator", "Rail", false),
  ],
};
