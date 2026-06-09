"use client";

import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useReducedMotion,
} from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";

import { GridBackground } from "@/components/lazy-ui/grid-background";
import type { ComponentItem } from "@/registry/components";

import { NEW_SLUGS } from "./sidebar";
import { useScrollReveal } from "./use-scroll-reveal";

/** Per-card stagger — capped so the "All" view (36 cards) still feels snappy.
 *  Two separate sets because exit is faster than enter (cards "sweep back to
 *  the deck", then "deal out" more slowly). */
const ENTER_STEP = 0.028;
const ENTER_MAX_STEPS = 16;
const ENTER_DURATION = 0.42;
const EXIT_STEP = 0.014;
const EXIT_MAX_STEPS = 12;
const EXIT_DURATION = 0.28;
const ANIMATION_EASE = [0.16, 1, 0.3, 1] as const;

/** Scale at the "deck" position. Cards collapse to ~30% size before fanning. */
const COLLAPSE_SCALE = 0.3;
/** Fallback offset used until useLayoutEffect measures the real position
 *  of card[0]. Negative = upper-left. */
const COLLAPSE_FALLBACK = { x: -60, y: -30 };

const UNMOUNT_DEBOUNCE_MS = 300;
const ROOT_MARGIN = "600px 0px";
const RESERVED_HEIGHT = 260;

function PreviewSkeleton() {
  return (
    <div className="showcase-skeleton" aria-hidden>
      <span className="showcase-skeleton-dot" />
      <span className="showcase-skeleton-dot" />
      <span className="showcase-skeleton-dot" />
    </div>
  );
}

/** Per-slug dynamic loader → each preview ships in its own webpack chunk. */
function lazyPreview(loader: () => Promise<ComponentType>): ComponentType {
  return dynamic(loader, {
    ssr: false,
    loading: () => <PreviewSkeleton />,
  });
}

/** Fills the card edge-to-edge — used for backgrounds. */
function Fill({ children }: { children: ReactNode }) {
  return <div className="absolute inset-0">{children}</div>;
}

/**
 * Compact grid previews. Each entry renders the bare lazy-ui component
 * sized for a ~220px tall card — distinct from the heavier detail-page
 * previews in `./component-detail/.../preview.tsx`, which assume a full
 * 520+ px stage.
 */
