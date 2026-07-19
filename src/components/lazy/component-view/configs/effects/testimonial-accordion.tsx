import {
  TestimonialAccordion,
  type Testimonial,
  type TestimonialAccordionTrigger,
} from "@/components/lazy-ui/testimonial-accordion";
import {
  select,
  slider,
  toggle,
} from "@/components/lazy/component-detail/controls";
import type { ComponentView } from "@/components/lazy/component-view/types";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

// Demo stories written in the Lazy-ui voice — copy-and-paste, animated by
// default, own every line. Fully fictional teams and people so no real quote
// is ever misattributed.
const DEMO: Testimonial[] = [
  {
    id: "brightfold",
    name: "Brightfold",
    description: "A developer tool with a landing page that converts.",
    quote:
      "Every component is animated by default and respects reduced motion. We deleted our own motion library and never looked back.",
    author: "Jonas Hale",
    role: "CEO, Brightfold",
    href: "#",
    accent: "#f0350f",
    logo: (
      <svg viewBox="0 0 24 24" {...stroke} aria-hidden>
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5Z" />
      </svg>
    ),
  },
  {
    id: "northwind",
    name: "Northwind",
    description: "From an empty repo to a launched fintech in a month.",
    quote:
      "Lazy-ui is just utility classes and files we own. No black-box dependency, no design debt — we build lazily and still look sharp.",
    author: "Aria Fontaine",
    role: "CTO, Northwind",
    href: "#",
    accent: "#4f46e5",
    logo: (
      <svg viewBox="0 0 24 24" {...stroke} aria-hidden>
        <path d="M14.54 21.69a.5.5 0 0 0 .94-.02l6.5-19a.5.5 0 0 0-.64-.64l-19 6.5a.5.5 0 0 0-.02.94l7.93 3.18a2 2 0 0 1 1.11 1.11Z" />
        <path d="M21.85 2.15 10.91 13.09" />
      </svg>
    ),
  },
  {
    id: "loomstack",
    name: "Loomstack",
    description: "An AI product that had to look finished on day one.",
    quote:
      "Our marketing site went from Figma to production in an afternoon. Copy, paste, done — it honestly felt like cheating.",
    author: "Sana Okoro",
    role: "Co-founder, Loomstack",
    href: "#",
    accent: "#1c1c1f",
    logo: (
      <svg viewBox="0 0 24 24" {...stroke} aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <path d="m8 16 8-8" />
      </svg>
    ),
  },
  {
    id: "paperkite",
    name: "Paperkite",
    description: "An analytics dashboard, shipped in a weekend.",
    quote:
      "We copied three blocks, changed the copy, and shipped. The animations were already there — we never wrote a single keyframe.",
    author: "Marcus Reed",
    role: "Founder, Paperkite",
    href: "#",
    accent: "#f97316",
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6L12 0Z" />
      </svg>
    ),
  },
  {
    id: "quillbeam",
    name: "Quillbeam",
    description: "The analytics layer for product-led teams.",
    quote:
      "We stopped maintaining our own UI kit and just paste what we need. 240+ blocks, and every one already feels finished.",
    author: "Nadia Ruiz",
    role: "Head of Engineering, Quillbeam",
    href: "#",
    accent: "#0a0a0a",
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <text
          x="12"
          y="18"
          textAnchor="middle"
          fontSize="20"
          fontWeight="800"
          fontFamily="inherit"
        >
          m
        </text>
      </svg>
    ),
  },
];

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/testimonial-accordion"),
  export: "TestimonialAccordion",
  componentName: "TestimonialAccordion",
  importPath: "@/components/lazy-ui/testimonial-accordion",
  stageMinHeight: 600,
  render: (v) => {
    const trigger = (v.trigger ?? "hover") as TestimonialAccordionTrigger;
    const speed = (v.speed ?? 1) as number;
    const autoplay = (v.autoplay ?? false) as boolean;
    const autoplayInterval = (v.autoplayInterval ?? 4000) as number;
    const collapsedWidth = (v.collapsedWidth ?? 64) as number;
    const gap = (v.gap ?? 12) as number;
    const height = (v.height ?? 500) as number;
    const radius = (v.radius ?? 16) as number;

    return (
      <div className="flex min-h-[560px] w-full items-center justify-center p-4">
        <div className="w-full max-w-[980px]">
          <TestimonialAccordion
            testimonials={DEMO}
            trigger={trigger}
            speed={speed}
            autoplay={autoplay}
            autoplayInterval={autoplayInterval}
            defaultIndex={3}
            collapsedWidth={collapsedWidth}
            gap={gap}
            height={height}
            radius={radius}
            aria-label="Customer testimonials"
          />
        </div>
      </div>
    );
  },
  usageCode: `import { TestimonialAccordion } from "@/components/lazy-ui/testimonial-accordion";

const testimonials = [
  {
    id: "paperkite",
    name: "Paperkite",
    description: "An analytics dashboard, shipped in a weekend.",
    quote:
      "We copied three blocks, changed the copy, and shipped. The animations were already there.",
    author: "Marcus Reed",
    role: "Founder, Paperkite",
    href: "#",
    accent: "#f97316",
  },
  {
    id: "northwind",
    name: "Northwind",
    description: "From an empty repo to a launched fintech in a month.",
    quote: "Lazy-ui is just utility classes and files we own. We build lazily and still look sharp.",
    author: "Aria Fontaine",
    role: "CTO, Northwind",
    href: "#",
    accent: "#4f46e5",
  },
];

export function Demo() {
  return (
    <TestimonialAccordion
      testimonials={testimonials}
      trigger="hover"
      speed={1}
      defaultIndex={0}
    />
  );
}`,
  api: [
    {
      name: "testimonials",
      type: "Testimonial[]",
      description:
        "Stories rendered as panels. Each carries name, description, quote, author, accent color, and an optional logo, avatar, role, and href.",
    },
    {
      name: "trigger",
      type: '"hover" | "click"',
      default: '"hover"',
      description:
        "How a collapsed panel expands. Keyboard focus and click always expand a panel regardless of this setting.",
    },
    {
      name: "speed",
      type: "number",
      default: "1",
      description:
        "Animation speed multiplier for the expand and reveal transitions. 2 is twice as fast, 0.5 half.",
    },
    {
      name: "autoplay",
      type: "boolean",
      default: "false",
      description:
        "Cycle the open panel on a timer. Pauses on hover/focus and is disabled under reduced-motion.",
    },
    {
      name: "autoplayInterval",
      type: "number",
      default: "4000",
      description: "Milliseconds each panel stays open while autoplaying.",
    },
    {
      name: "defaultIndex",
      type: "number",
      default: "0",
      description: "Index of the panel expanded on mount.",
    },
    {
      name: "collapsedWidth",
      type: "number",
      default: "64",
      description: "Width of a collapsed bar, in pixels.",
    },
    {
      name: "height",
      type: "number",
      default: "500",
      description: "Panel height, in pixels.",
    },
    {
      name: "gap",
      type: "number",
      default: "12",
      description: "Space between panels, in pixels.",
    },
    {
      name: "radius",
      type: "number",
      default: "16",
      description: "Corner radius of each panel, in pixels.",
    },
    {
      name: "linkLabel",
      type: "string",
      default: '"Read the story"',
      description: "Label for the per-story link shown when href is set.",
    },
    {
      name: "className",
      type: "string",
      default: "undefined",
      description: "Optional class added to the root flex row.",
    },
  ],
  controls: [
    select(
      "trigger",
      "Trigger",
      [
        { value: "hover", label: "Hover" },
        { value: "click", label: "Click" },
      ],
      "hover",
    ),
    slider("speed", "Speed", {
      min: 0.05,
      max: 2.5,
      step: 0.05,
      defaultValue: 0.2,
      format: (n) => `${n.toFixed(1)}×`,
    }),
    slider("autoplayInterval", "Autoplay interval", {
      min: 2000,
      max: 8000,
      step: 500,
      defaultValue: 4000,
      format: (n) => `${(n / 1000).toFixed(1)}s`,
    }),
    slider("collapsedWidth", "Collapsed width", {
      min: 40,
      max: 100,
      step: 2,
      defaultValue: 64,
      format: (n) => `${Math.round(n)}px`,
    }),
    slider("gap", "Gap", {
      min: 0,
      max: 24,
      step: 2,
      defaultValue: 12,
      format: (n) => `${Math.round(n)}px`,
    }),
    slider("height", "Height", {
      min: 380,
      max: 560,
      step: 10,
      defaultValue: 500,
      format: (n) => `${Math.round(n)}px`,
    }),
    slider("radius", "Radius", {
      min: 8,
      max: 28,
      step: 1,
      defaultValue: 16,
      format: (n) => `${Math.round(n)}px`,
    }),
    toggle("autoplay", "Autoplay", false),
  ],
};
