import { ScrollImageCarousel } from "@/components/lazy-ui/scroll-image-carousel";
import {
  select,
  slider,
  toggle,
} from "@/components/lazy/component-detail/controls";
import type { ComponentView } from "@/components/lazy/component-view/types";

const GALLERY_IMAGES = Array.from({ length: 10 }, (_, index) => {
  const n = index + 1;
  return {
    src: `/images/Gallery/${n}.webp`,
    alt: `Gallery frame ${n}`,
  };
});

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/scroll-image-carousel"),
  export: "ScrollImageCarousel",
  componentName: "ScrollImageCarousel",
  importPath: "@/components/lazy-ui/scroll-image-carousel",
  stageMinHeight: 860,
  record: true,
  render: (v) => {
    const rows = Number(v.rows ?? "3") as 1 | 2 | 3;
    const speed = (v.speed ?? 1) as number;
    const copies = (v.copies ?? 5) as number;
    const cardWidth = (v.cardWidth ?? 170) as number;
    const randomize = (v.randomize ?? true) as boolean;
    const hoverFade = (v.hoverFade ?? true) as boolean;
    const hoverFadeRadius = (v.hoverFadeRadius ?? 4) as number;
    const hoverFadeIntensity = (v.hoverFadeIntensity ?? 0.42) as number;
    const hoverFadeMode = (v.hoverFadeMode ?? "all") as "row" | "all";
    const stopOnHover = (v.stopOnHover ?? true) as boolean;

    return (
      <div className="flex min-h-[820px] w-full items-center justify-center overflow-hidden bg-transparent p-4">
        <div className="w-full max-w-[980px] overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
          <ScrollImageCarousel
            images={GALLERY_IMAGES}
            rows={rows}
            speed={speed}
            copies={copies}
            cardWidth={cardWidth}
            randomize={randomize}
            hoverFade={hoverFade}
            hoverFadeRadius={hoverFadeRadius}
            hoverFadeIntensity={hoverFadeIntensity}
            hoverFadeMode={hoverFadeMode}
            stopOnHover={stopOnHover}
            aria-label="Randomized gallery carousel preview"
          />
        </div>
      </div>
    );
  },
  usageCode: `import { ScrollImageCarousel } from "@/components/lazy-ui/scroll-image-carousel";

const images = [
  { src: "/images/Gallery/1.webp", alt: "Gallery frame 1" },
  { src: "/images/Gallery/2.webp", alt: "Gallery frame 2" },
  { src: "/images/Gallery/3.webp", alt: "Gallery frame 3" },
];

export function Demo() {
  return (
    <ScrollImageCarousel
      images={images}
      rows={3}
      speed={1}
      copies={5}
      cardWidth={170}
      randomize={true}
      stopOnHover={true}
      hoverFade={true}
      hoverFadeMode="all"
      hoverFadeRadius={4}
      hoverFadeIntensity={0.42}
    />
  );
}`,
  api: [
    {
      name: "images",
      type: "{ src: string; alt?: string; caption?: string }[]",
      description: "Images rendered in the scrolling carousel.",
    },
    {
      name: "rows",
      type: "1 | 2 | 3",
      default: "2",
      description: "Number of marquee rows. Adjacent rows move opposite ways.",
    },
    {
      name: "speed",
      type: "number",
      default: "0.55",
      description: "Base marquee speed before scroll velocity boost is applied.",
    },
    {
      name: "copies",
      type: "number",
      default: "5",
      description: "Repeated copies of each row used to make the loop seamless.",
    },
    {
      name: "cardWidth",
      type: "number",
      default: "300",
      description: "Image card width in pixels. The card keeps a 3:4 ratio.",
    },
    {
      name: "randomize",
      type: "boolean",
      default: "true",
      description:
        "Shuffles the image order after client mount so every page load differs.",
    },
    {
      name: "hoverFade",
      type: "boolean",
      default: "true",
      description:
        "Fades and soft-blurs neighboring images while one image is hovered.",
    },
    {
      name: "hoverFadeRadius",
      type: "number",
      default: "4",
      description:
        "How many neighboring card steps participate in the center-out fade.",
    },
    {
      name: "hoverFadeIntensity",
      type: "number",
      default: "0.68",
      description:
        "Maximum fade strength applied to the farthest affected images.",
    },
    {
      name: "hoverFadeMode",
      type: '"row" | "all"',
      default: '"row"',
      description:
        "Whether hover fade affects only the current row or all rows.",
    },
    {
      name: "stopOnHover",
      type: "boolean",
      default: "false",
      description:
        "Pauses marquee motion while an image is hovered. With all-row fade mode, every row pauses.",
    },
    {
      name: "className",
      type: "string",
      default: "undefined",
      description: "Optional class added to the root section.",
    },
  ],
  controls: [
    select(
      "rows",
      "Rows",
      [
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "3", label: "3" },
      ],
      "3",
    ),
    slider("speed", "Speed", {
      min: 0.1,
      max: 1.4,
      step: 0.05,
      defaultValue: 1,
      format: (n) => n.toFixed(2),
    }),
    slider("copies", "Copies", {
      min: 2,
      max: 7,
      step: 1,
      defaultValue: 5,
      format: (n) => `${Math.round(n)}`,
    }),
    slider("cardWidth", "Card width", {
      min: 100,
      max: 220,
      step: 10,
      defaultValue: 170,
      format: (n) => `${Math.round(n)}px`,
    }),
    toggle("randomize", "Randomize", true),
    toggle("stopOnHover", "Stop on hover", true),
    toggle("hoverFade", "Hover fade", true),
    select(
      "hoverFadeMode",
      "Fade mode",
      [
        { value: "row", label: "Current row" },
        { value: "all", label: "All rows" },
      ],
      "all",
    ),
    slider("hoverFadeRadius", "Fade radius", {
      min: 1,
      max: 7,
      step: 1,
      defaultValue: 4,
      format: (n) => `${Math.round(n)}`,
    }),
    slider("hoverFadeIntensity", "Fade strength", {
      min: 0.2,
      max: 0.9,
      step: 0.02,
      defaultValue: 0.42,
      format: (n) => n.toFixed(2),
    }),
  ],
};