const PREVIEW_FOR: Record<string, ComponentType> = {
  // ─── Component (Navigation / Buttons / Forms / Feedback / Overlay) ───
  "animated-tabs": lazyPreview(async () => {
    const { AnimatedTabs } = await import("@/components/lazy-ui/animated-tabs");
    return function AnimatedTabsPreview() {
      return (
        <AnimatedTabs
          className="w-[240px]"
          tabs={[
            {
              value: "preview",
              label: "Preview",
              content: <TabPanel label="Preview" />,
            },
            {
              value: "code",
              label: "Code",
              content: <TabPanel label="Code" />,
            },
          ]}
        />
      );
    };
  }),
  "copy-button": lazyPreview(async () => {
    const { CopyButton } = await import("@/components/lazy-ui/copy-button");
    return function CopyButtonPreview() {
      return (
        <div className="rounded-xl border border-white/10 bg-neutral-900/80 px-4 py-3">
          <CopyButton
            content="npm install lazy-ui"
            text
            label="Copy"
            className="text-xs text-neutral-200"
          />
        </div>
      );
    };
  }),
  "github-stars-button": lazyPreview(async () => {
    const { GithubStarsButton } = await import(
      "@/components/lazy-ui/github-stars-button"
    );
    return function GithubStarsButtonPreview() {
      return (
        <GithubStarsButton
          username="shadcn-ui"
          repo="ui"
          showCount
          fetchStars={false}
          displayFormat="compact"
        />
      );
    };
  }),
  "flip-button": lazyPreview(async () => {
    const { FlipButton } = await import("@/components/lazy-ui/flip-button");
    return function FlipButtonPreview() {
      return (
        <FlipButton
          front="Deploy"
          reveal="Ship it"
          from="top"
          palette="sky"
          className="h-10 min-w-32 text-xs"
        />
      );
    };
  }),
  "image-zoom": lazyPreview(async () => {
    const { Image, ImageZoom } = await import(
      "@/components/lazy-ui/image-zoom"
    );
    return function ImageZoomPreview() {
      return (
        <div className="h-full w-full p-5">
          <ImageZoom
            zoomScale={2.2}
            duration={380}
            className="h-full w-full rounded-xl"
            aria-label="Image zoom preview"
          >
            <Image
              src="/images/caitlyn.jpg"
              alt="Portrait preview"
              objectFit="cover"
            />
          </ImageZoom>
        </div>
      );
    };
  }),
  "spectral-card": lazyPreview(async () => {
    const { SpectralCard } = await import("@/components/lazy-ui/spectral-card");
    return function SpectralCardPreview() {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-black p-4">
          <SpectralCard
            media="/images/piano-girl.webp"
            width={120}
            height={213}
            tone="aqua"
            corner={16}
            restZoom={0.08}
            hoverZoom={0.22}
            spectrum={0.68}
            displace={0.78}
            gloss={0.5}
            tiltDepth={8}
            hoverDuration={1.6}
            motionDuration={0.38}
            className="max-h-full max-w-full"
          >
            <div className="flex h-full items-end bg-gradient-to-t from-black/65 via-transparent to-transparent p-5 text-white">
              <span className="text-2xl font-light tracking-normal">
                Spectral
              </span>
            </div>
          </SpectralCard>
        </div>
      );
    };
  }),
  "smooth-cursor": lazyPreview(async () => {
    const { SmoothCursor } = await import("@/components/lazy-ui/smooth-cursor");
    return function SmoothCursorPreview() {
      return (
        <div className="h-full w-full p-5">
          <SmoothCursor
            trigger="always"
            label="Cursor"
            color="#f97316"
            className="flex h-full w-full items-center justify-center rounded-xl border border-white/10 bg-neutral-950"
          >
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-black">
              Hover
            </span>
          </SmoothCursor>
        </div>
      );
    };
  }),
  "glass-button": lazyPreview(async () => {
    const { GlassButton } = await import("@/components/lazy-ui/glass-button");
    return function GlassButtonPreview() {
      return (
        <div className="relative flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_30%,#7c3aed_0%,#1e1b4b_50%,#020617_100%)]">
          <GlassButton size="sm">Glass</GlassButton>
        </div>
      );
    };
  }),
  progress: lazyPreview(async () => {
    const { Progress } = await import("@/components/lazy-ui/progress");
    return function ProgressPreview() {
      return <Progress value={60} effect="glow" className="w-44" />;
    };
  }),
  "spring-icon-loader": lazyPreview(async () => {
    const {
      SPRING_ICON_LOADER_DEFAULT_ICONS,
      SpringIconLoader,
    } = await import("@/components/lazy-ui/spring-icon-loader");
    return function SpringIconLoaderPreview() {
      return (
        <SpringIconLoader
          icons={SPRING_ICON_LOADER_DEFAULT_ICONS}
          size={46}
          bounceHeight={48}
          gravity={1700}
          stretch={0.11}
          tilt={8}
        />
      );
    };
  }),
  switch: lazyPreview(async () => {
    const { Switch } = await import("@/components/lazy-ui/switch");
    return function SwitchPreview() {
      return <Switch defaultChecked id="switch-grid-preview" />;
    };
  }),
  checkbox: lazyPreview(async () => {
    const { Checkbox } = await import("@/components/lazy-ui/checkbox");
    return function CheckboxPreview() {
      return <Checkbox defaultChecked id="checkbox-grid-preview" />;
    };
  }),
  "animate-tooltip": lazyPreview(async () => {
    const { AnimateTooltip } = await import(
      "@/components/lazy-ui/animate-tooltip"
    );
    return function AnimateTooltipPreview() {
      return (
        <AnimateTooltip content="Hello from the tooltip!">
          <button
            type="button"
            className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-black"
          >
            Hover me
          </button>
        </AnimateTooltip>
      );
    };
  }),

  // ─── Animate ───
  counter: lazyPreview(async () => {
    const { Counter } = await import("@/components/lazy-ui/counter");
    return function CounterPreview() {
      const [count, setCount] = useState(0);
      useEffect(() => {
        const frame = requestAnimationFrame(() => setCount(12848));
        return () => cancelAnimationFrame(frame);
      }, []);
      return (
        <Counter
          value={count}
          separator=","
          effect="3d"
          className="text-3xl font-semibold tracking-normal text-[var(--text)]"
        />
      );
    };
  }),
  "reveal-animate": lazyPreview(async () => {
    const { RevealAnimate } = await import(
      "@/components/lazy-ui/reveal-animate"
    );
    return function RevealAnimatePreview() {
      return (
        <RevealAnimate className="text-lg font-light text-[var(--text)]">
          Reveal me
        </RevealAnimate>
      );
    };
  }),
  "bling-transition": lazyPreview(async () => {
    const { BlingTransition } = await import(
      "@/components/lazy-ui/bling-transition"
    );
    return function BlingTransitionPreview() {
      return (
        <Fill>
          <BlingTransition
            imageA="/images/caitlyn.jpg"
            imageB="/images/no-caitlyn.jpg"
            palette="iris"
          />
        </Fill>
      );
    };
  }),
  "border-glow": lazyPreview(async () => {
    const { BorderGlow } = await import("@/components/lazy-ui/border-glow");
    return function BorderGlowPreview() {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_30%,#141016_0%,#050505_70%)] p-6">
          <BorderGlow
            mode="auto"
            colors={["#a78bfa", "#f0abfc", "#67e8f9"]}
            radius={16}
            thickness={1.5}
            coneSpread={64}
            glowSize={18}
            sparkleCount={5}
            className="w-full max-w-[220px]"
          >
            <div className="flex flex-col gap-1.5 p-5">
              <span className="text-[9px] font-medium tracking-[0.2em] text-white/55 uppercase">
                Border glow
              </span>
              <span className="text-base font-semibold tracking-tight text-white">
                Built to feel finished.
              </span>
            </div>
          </BorderGlow>
        </div>
      );
    };
  }),
  "circle-cipher": lazyPreview(async () => {
    const { CircleCipher } = await import(
      "@/components/lazy-ui/circle-cipher"
    );
    return function CircleCipherPreview() {
      return (
        <Fill>
          <CircleCipher color="#a3a3a3" size={18} className="h-full w-full" />
        </Fill>
      );
    };
  }),
  "liquid-reveal": lazyPreview(async () => {
    const { LiquidReveal } = await import("@/components/lazy-ui/liquid-reveal");
    return function LiquidRevealPreview() {
      return (
        <Fill>
          <LiquidReveal
            frontImage="/images/armor.png"
            backImage="/images/human.png"
            autoDemo
            autoSpeed={0.5}
            resolution={0.4}
          />
        </Fill>
      );
    };
  }),
  "liquid-transition": lazyPreview(async () => {
    const { LiquidTransition } = await import(
      "@/components/lazy-ui/liquid-transition"
    );
    return function LiquidTransitionPreview() {
      return (
        <Fill>
          <LiquidTransition
            imageA="/images/liqid-hole-dark.png"
            imageB="/images/liqid-hole-light.png"
          />
        </Fill>
      );
    };
  }),
  "matrix-grid": lazyPreview(async () => {
    const { MatrixGrid } = await import("@/components/lazy-ui/matrix-grid");
    return function MatrixGridPreview() {
      return (
        <Fill>
          <MatrixGrid
            colors={["#d4d4d4", "#ffffff"]}
            dotSize={2}
            gap={4}
            revealAngle={180}
            coverage={0.85}
            animate={{ name: "sparkle", duration: 3 }}
            className="absolute inset-0 bg-black"
          />
        </Fill>
      );
    };
  }),
  "pixel-cursor": lazyPreview(async () => {
    const { PixelCursor } = await import("@/components/lazy-ui/pixel-cursor");
    return function PixelCursorPreview() {
      return (
        <Fill>
          <PixelCursor
            color="#ffffff"
            edgeColor1="#7c3aed"
            edgeColor2="#22d3ee"
            pixelSize={7}
            className="absolute inset-0 bg-black"
          />
        </Fill>
      );
    };
  }),

  "particle-halo": lazyPreview(async () => {
    const { ParticleHalo } = await import("@/components/lazy-ui/particle-halo");
    return function ParticleHaloPreview() {
      // Root only has `relative w-full overflow-hidden` — must pass h-full
      // for the canvas to claim card height. bg-black so silver particles
      // read against something.
      return (
        <Fill>
          <ParticleHalo
            colors={["#a3a3a3", "#ffffff"]}
            shape="circle"
            mode="wave"
            particleCount={800}
            glow
            className="h-full w-full bg-black"
          />
        </Fill>
      );
    };
  }),
  "stack-list": lazyPreview(async () => {
    const { StackList } = await import("@/components/lazy-ui/stack-list");
    const items = [
      {
        id: "a",
        content: (
          <div className="text-[12px] text-black/85 dark:text-white/85">
            Deploy passed ·{" "}
            <span className="text-neutral-500 dark:text-neutral-400">main</span>
          </div>
        ),
      },
      {
        id: "b",
        content: (
          <div className="text-[12px] text-black/85 dark:text-white/85">
            PR ready ·{" "}
            <span className="text-neutral-500 dark:text-neutral-400">#482</span>
          </div>
        ),
      },
      {
        id: "c",
        content: (
          <div className="text-[12px] text-black/85 dark:text-white/85">
            Daily report sent
          </div>
        ),
      },
    ];
    return function StackListPreview() {
      return (
        <Fill>
          <StackList
            items={items}
            animation="blur"
            enterFrom="top"
            autoInsertDelay={2200}
            maxItems={5}
            stackDepth={3}
            hoverEffect="lift"
            clickEffect="ripple"
            pauseOnHover
            height="100%"
          />
        </Fill>
      );
    };
  }),

  // ─── Text Animate ───
  "shiny-text": lazyPreview(async () => {
    const { ShinyText } = await import(
      "@/components/lazy-ui/text-animate/shiny-text"
    );
    return function ShinyTextPreview() {
      return (
        <ShinyText className="text-2xl font-semibold text-[var(--text)]">
          Shiny Text
        </ShinyText>
      );
    };
  }),
  "spinning-text": lazyPreview(async () => {
    const { SpinningText } = await import(
      "@/components/lazy-ui/text-animate/spinning-text"
    );
    return function SpinningTextPreview() {
      return (
        <SpinningText
          radius={4}
          duration={12}
          className="text-xs font-medium text-[var(--text)]"
        >
          {"lazy-ui • build lazily • "}
        </SpinningText>
      );
    };
  }),
  "text-flip": lazyPreview(async () => {
    const { TextFlip } = await import(
      "@/components/lazy-ui/text-animate/text-flip"
    );
    return function TextFlipPreview() {
      return (
        <TextFlip
          text="Hover to flip"
          trigger="hover"
          className="cursor-default text-2xl font-light text-[var(--text)]"
        />
      );
    };
  }),
  "text-rise": lazyPreview(async () => {
    const { TextRise } = await import(
      "@/components/lazy-ui/text-animate/text-rise"
    );
    return function TextRisePreview() {
      return (
        <TextRise
          text="Rise up"
          className="text-2xl font-light text-[var(--text)]"
        />
      );
    };
  }),
  "text-scramble": lazyPreview(async () => {
    const { TextScramble } = await import(
      "@/components/lazy-ui/text-animate/text-scramble"
    );
    return function TextScramblePreview() {
      return (
        <TextScramble
          text="Scramble"
          trigger="hover"
          className="cursor-default text-2xl font-light text-[var(--text)]"
        />
      );
    };
  }),
  "text-spin": lazyPreview(async () => {
    const { TextSpin } = await import(
      "@/components/lazy-ui/text-animate/text-spin"
    );
    return function TextSpinPreview() {
      return (
        <TextSpin
          text="Spin"
          className="text-2xl font-light text-[var(--text)]"
        />
      );
    };
  }),
  "text-warp": lazyPreview(async () => {
    const { TextWarp } = await import(
      "@/components/lazy-ui/text-animate/text-warp"
    );
    return function TextWarpPreview() {
      return (
        <TextWarp
          text="Warp"
          className="text-2xl font-light text-[var(--text)]"
        />
      );
    };
  }),

  // ─── Device Mocks ───
  iphone: lazyPreview(async () => {
    const { Iphone } = await import(
      "@/components/lazy-ui/device-mocks/iphone"
    );
    return function IphonePreview() {
      return (
        <div style={{ width: 95 }}>
          <Iphone src="/ip.png" statusBar={false} homeIndicator={false} />
        </div>
      );
    };
  }),

  // ─── Background — fill the card edge-to-edge ───
  "grid-background": lazyPreview(async () => {
    const { GridBackground } = await import(
      "@/components/lazy-ui/grid-background"
    );
    return function GridBackgroundPreview() {
      return (
        <Fill>
          <div className="absolute inset-0 bg-[#050505]">
            <GridBackground
              variant="dots"
              size={22}
              dotSize={3}
              color="rgba(255,255,255,0.18)"
              fade="edges"
            />
          </div>
        </Fill>
      );
    };
  }),
  "aurora-mesh": lazyPreview(async () => {
    const { AuroraMesh } = await import("@/components/lazy-ui/aurora-mesh");
    return function AuroraMeshPreview() {
      return (
        <Fill>
          <AuroraMesh className="h-full w-full" />
        </Fill>
      );
    };
  }),
  "chroma-flow": lazyPreview(async () => {
    const { ChromaFlow } = await import("@/components/lazy-ui/chroma-flow");
    return function ChromaFlowPreview() {
      return (
        <Fill>
          <ChromaFlow className="h-full w-full" />
        </Fill>
      );
    };
  }),
  "horizon-cipher": lazyPreview(async () => {
    const { HorizonCipher } = await import(
      "@/components/lazy-ui/horizon-cipher"
    );
    return function HorizonCipherPreview() {
      return (
        <Fill>
          <HorizonCipher className="h-full w-full" />
        </Fill>
      );
    };
  }),
  "liquid-chrome": lazyPreview(async () => {
    const { LiquidChrome } = await import("@/components/lazy-ui/liquid-chrome");
    return function LiquidChromePreview() {
      // Match detail-page defaults: nightfire palette + the tuned light/warp set.
      return (
        <Fill>
          <LiquidChrome
            palette="nightfire"
            speed={0.45}
            scale={0.8}
            warp={0.45}
            relief={0.85}
            tilt={45}
            highlight={1.45}
            roughness={0.58}
            ambient={0.28}
            className="h-full w-full"
          />
        </Fill>
      );
    };
  }),
  "orbit-bloom": lazyPreview(async () => {
    const { OrbitBloom } = await import("@/components/lazy-ui/orbit-bloom");
    return function OrbitBloomPreview() {
      // Ripple effect + wine/purple palette so it reads as the "shape-based
      // sibling" of orbit-cipher, not a duplicate.
      return (
        <Fill>
          <OrbitBloom
            effect="ripple"
            columns={59}
            rows={32}
            waveFrequency={4}
            wavePower={7}
            spiralArms={11}
            falloff={1.8}
            baseAlpha={0.18}
            colorSpeed={3.1}
            shape={0.85}
            fillRatio={0.6}
            color1="#7a1f3d"
            color2="#93229D"
            className="h-full w-full"
          />
        </Fill>
      );
    };
  }),
  "orbit-cipher": lazyPreview(async () => {
    const { OrbitCipher } = await import("@/components/lazy-ui/orbit-cipher");
    return function OrbitCipherPreview() {
      // Spiral effect + violet/pink palette — matches detail-page identity.
      return (
        <Fill>
          <OrbitCipher
            effect="spiral"
            columns={36}
            rows={22}
            wavePower={4}
            spiralArms={3}
            falloff={1.5}
            baseAlpha={0.05}
            color1="#7c3aed"
            color2="#f0abfc"
            className="h-full w-full"
          />
        </Fill>
      );
    };
  }),
  "orbit-mesh": lazyPreview(async () => {
    const { OrbitMesh } = await import("@/components/lazy-ui/orbit-mesh");
    return function OrbitMeshPreview() {
      // Detail-page defaults: wave effect + violet tint, slow + soft.
      return (
        <Fill>
          <OrbitMesh
            effect="wave"
            speed={0.5}
            scale={0.4}
            colorLayers={3}
            spiralArms={5}
            waveIntensity={0.22}
            spiralIntensity={2}
            lineThickness={0.13}
            falloff={1.65}
            brightness={3}
            colorTint="#7c3aed"
            className="h-full w-full"
          />
        </Fill>
      );
    };
  }),
  neumorphism: lazyPreview(async () => {
    const { Neumorphism } = await import("@/components/lazy-ui/neumorphism");
    return function NeumorphismPreview() {
      return (
        <Fill>
          <Neumorphism className="h-full w-full" />
        </Fill>
      );
    };
  }),
  "prism-drift": lazyPreview(async () => {
    const { PrismDrift } = await import("@/components/lazy-ui/prism-drift");
    return function PrismDriftPreview() {
      return (
        <Fill>
          <PrismDrift className="h-full w-full" />
        </Fill>
      );
    };
  }),
  "ripple-surface": lazyPreview(async () => {
    const { RippleSurface } = await import(
      "@/components/lazy-ui/ripple-surface"
    );
    return function RippleSurfacePreview() {
      return (
        <Fill>
          <RippleSurface className="h-full w-full" />
        </Fill>
      );
    };
  }),
  "shadow-mesh": lazyPreview(async () => {
    const { ShadowMesh } = await import("@/components/lazy-ui/shadow-mesh");
    return function ShadowMeshPreview() {
      // Default plume is dark on transparent — invisible against the card's
      // dark bg. Bake in a light surface so the shadow has something to fall
      // on, matching the detail preview's "smoke on ash" look.
      return (
        <Fill>
          <ShadowMesh
            className="h-full w-full"
            style={{
              background:
                "linear-gradient(180deg, #f4f4f4 0%, #d4d4d4 60%, #a3a3a3 100%)",
            }}
          />
        </Fill>
      );
    };
  }),
  "slime-background": lazyPreview(async () => {
    const { SlimeBackground } = await import(
      "@/components/lazy-ui/slime-background"
    );
    return function SlimeBackgroundPreview() {
      return (
        <Fill>
          <SlimeBackground className="h-full w-full" />
        </Fill>
      );
    };
  }),
  "wave-cipher": lazyPreview(async () => {
    const { WaveCipher } = await import("@/components/lazy-ui/wave-cipher");
    return function WaveCipherPreview() {
      return (
        <Fill>
          <WaveCipher className="h-full w-full" />
        </Fill>
      );
    };
  }),
};

