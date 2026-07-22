"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import {
  IntroPreloader,
  type IntroPreloaderExit,
} from "@/components/lazy-ui/intro-preloader";
import {
  select,
  slider,
  toggle,
} from "@/components/lazy/component-detail/controls";
import type { CustomizeValues } from "@/components/lazy/customize";
import type { ComponentView } from "@/components/lazy/component-view/types";

const GALLERY_IMAGES = Array.from(
  { length: 10 },
  (_, index) => `/images/Gallery/${index + 1}.webp`,
);

function IntroPreloaderScene({ values }: { values: CustomizeValues }) {
  const reduced = useReducedMotion();
  const stackCount = (values.stackCount ?? 6) as number;
  const minDuration = (values.minDuration ?? 3000) as number;
  const holdDuration = (values.holdDuration ?? 450) as number;
  const speed = (values.speed ?? 1) as number;
  const spread = (values.spread ?? 10) as number;
  const exit = (values.exit ?? "zoom") as IntroPreloaderExit;
  const counter = (values.counter ?? true) as boolean;
  const progressBar = (values.progressBar ?? true) as boolean;
  const meta = (values.meta ?? true) as boolean;

  const knobKey = [
    stackCount,
    minDuration,
    holdDuration,
    speed,
    spread,
    exit,
    counter,
    progressBar,
    meta,
  ].join("|");

  const [run, setRun] = useState(0);
  const [done, setDone] = useState(false);
  const [prevKey, setPrevKey] = useState(knobKey);
  if (prevKey !== knobKey) {
    setPrevKey(knobKey);
    setDone(false);
  }

  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <div className="relative h-full max-h-[520px] w-full max-w-[880px] overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
        <IntroPreloader
          key={`${run}:${knobKey}`}
          images={GALLERY_IMAGES}
          fullscreen={false}
          lockScroll={false}
          stackCount={stackCount}
          minDuration={minDuration}
          holdDuration={holdDuration}
          speed={speed}
          spread={spread}
          exit={exit}
          counter={counter}
          progressBar={progressBar}
          meta={meta}
          onComplete={() => setDone(true)}
        />
        {done ? (
          <motion.div
            key="replay"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <button
              type="button"
              onClick={() => {
                setDone(false);
                setRun((r) => r + 1);
              }}
              className="rounded-full border border-zinc-950/10 bg-white px-5 py-2.5 text-[13px] font-medium text-zinc-950 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus-visible:outline-zinc-50"
            >
              Replay
            </button>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}

// Natural size of the card scene. The full composition (giant type + photo
// pile) needs this much room; the card scales it down to fit.
const CARD_SCENE_W = 560;
const CARD_SCENE_H = 340;

/** Compact looping card for the `/all-component` gallery. */
function IntroPreloaderCard() {
  const [run, setRun] = useState(0);
  const timeoutRef = useRef(0);
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;
    const measure = () => {
      const availW = outer.clientWidth;
      const availH = outer.clientHeight;
      if (!availW || !availH) return;
      setScale(Math.min(availW / CARD_SCENE_W, availH / CARD_SCENE_H) * 0.94);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(outer);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={outerRef}
      className="flex h-full w-full items-center justify-center overflow-hidden"
    >
      <div
        className="relative shrink-0 overflow-hidden rounded-xl border border-zinc-950/10 bg-white dark:border-white/10 dark:bg-zinc-950"
        style={{
          width: CARD_SCENE_W,
          height: CARD_SCENE_H,
          transform: `scale(${scale})`,
          transformOrigin: "center",
        }}
      >
        <IntroPreloader
          key={run}
          images={GALLERY_IMAGES}
          fullscreen={false}
          lockScroll={false}
          stackCount={5}
          minDuration={2400}
          holdDuration={350}
          spread={12}
          onComplete={() => {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = window.setTimeout(
              () => setRun((r) => r + 1),
              900,
            );
          }}
        />
      </div>
    </div>
  );
}

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/intro-preloader"),
  export: "IntroPreloader",
  componentName: "IntroPreloader",
  importPath: "@/components/lazy-ui/intro-preloader",
  stageMinHeight: 600,
  record: true,
  cardRender: () => <IntroPreloaderCard />,
  render: (v) => <IntroPreloaderScene values={v} />,
  usageCode: `import { IntroPreloader } from "@/components/lazy-ui/intro-preloader";

const IMAGES = [
  "/images/gallery/01.webp",
  "/images/gallery/02.webp",
  "/images/gallery/03.webp",
  "/images/gallery/04.webp",
  "/images/gallery/05.webp",
  "/images/gallery/06.webp",
];

// Optional: your app's real loading manifest. Omit \`items\` and the
// ticker generates plausible file names instead.
const MANIFEST = ["bundle.js", "globals.css", "inter.woff2", "api/session"];

export default function Page() {
  return (
    <>
      <IntroPreloader
        images={IMAGES}
        items={MANIFEST}
        exit="zoom"
        onComplete={() => {
          // Overlay is gone — start hero animations here.
        }}
      />
      <main>{/* page content, revealed when the overlay exits */}</main>
    </>
  );
}`,
  api: [
    {
      name: "images",
      type: "string[]",
      description:
        "Image URLs to preload. Progress tracks how many have settled, and the same images feed the center photo pile.",
    },
    {
      name: "items",
      type: "string[]",
      default: "undefined",
      description:
        "Asset names ticked through the bottom-left line as progress advances — pass your app's real manifest (chunk names, fonts, API warmups). Falls back to a generated list of plausible file names.",
    },
    {
      name: "label",
      type: "string",
      default: '"Loading"',
      description:
        "Oversized status word at the top-left, with animated trailing dots. Pass an empty string to hide it.",
    },
    {
      name: "stackCount",
      type: "number",
      default: "6",
      description:
        "How many photos pile up in the center. Each lands as progress crosses its share of 100.",
    },
    {
      name: "minDuration",
      type: "number",
      default: "3000",
      description:
        "Floor on how fast the counter may finish, in milliseconds — cached loads still play the intro. Slow networks stall it honestly at the real load fraction.",
    },
    {
      name: "holdDuration",
      type: "number",
      default: "450",
      description:
        "Pause at 100 before the exit animation starts, in milliseconds.",
    },
    {
      name: "speed",
      type: "number",
      default: "1",
      description:
        "Multiplier on the photo pop and exit animations. 2 is twice as fast.",
    },
    {
      name: "spread",
      type: "number",
      default: "10",
      description:
        "Maximum tilt of a piled photo, in degrees. The final photo always lands straight. 0 stacks them perfectly.",
    },
    {
      name: "exit",
      type: '"zoom" | "wipe" | "fade"',
      default: '"zoom"',
      description:
        "How the overlay leaves. zoom scales into the photo pile and fades, wipe slides the panel up, fade is a plain dissolve.",
    },
    {
      name: "counter",
      type: "boolean",
      default: "true",
      description: "Show the oversized percent counter at the bottom-right.",
    },
    {
      name: "progressBar",
      type: "boolean",
      default: "true",
      description: "Show the hairline progress bar along the bottom edge.",
    },
    {
      name: "meta",
      type: "boolean",
      default: "true",
      description: "Show the asset-name ticker at the bottom-left.",
    },
    {
      name: "fullscreen",
      type: "boolean",
      default: "true",
      description:
        "Cover the viewport with position fixed. Set false to fill the nearest positioned ancestor instead — demos, embedded frames.",
    },
    {
      name: "lockScroll",
      type: "boolean",
      default: "true",
      description:
        "Lock document scrolling while the overlay covers the viewport. Fullscreen only.",
    },
    {
      name: "zIndex",
      type: "number",
      default: "50",
      description: "Stacking order of the fullscreen overlay.",
    },
    {
      name: "onComplete",
      type: "() => void",
      default: "undefined",
      description:
        "Fires once, after the exit animation has finished and the overlay has unmounted itself.",
    },
    {
      name: "className",
      type: "string",
      default: "undefined",
      description: "Optional class added to the overlay root.",
    },
  ],
  controls: [
    select(
      "exit",
      "Exit",
      [
        { value: "zoom", label: "Zoom" },
        { value: "wipe", label: "Wipe" },
        { value: "fade", label: "Fade" },
      ],
      "zoom",
    ),
    slider("stackCount", "Photos", {
      min: 3,
      max: 10,
      step: 1,
      defaultValue: 6,
      format: (n) => `${Math.round(n)}`,
    }),
    slider("minDuration", "Min duration", {
      min: 1200,
      max: 6000,
      step: 200,
      defaultValue: 3000,
      format: (n) => `${(n / 1000).toFixed(1)}s`,
    }),
    slider("holdDuration", "Hold at 100", {
      min: 200,
      max: 1500,
      step: 50,
      defaultValue: 450,
      format: (n) => `${Math.round(n)}ms`,
    }),
    slider("speed", "Speed", {
      min: 0.5,
      max: 2,
      step: 0.1,
      defaultValue: 1,
      format: (n) => `${n.toFixed(1)}×`,
    }),
    slider("spread", "Tilt spread", {
      min: 0,
      max: 22,
      step: 1,
      defaultValue: 10,
      format: (n) => `${Math.round(n)}°`,
    }),
    toggle("counter", "Counter", true),
    toggle("progressBar", "Progress bar", true),
    toggle("meta", "Asset ticker", true),
  ],
};
