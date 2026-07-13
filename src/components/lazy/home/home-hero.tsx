"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type MotionValue,
  type Variants,
} from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type MouseEvent,
  type ReactNode,
  type SVGProps,
} from "react";

import { BorderGlow } from "@/components/lazy-ui/border-glow";
import { Counter } from "@/components/lazy-ui/counter";
import { GithubStarsButton } from "@/components/lazy-ui/github-stars-button/github-stars-button";
import { LiquidTransition } from "@/components/lazy-ui/liquid-transition";
import {
  getPublishedBlocks,
  getPublishedComponentsOnly,
} from "@/registry/components";
import type { ComponentItem } from "@/registry/types";

import { BrandMark } from "../brand-mark";
import { NEW_SLUGS } from "../sidebar";

import { HomeFeatures } from "./home-features";
import { HomeFooter } from "./home-footer";
import { DiscordIcon } from "./home-icons";
import { HomeMarquee } from "./home-marquee";

// Self-contained Lazy UI home surface (header + split hero + a macOS Safari
// window that swaps real registry components). Light/dark follows the system
// and persists a manual toggle. All styling lives under `.lui-home`.

type Theme = "light" | "dark";

const THEME_KEY = "lazyui-theme";
const GH_OWNER = "zivhdinfo";
const GH_REPO = "lazy-ui";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const HERO_EASE = [0.23, 1, 0.32, 1] as const;
const PARALLAX_INTENSITY = 20;
const LOADER_LOGO = 56;

// Gradient glow ring for the "New components" pill — a vibrant violet→pink→cyan
// sweep so the one announcement of fresh work catches the eye. The colors blend
// around the border arc as it sweeps (BorderGlow auto mode).
const NEW_PILL_GLOW = ["#a78bfa", "#f0abfc", "#67e8f9"];

// Discord brand palette for the header Community button's glow arc.
const DISCORD_GLOW = ["#5865f2", "#8c9eff", "#404eed"];
const DISCORD_INVITE = "https://discord.gg/gCqzeefZ8M";

// Hero copy entrance — the saas signature: a staggered vertical blur fade-up
// (opacity + y + blur resolve together), driven by a parent stagger container.
// Replaces the earlier horizontal mask-sweep so the home reveal matches the
// blur-in vocabulary the feature tiles already use.
const HERO_STAGGER: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};
const HERO_ITEM: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};
const HERO_ITEM_REDUCED: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// ── Icons ────────────────────────────────────────────────────────────────