function TabPanel({ label }: { label: string }) {
  return (
    <div className="flex h-20 items-center justify-center text-xs text-[var(--text-2)]">
      {label} pane
    </div>
  );
}

/**
 * Each card lazy-mounts its preview when it enters a 600px viewport buffer
 * and unmounts again when it leaves — releasing memory and stopping any
 * RAF/timers/observers the preview owns.
 *
 * `active` gates the IntersectionObserver. Parent `<AnimatedCard>` keeps
 * `active=false` during the deal animation so heavy canvas/WebGL previews
 * don't start work while the card is mid-transform; once enter completes,
 * `active` flips true and the IO kicks in. Skeleton stays visible the
 * whole time the card is "in flight".
 */
function ShowcaseCard({
  item,
  active = true,
}: {
  item: ComponentItem;
  active?: boolean;
}) {
  const Preview = PREVIEW_FOR[item.slug];
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // active=false → skip IO setup; `mounted` stays at its initial `false`
    // so the skeleton remains during the deal animation.
    if (!active) return;
    if (typeof IntersectionObserver === "undefined") {
      const fallback = window.setTimeout(() => setMounted(true), 0);
      return () => clearTimeout(fallback);
    }
    const el = cardRef.current;
    if (!el) return;

    let unmountTimer: number | undefined;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (unmountTimer !== undefined) {
              clearTimeout(unmountTimer);
              unmountTimer = undefined;
            }
            // Skeleton was already on screen during the animation —
            // no need to honor LOADING_MIN_MS; mount as soon as in viewport.
            setMounted(true);
          } else if (unmountTimer === undefined) {
            unmountTimer = window.setTimeout(() => {
              setMounted(false);
              unmountTimer = undefined;
            }, UNMOUNT_DEBOUNCE_MS);
          }
        }
      },
      { rootMargin: ROOT_MARGIN },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (unmountTimer !== undefined) clearTimeout(unmountTimer);
    };
  }, [active]);

  return (
    <div
      ref={cardRef}
      className="showcase-card"
      style={{ containIntrinsicSize: `auto ${RESERVED_HEIGHT}px` }}
    >
      <div className="showcase-preview" aria-hidden>
        {/* `zIndex: -1` parks the grid behind any preview that internally
            uses `absolute inset-0` (canvas backgrounds, etc.) without forcing
            those previews to opt in to stacking. */}
        <GridBackground
          variant="dashed"
          size={40}
          dotSize={3}
          color="var(--preview-grid)"
          style={{ zIndex: -1 }}
        />
        {mounted && Preview ? <Preview /> : <PreviewSkeleton />}
      </div>
      <Link href={`/components/${item.slug}`} className="showcase-foot">
        <span className="showcase-foot-name">{item.title}</span>
        <svg
          className="showcase-foot-arrow"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M7 17 17 7M7 7h10v10" />
        </svg>
      </Link>
    </div>
  );
}

/**
 * Card display order — components are bucketed so similar primitives sit
 * together. Registry order is preserved within each bucket.
 */
const BUCKETS: ReadonlyArray<{
  label: string;
  categories: ReadonlyArray<string>;
}> = [
    {
      label: "Components",
      categories: [
        "Navigation",
        "Buttons",
        "Forms",
        "Feedback",
        "Overlay",
        "Effects",
        "Device Mocks",
      ],
    },
    { label: "Text", categories: ["Text Animate"] },
    { label: "Animate", categories: ["Animate"] },
    { label: "Backgrounds", categories: ["Background"] },
  ];

function bucketIndex(category: string): number {
  for (let i = 0; i < BUCKETS.length; i++) {
    if (BUCKETS[i].categories.includes(category)) return i;
  }
  return BUCKETS.length;
}

export function ComponentsGrid({ items }: { items: ComponentItem[] }) {
  useScrollReveal();
  const searchParams = useSearchParams();

  const grouped = useMemo(() => {
    const groups: ComponentItem[][] = BUCKETS.map(() => []);
    for (const item of items) {
      const idx = bucketIndex(item.category);
      if (idx < BUCKETS.length) groups[idx].push(item);
    }
    return groups;
  }, [items]);

  // Items currently flagged in the sidebar `New` badge set. Preserves
  // registry order rather than `NEW_SLUGS` iteration order.
  const newItems = useMemo(
    () => items.filter((it) => NEW_SLUGS.has(it.slug)),
    [items],
  );

  // `all` shows every bucket with its heading. `new` shows just the newly
  // landed components in a flat grid. Anything else is an index into BUCKETS.
  // The initial tab honors `?tab=…` so the header/hero "New X updates" links
  // land users directly on the New tab.
  const initialTab = searchParams?.get("tab") === "new" ? "new" : "all";
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const tabs = useMemo(
    () => [
      { id: "all", label: "All", count: items.length },
      { id: "new", label: "New", count: newItems.length },
      ...BUCKETS.map((b, i) => ({
        id: String(i),
        label: b.label,
        count: grouped[i].length,
      })),
    ],
    [items.length, newItems.length, grouped],
  );

  return (
    <main className="main">
      <div className="crumb reveal">
        <Link href="/">Home</Link>
        <span className="sep">›</span>
        <span className="cur">Components</span>
      </div>

      <h1
        className="page-title reveal"
        style={{ fontSize: 64, textAlign: "left" }}
      >
        Components
      </h1>
      <p className="page-sub reveal d-1">
        {items.length} polished primitives. Live preview, source on tap, one
        command to install.
      </p>

      <nav
        role="tablist"
        aria-label="Component categories"
        className="showcase-tabs reveal d-2"
      >
        {tabs.map((t) => {
          const active = t.id === activeTab;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(t.id)}
              className={`showcase-tab${active ? " is-active" : ""}`}
            >
              {t.label}
              <span className="showcase-tab-count">{t.count}</span>
            </button>
          );
        })}
      </nav>

      {/* `AnimatePresence mode="wait"` lets the outgoing panel's motion.div
          children play their exit (sweep-to-deck) animations before the
          incoming panel's children deal back out. Key on tab id triggers
          the unmount/mount cycle. `data-card-panel` scopes the
          `card[0]` measurement query each AnimatedCard runs on mount. */}
      <AnimatePresence mode="wait" initial={false}>
        <section
          key={activeTab}
          className="block"
          style={{ marginTop: 4 }}
          data-card-panel
        >
          {activeTab === "all" ? (
            <AllView grouped={grouped} total={items.length} />
          ) : activeTab === "new" ? (
            <SingleBucketView items={newItems} />
          ) : (
            <SingleBucketView items={grouped[Number(activeTab)] ?? []} />
          )}
        </section>
      </AnimatePresence>
    </main>
  );
}