function Svg({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

// Concave quarter used by the viewport frame + the carved header joins.
function CornerSvg({ className }: { className: string }) {
  return (
    <svg className={className} width="50" height="50" viewBox="0 0 50 50" fill="none" aria-hidden="true">
      <path
        d="M5.50871e-06 0C-0.00788227 37.3001 8.99616 50.0116 50 50H5.50871e-06V0Z"
        fill="currentColor"
      />
    </svg>
  );
}

// ── Tabs ─────────────────────────────────────────────────────────────────

type TabId =
  | "horizon-glow"
  | "scroll-image-carousel"
  | "slime-background"
  | "liquid-reveal";

const TABS: { id: TabId; label: string; file: string; icon: ReactNode }[] = [
  {
    id: "slime-background",
    label: "Slime Background",
    file: "slime-background.tsx",
    icon: (
      <Svg>
        <path d="M5 15c0-5 3.5-8 7-8s7 3 7 8c0 3-2.5 5-7 5s-7-2-7-5Z" />
        <path d="M8 13c1.4 1 2.4 1.4 4 1.4s2.6-.4 4-1.4" />
      </Svg>
    ),
  },
  {
    id: "horizon-glow",
    label: "Horizon Glow",
    file: "horizon-glow.tsx",
    icon: (
      <Svg>
        <path d="M3 16c3.2-5.3 14.8-5.3 18 0" />
        <path d="M6 13c2.2-2.4 9.8-2.4 12 0" />
        <path d="M12 4v4" />
      </Svg>
    ),
  },
  {
    id: "scroll-image-carousel",
    label: "Scroll Image Carousel",
    file: "scroll-image-carousel.tsx",
    icon: (
      <Svg>
        <rect x="3" y="6" width="7" height="12" rx="1.5" />
        <rect x="14" y="6" width="7" height="12" rx="1.5" />
        <path d="M10 10h4M10 14h4" />
      </Svg>
    ),
  },
  {
    id: "liquid-reveal",
    label: "Liquid Reveal",
    file: "liquid-reveal.tsx",
    icon: (
      <Svg>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v18" />
      </Svg>
    ),
  },
];

// ── Live previews — real Lazy-ui components ───────────────────────────────
// Each tab dynamically loads an actual registry component (ssr:false — the
// canvases are browser-only) into the window viewport. Configs mirror the
// compact gallery previews in components-grid.tsx so they read identically.

function Loading() {
  return (
    <div className="stage-loading" aria-hidden>
      <span />
      <span />
      <span />
    </div>
  );
}

type PreviewProps = {
  theme: Theme;
};

function Fill({ children }: { children: ReactNode }) {
  return <div className="absolute inset-0">{children}</div>;
}

const GALLERY_IMAGES = Array.from({ length: 10 }, (_, index) => {
  const n = index + 1;
  return {
    src: `/images/Gallery/${n}.webp`,
    alt: `Gallery frame ${n}`,
  };
});

const PREVIEWS: Record<TabId, ComponentType<PreviewProps>> = {
  "horizon-glow": dynamic(
    async () => {
      const { HorizonGlow } = await import("@/components/lazy-ui/horizon-glow");
      return function HorizonGlowPreview({ theme }: PreviewProps) {
        return (
          <Fill>
            <HorizonGlow
              palette="aurora"
              mode={theme}
              speed={0.35}
              intensity={1.2}
              rise={0.52}
              rays={0.12}
              softness={0.62}
              mouseFollow
              mouseInfluence={0.55}
              clickRipple
              rippleStrength={0.65}
              showContent={false}
              className="h-full w-full"
            />
          </Fill>
        );
      };
    },
    { ssr: false, loading: Loading },
  ),
  "scroll-image-carousel": dynamic(
    async () => {
      const { ScrollImageCarousel } = await import(
        "@/components/lazy-ui/scroll-image-carousel"
      );
      return function ScrollImageCarouselPreview() {
        return (
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[#070707] p-5">
            <ScrollImageCarousel
              images={GALLERY_IMAGES}
              rows={3}
              speed={0.8}
              copies={5}
              cardWidth={118}
              randomize
              hoverFade
              hoverFadeRadius={4}
              hoverFadeIntensity={0.42}
              hoverFadeMode="all"
              stopOnHover
              aria-label="Randomized gallery carousel preview"
            />
          </div>
        );
      };
    },
    { ssr: false, loading: Loading },
  ),
  "slime-background": dynamic(
    async () => {
      const { SlimeBackground } = await import(
        "@/components/lazy-ui/slime-background"
      );
      return function SlimeBackgroundPreview() {
        return (
          <Fill>
            <SlimeBackground
              palette="toxic"
              speed={0.35}
              viscosity={0.85}
              shine={1}
              roughness={0.35}
              detail={1}
              contrast={0.5}
              grain={0.04}
              mouseFollow
              mouseInfluence={0.6}
              className="h-full w-full"
            />
          </Fill>
        );
      };
    },
    { ssr: false, loading: Loading },
  ),
  "liquid-reveal": dynamic(
    async () => {
      const { LiquidReveal } = await import("@/components/lazy-ui/liquid-reveal");
      return function LiquidRevealPreview() {
        return (
          <Fill>
            <LiquidReveal
              frontImage="/images/armor.png"
              backImage="/images/human.png"
              cursorSize={60}
              autoDemo
              autoSpeed={0.5}
              resolution={0.4}
            />
          </Fill>
        );
      };
    },
    { ssr: false, loading: Loading },
  ),
};

function Demo({ id, theme }: { id: TabId; theme: Theme }) {
  const Preview = PREVIEWS[id];
  return <Preview theme={theme} />;
}

// Hero background — Liquid Transition between the light & dark images. On theme
// change, `progress` is tweened 0↔1 so the swap happens as a liquid sweep. The
// GL context only depends on the image URLs, so per-frame re-renders here are
// cheap (they just update Lenis-style progress via the component's knob ref).
function HeroBackground({
  theme,
  sweeps,
  bgX,
  bgY,
}: {
  theme: Theme;
  sweeps: number;
  bgX: MotionValue<number>;
  bgY: MotionValue<number>;
}) {
  const [progress, setProgress] = useState(theme === "dark" ? 1 : 0);
  const progressRef = useRef(progress);
  const prevSweeps = useRef(sweeps);

  useEffect(() => {
    const target = theme === "dark" ? 1 : 0;
    const userToggle = sweeps !== prevSweeps.current;
    prevSweeps.current = sweeps;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Snap for the initial system-theme resolution (or reduced motion); only a
    // user toggle plays the liquid sweep.
    if (!userToggle || reduced) {
      progressRef.current = target;
      setProgress(target);
      return;
    }

    const from = progressRef.current;
    if (from === target) return;
    const duration = 2500;
    let raf = 0;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const k = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      const v = from + (target - from) * eased;
      progressRef.current = v;
      setProgress(v);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [theme, sweeps]);

  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-0 -z-10 overflow-hidden rounded-bl-[32px] rounded-br-[32px] brightness-125 min-[850px]:inset-2.5 min-[850px]:scale-105"
      style={{ x: bgX, y: bgY }}
    >
      <LiquidTransition
        imageA="/images/bg/light.webp"
        imageB="/images/bg/dark.webp"
        progress={progress}
        duration={2500}
        hold={1200}
        distortion={0.14}
        softness={0.18}
        noiseScale={4.2}
        drip={0.55}
        direction="radial"
        className="h-full w-full"
      />
    </motion.div>
  );
}

// ── Home ────────────────────────────────────────────────────────────────

export function HomeHero() {
  const reduced = useReducedMotion();
  const heroItem = reduced ? HERO_ITEM_REDUCED : HERO_ITEM;
  const heroItemTransition = { duration: reduced ? 0.2 : 0.8, ease: HERO_EASE };

  const [theme, setTheme] = useState<Theme>("light");

  // First-load intro: a cover whose logo flies into the header logo slot.
  const [done, setDone] = useState(false); // flight landed → lift the cover
  const [flight, setFlight] = useState<{ x: number; y: number; scale: number } | null>(
    null,
  );
  const headerBrandRef = useRef<HTMLAnchorElement>(null);
  const flyRef = useRef<HTMLDivElement>(null);
  // Stats counters hold at 0 until the copy has revealed, then count up.
  const [counted, setCounted] = useState(false);
  // Hero copy is in view on load; flips false when it scrolls out so the reveal
  // retracts and replays on return (same behavior as the Why strip).
  const [heroIn, setHeroIn] = useState(true);
  // Bumped only on a user theme toggle, so the background sweeps then (not on
  // the initial system-theme resolution).
  const [themeSweeps, setThemeSweeps] = useState(0);

  const components = useMemo(() => getPublishedComponentsOnly(), []);
  const componentCount = components.length;
  const blockCount = useMemo(() => getPublishedBlocks().length, []);
  // Newest components, in NEW_SLUGS insertion order (latest-first) — updates
  // automatically as the badge set changes; not hardcoded.
  const newComponents = useMemo(() => {
    const bySlug = new Map(components.map((c) => [c.slug, c]));
    const out: ComponentItem[] = [];
    for (const slug of NEW_SLUGS) {
      const c = bySlug.get(slug);
      if (c) out.push(c);
    }
    return out;
  }, [components]);

  // Tab history — `current` is always `history[hIndex]`, which lets back /
  // forward / new-tab all fall out of a single source of truth.
  const [history, setHistory] = useState<TabId[]>(["slime-background"]);
  const [hIndex, setHIndex] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const current = history[hIndex];

  const reloadRef = useRef<HTMLButtonElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  // Mouse parallax on the background image (desktop only) — saas mechanism.
  const sectionRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const bgX = useSpring(mouseX, { damping: 25, stiffness: 150 });
  const bgY = useSpring(mouseY, { damping: 25, stiffness: 150 });

  // Theme: follow system, persist a manual choice.
  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) as Theme | null;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const resolved = saved ?? (mq.matches ? "dark" : "light");
    // Theme can only be resolved on the client after mount (SSR renders light
    // to keep hydration stable), so this one-shot sync is intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(resolved);
    // Mirror onto <html data-theme> so the shared docs surface picks up the
    // same choice when navigating home → components without a flash.
    document.documentElement.dataset.theme = resolved;
    const onChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(THEME_KEY)) {
        const next = e.matches ? "dark" : "light";
        setTheme(next);
        document.documentElement.dataset.theme = next;
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Lenis smooth scroll — same config as the saas reference (expo-out easing,
  // 1.6s glide). Disabled under reduced-motion; cleaned up on unmount. ScrollTrigger
  // is driven off Lenis (update on every scroll tick) so the bento's scrubbed
  // reveals stay glued to the smoothed scroll position instead of native scroll.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.6,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenis.on("scroll", ScrollTrigger.update);

    // Drive Lenis from gsap.ticker (not a standalone rAF) so Lenis and
    // ScrollTrigger share one clock — the canonical integration that lets
    // ScrollTrigger pinning behave under smooth scroll. lagSmoothing(0) stops
    // GSAP from jumping after a dropped frame; restored on cleanup.
    const tick = (time: number) => lenis.raf(time * 1000); // ticker is seconds; Lenis wants ms
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // In-page anchor links glide instead of jumping.
    const onAnchorClick = (e: globalThis.MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a[href^="#"]');
      const href = anchor?.getAttribute("href");
      if (!href || href === "#") return;
      const el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -100 });
    };
    document.addEventListener("click", onAnchorClick);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, []);

  const toggleTheme = () => {
    setTheme((t) => {
      const next: Theme = t === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      document.documentElement.dataset.theme = next;
      return next;
    });
    setThemeSweeps((n) => n + 1);
  };

  // Re-run the entrance fade on every tab/reload change without remounting
  // (keying the demo node would fight the unkeyed `.meta` sibling).
  useEffect(() => {
    const el = demoRef.current;
    if (!el) return;
    el.classList.remove("demo");
    void el.offsetWidth;
    el.classList.add("demo");
  }, [current, reloadKey]);

  // Initial intro: hold briefly, then measure the header logo slot and fly the
  // cover's logo into it. Reduced motion skips straight to the docked state.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = window.setTimeout(() => setDone(true), 0);
      return () => clearTimeout(t);
    }
    // Hold while the cluster "draws", then measure the header brand slot and
    // glide the whole cluster (mark + wordmark) into it.
    const t = window.setTimeout(() => {
      const fly = flyRef.current;
      const target = headerBrandRef.current;
      if (fly && target) {
        const fr = fly.getBoundingClientRect();
        const tr = target.getBoundingClientRect();
        setFlight({
          x: tr.left + tr.width / 2 - (fr.left + fr.width / 2),
          y: tr.top + tr.height / 2 - (fr.top + fr.height / 2),
          scale: tr.width / fr.width,
        });
      } else {
        setDone(true);
      }
    }, 1300);
    return () => clearTimeout(t);
  }, []);

  // ── Tab navigation ──
  const navTo = useCallback(
    (id: TabId) => {
      setHistory((h) => {
        if (id === h[hIndex]) return h;
        const next = h.slice(0, hIndex + 1);
        next.push(id);
        setHIndex(next.length - 1);
        return next;
      });
    },
    [hIndex],
  );
  const cycleTab = useCallback(() => {
    const idx = TABS.findIndex((t) => t.id === current);
    navTo(TABS[(idx + 1) % TABS.length].id);
  }, [current, navTo]);

  const onReload = () => {
    const r = reloadRef.current;
    r?.classList.add("spin");
    setTimeout(() => r?.classList.remove("spin"), 520);
    setReloadKey((k) => k + 1);
  };

  const handleParallax = (e: MouseEvent<HTMLElement>) => {
    const el = sectionRef.current;
    if (!el || window.innerWidth < 850) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    mouseX.set(((e.clientX - cx) / (rect.width / 2)) * PARALLAX_INTENSITY);
    mouseY.set(((e.clientY - cy) / (rect.height / 2)) * PARALLAX_INTENSITY);
  };
  const resetParallax = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const backDisabled = hIndex <= 0;
  const fwdDisabled = hIndex >= history.length - 1;
  const activeTab = TABS.find((t) => t.id === current) ?? TABS[0];

  return (
    <div className="lui-home" data-theme={theme}>
      {/* Fixed matte frame around the viewport */}
      <div className="site-frame site-frame--top" aria-hidden="true" />
      <div className="site-frame site-frame--bottom" aria-hidden="true" />
      <div className="site-frame site-frame--left" aria-hidden="true" />
      <div className="site-frame site-frame--right" aria-hidden="true" />
      <CornerSvg className="site-corner site-corner--top-left" />
      <CornerSvg className="site-corner site-corner--top-right" />
      <CornerSvg className="site-corner site-corner--bottom-left" />
      <CornerSvg className="site-corner site-corner--bottom-right" />

      <header className="home-header">
        <div className="nav-shell">
          <CornerSvg className="home-corner home-corner--left" />
          <CornerSvg className="home-corner home-corner--right" />
          <div className="nav">
            <Link
              ref={headerBrandRef}
              className="brand"
              href="/"
              aria-label="Lazy UI home"
              style={{ opacity: done ? 1 : 0 }}
            >
              <span className="mark">
                <BrandMark size={25} />
              </span>
              <span>
                <b>Lazy</b> <span className="z">UI</span>
              </span>
            </Link>
            <nav className="nav-links">
              <Link href="/get-started">Components</Link>
              <Link href="/blocks">Blocks</Link>
              <Link href="/get-started">Docs</Link>
            </nav>
            <div className="nav-right">
              <BorderGlow
                mode="auto"
                colors={DISCORD_GLOW}
                background="var(--panel)"
                radius={9}
                thickness={1.5}
                coneSpread={42}
                glowSize={10}
                intensity={1}
                speed={0.9}
                bling={false}
                className="nav-community-glow"
              >
                <a
                  href={DISCORD_INVITE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-community"
                >
                  <DiscordIcon width={15} height={15} />
                  <span className="nav-community-label">Community</span>
                </a>
              </BorderGlow>
              <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
                <Svg className="sun">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </Svg>
                <Svg className="moon">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </Svg>
              </button>
              <GithubStarsButton
                username={GH_OWNER}
                repo={GH_REPO}
                apiEndpoint="/api/github-stars"
                label="Star"
                displayFormat="compact"
                variant="ghost"
                className="lui-gh"
              />
            </div>
          </div>
        </div>
      </header>

      <main>
        <section
          ref={sectionRef}
          className="hero relative isolate flex flex-col"
          onMouseMove={handleParallax}
          onMouseLeave={resetParallax}
        >
          {/* Parallax background — Liquid Transition between light/dark images,
              inside the frame with rounded bottom corners. */}
          <HeroBackground theme={theme} sweeps={themeSweeps} bgX={bgX} bgY={bgY} />

          {/* Centered copy — viewport-gated so the blur-up reveal retracts when
              scrolled away and replays on return. */}
          <motion.div
            className="flex justify-center px-6 pt-[150px] max-[850px]:justify-start max-[850px]:pt-[120px] sm:pt-[200px]"
            onViewportEnter={() => setHeroIn(true)}
            onViewportLeave={() => {
              if (reduced) return;
              setHeroIn(false);
              setCounted(false);
            }}
            viewport={{ margin: "-20%" }}
          >
            {/* Staggered blur fade-up — the saas hero vocabulary. Gated on the
                loader landing (`done`) and the copy being in view (`heroIn`). */}
            <motion.div
              className="flex max-w-3xl flex-col items-center text-center max-[850px]:w-full max-[850px]:items-start max-[850px]:text-left"
              variants={HERO_STAGGER}
              initial="hidden"
              animate={done && heroIn ? "visible" : "hidden"}
            >
              <motion.div variants={heroItem} transition={heroItemTransition}>
                {newComponents.length > 0 ? (
                  (() => {
                    const visible =
                      newComponents.length > 1 ? newComponents.slice(0, 1) : newComponents;
                    const hidden = newComponents.length - visible.length;
                    return (
                      <BorderGlow
                        mode="auto"
                        colors={NEW_PILL_GLOW}
                        background="var(--surface)"
                        thickness={1.5}
                        radius={12}
                        coneSpread={42}
                        glowSize={12}
                        intensity={0.95}
                        speed={0.9}
                        bling={false}
                        className="lp-new-pill-glow"
                      >
                        <Link
                          href="/get-started/all-component?tab=new"
                          className="lp-new-pill"
                          aria-label={`${newComponents.length} new component${
                            newComponents.length === 1 ? "" : "s"
                          }: ${newComponents.map((c) => c.title).join(", ")}`}
                        >
                          <span className="lp-new-pill-badge">
                            New component{newComponents.length === 1 ? "" : "s"}
                          </span>
                          <span className="lp-new-pill-names">
                            {visible.map((c) => c.title).join(" · ")}
                          </span>
                          {hidden > 0 && (
                            <span className="lp-new-pill-more" aria-hidden>
                              +{hidden}
                            </span>
                          )}
                        </Link>
                      </BorderGlow>
                    );
                  })()
                ) : (
                  <span className="eyebrow">
                    <span className="dotpulse" />
                    {componentCount} components · {blockCount} blocks
                  </span>
                )}
              </motion.div>

              <motion.h1 variants={heroItem} transition={heroItemTransition}>
                Great interfaces, <span className="dim">minimal effort.</span>
              </motion.h1>

              <motion.p
                className="sub"
                variants={heroItem}
                transition={heroItemTransition}
              >
                Copy-paste backgrounds, animations, and UI primitives that install
                straight into your React app as shadcn registry files — no npm
                package, source lands fully editable.
              </motion.p>

              <motion.div
                className="cta-row mt-7 flex flex-wrap items-center justify-center gap-2.5 max-[850px]:w-full max-[850px]:justify-start"
                variants={heroItem}
                transition={heroItemTransition}
              >
                <Link href="/get-started" className="btn btn-solid">
                  Browse components
                </Link>
                <Link href="/get-started" className="btn btn-ghost">
                  Read the docs
                </Link>
                <span className="hint hidden sm:inline">npx shadcn add</span>
              </motion.div>

              <motion.div
                className="mt-9 flex flex-wrap items-stretch justify-center gap-y-2 max-[850px]:justify-start"
                variants={heroItem}
                transition={heroItemTransition}
                onAnimationComplete={(def) => {
                  if (def === "visible") setCounted(true);
                }}
              >
                <div className="stat">
                  <div className="num">
                    <Counter value={counted ? componentCount : 0} effect="fade" speed={1000} />
                  </div>
                  <div className="lbl">components</div>
                </div>
                <div className="stat">
                  <div className="num">
                    <Counter value={counted ? blockCount : 0} effect="fade" speed={1000} />
                  </div>
                  <div className="lbl">blocks</div>
                </div>
                <div className="stat">
                  <div className="num">MIT</div>
                  <div className="lbl">open license</div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* macOS Safari window (live preview) — sits below the copy like the
              sample's dashboard mock. */}
          <motion.div
            className="relative mx-auto mt-20 w-full max-w-6xl px-6 pb-20 max-[850px]:mt-12"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.55, ease: HERO_EASE }}
          >
            <div className="safari-wrap relative mx-auto w-full [-webkit-mask-image:linear-gradient(to_bottom,#000_64%,transparent_100%)] [mask-image:linear-gradient(to_bottom,#000_64%,transparent_100%)]">
              <div className="safari">
                <div className="toolbar">
                  <div className="lights" aria-hidden="true">
                    <span className="r" />
                    <span className="y" />
                    <span className="g" />
                  </div>
                  <div className="tb-nav">
                    <button
                      onClick={() => !backDisabled && setHIndex((i) => i - 1)}
                      disabled={backDisabled}
                      aria-label="Back"
                    >
                      <Svg strokeWidth={2.2}>
                        <path d="m15 18-6-6 6-6" />
                      </Svg>
                    </button>
                    <button
                      onClick={() => !fwdDisabled && setHIndex((i) => i + 1)}
                      disabled={fwdDisabled}
                      aria-label="Forward"
                    >
                      <Svg strokeWidth={2.2}>
                        <path d="m9 18 6-6-6-6" />
                      </Svg>
                    </button>
                  </div>
                  <div className="addr mono">
                    <Svg className="lock" strokeWidth={2}>
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </Svg>
                    <span>
                      <span className="addr-full">
                        <span className="host">2lazyui.com</span>/components/
                      </span>
                      <span className="addr-short">../</span>
                      {current}
                    </span>
                    <button className="reload" ref={reloadRef} onClick={onReload} aria-label="Reload">
                      <Svg strokeWidth={2}>
                        <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                        <path d="M21 3v6h-6" />
                      </Svg>
                    </button>
                  </div>
                  <div className="tb-right">
                    <button aria-label="Share">
                      <Svg strokeWidth={2}>
                        <path d="M12 16V4" />
                        <path d="m8 8 4-4 4 4" />
                        <path d="M20 14v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5" />
                      </Svg>
                    </button>
                    <button onClick={cycleTab} aria-label="New tab">
                      <Svg strokeWidth={2}>
                        <path d="M12 5v14M5 12h14" />
                      </Svg>
                    </button>
                  </div>
                </div>
                <div className="win-body">
                  <div className="tabstrip">
                    {TABS.map((t) => (
                      <button
                        key={t.id}
                        className={`stab${t.id === current ? " active" : ""}`}
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest(".x")) return;
                          navTo(t.id);
                        }}
                      >
                        <span className="fav">{t.icon}</span>
                        <span className="nm">{t.label}</span>
                        <span className="x">
                          <Svg strokeWidth={2}>
                            <path d="M18 6 6 18M6 6l12 12" />
                          </Svg>
                        </span>
                      </button>
                    ))}
                    <button className="newtab" onClick={cycleTab} aria-label="New tab">
                      <Svg strokeWidth={2}>
                        <path d="M12 5v14M5 12h14" />
                      </Svg>
                    </button>
                  </div>
                  <div className="stage">
                    <div className="meta mono">
                      <span className="live">Live preview</span>
                      <span>{activeTab.file}</span>
                    </div>
                    <div className="demo demo-fill" ref={demoRef}>
                      <Demo id={current} theme={theme} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <HomeFeatures />

        <HomeMarquee />

        <HomeFooter />
      </main>

      {/* First-load intro — the logo flies into the header logo slot, then the
          cover lifts (mechanism inspired by animate-ui's radial intro). */}
      <AnimatePresence>
        {!done && (
          <motion.div
            key="lui-loader"
            className="lui-loader-root"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: HERO_EASE }}
            aria-hidden="true"
          >
            <div className="lui-loader-stage">
              {/* The whole brand cluster glides into the header slot… */}
              <motion.div
                ref={flyRef}
                className="lui-loader-fly"
                initial={{ x: 0, y: 0, scale: 1 }}
                animate={flight ?? { x: 0, y: 0, scale: 1 }}
                transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
                onAnimationComplete={() => {
                  if (flight) setDone(true);
                }}
              >
                {/* …and "draws" in with a left-to-right wipe first. */}
                <motion.div
                  className="lui-loader-cluster"
                  initial={{ clipPath: "inset(0 100% 0 0)", filter: "blur(6px)", opacity: 0.5 }}
                  animate={{ clipPath: "inset(0 0% 0 0)", filter: "blur(0px)", opacity: 1 }}
                  transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                >
                  <span className="lui-loader-mark">
                    <BrandMark size={LOADER_LOGO} />
                  </span>
                  <span className="lui-loader-word">
                    <b>Lazy</b> UI
                  </span>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default HomeHero;