function AllView({
  grouped,
  total,
}: {
  grouped: ComponentItem[][];
  total: number;
}) {
  // One continuous stagger counter across all four buckets so the cascade
  // reads as a single top-to-bottom wave.
  let cardIdx = 0;
  return (
    <>
      {BUCKETS.map((bucket, bucketIdx) => {
        const bucketItems = grouped[bucketIdx];
        if (bucketItems.length === 0) return null;
        return (
          <div
            key={bucket.label}
            className="showcase-section"
            style={{ marginTop: bucketIdx === 0 ? 0 : 32 }}
          >
            <h2 className="showcase-section-heading">
              {bucket.label}
              <span className="showcase-section-count">
                {bucketItems.length}
              </span>
            </h2>
            <div className="showcase-grid">
              {bucketItems.map((c) => (
                <AnimatedCard
                  key={c.slug}
                  item={c}
                  index={cardIdx++}
                  total={total}
                />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

function SingleBucketView({ items }: { items: ComponentItem[] }) {
  return (
    <div className="showcase-grid">
      {items.map((c, i) => (
        <AnimatedCard key={c.slug} item={c} index={i} total={items.length} />
      ))}
    </div>
  );
}

/**
 * Per-card deck animation:
 *  - On mount, useLayoutEffect measures this card's offset from `card[0]`
 *    in the panel (queried via `[data-card-panel] [data-card-slug]`), then
 *    imperatively `controls.set()` to that collapsed position before paint.
 *    The animation deals from the exact deck slot, not a fixed offset.
 *  - enter: from collapsed → grid position with forward stagger.
 *  - exit: from grid → same measured collapsed slot with reverse stagger.
 *  - `settled` flips true after enter completes → ShowcaseCard then allows
 *    its IntersectionObserver to mount the real preview, so canvas/RAF work
 *    doesn't start during the animation.
 */
function AnimatedCard({
  item,
  index,
  total,
}: {
  item: ComponentItem;
  index: number;
  total: number;
}) {
  const reduced = useReducedMotion() ?? false;
  const controls = useAnimationControls();
  const cardRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(COLLAPSE_FALLBACK);
  const [settled, setSettled] = useState(reduced);

  useLayoutEffect(() => {
    if (reduced) return;

    // Measure where card[0] sits relative to this card.
    const panel = cardRef.current?.closest(
      "[data-card-panel]",
    ) as HTMLElement | null;
    const firstCard = panel?.querySelector<HTMLDivElement>("[data-card-slug]");
    let measured = { x: 0, y: 0 };
    if (firstCard && cardRef.current && firstCard !== cardRef.current) {
      const myRect = cardRef.current.getBoundingClientRect();
      const firstRect = firstCard.getBoundingClientRect();
      measured = {
        x: firstRect.left - myRect.left,
        y: firstRect.top - myRect.top,
      };
    }
    setOffset(measured);

    // Synchronously place this card at the deck slot before the first paint,
    // then animate to natural position with stagger.
    controls.set({
      opacity: 0,
      scale: COLLAPSE_SCALE,
      x: measured.x,
      y: measured.y,
    });
    const enterDelay = Math.min(index, ENTER_MAX_STEPS) * ENTER_STEP;
    controls.start({
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      transition: {
        delay: enterDelay,
        duration: ENTER_DURATION,
        ease: ANIMATION_EASE,
      },
    });

    // Defer preview load until after this card's enter animation completes
    // — skeleton stays visible during the deal, real preview takes over after.
    const settleAt = (enterDelay + ENTER_DURATION) * 1000;
    const settleTimer = window.setTimeout(() => setSettled(true), settleAt);
    return () => clearTimeout(settleTimer);
  }, [reduced, index, controls]);

  if (reduced) {
    return <ShowcaseCard item={item} active />;
  }

  const exitDelay = Math.min(total - 1 - index, EXIT_MAX_STEPS) * EXIT_STEP;

  return (
    <motion.div
      ref={cardRef}
      data-card-slug={item.slug}
      initial={false}
      animate={controls}
      exit={{
        opacity: 0,
        scale: COLLAPSE_SCALE,
        x: offset.x,
        y: offset.y,
        transition: {
          delay: exitDelay,
          duration: EXIT_DURATION,
          ease: ANIMATION_EASE,
        },
      }}
      style={{ transformOrigin: "top left" }}
    >
      <ShowcaseCard item={item} active={settled} />
    </motion.div>
  );
}
