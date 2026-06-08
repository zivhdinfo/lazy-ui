"use client";

import Lenis from "lenis";
import { motion, useMotionValue, useSpring, type MotionValue } from "motion/react";
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

import { Counter } from "@/components/lazy-ui/counter";
import { GithubStarsButton } from "@/components/lazy-ui/github-stars-button/github-stars-button";
import { LiquidTransition } from "@/components/lazy-ui/liquid-transition";
import { RevealAnimate } from "@/components/lazy-ui/reveal-animate";
import {
  getPublishedBlocks,
  getPublishedComponentsOnly,
} from "@/registry/components";
import type { ComponentItem } from "@/registry/types";

import { BrandMark } from "../brand-mark";
import { NEW_SLUGS } from "../sidebar";

// Self-contained Lazy UI home surface (header + split hero + a macOS Safari
// window that swaps real registry components). Light/dark follows the system
// and persists a manual toggle. All styling lives under `.lui-home`.

type Theme = "light" | "dark";

const THEME_KEY = "lazyui-theme";
const GH_OWNER = "zivhdinfo";
const GH_REPO = "lazy-ui";

const HERO_EASE = [0.23, 1, 0.32, 1] as const;
const PARALLAX_INTENSITY = 20;

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

type TabId = "liquid-chrome" | "orbit-mesh" | "spectral-card" | "liquid-reveal";

const TABS: { id: TabId; label: string; file: string; icon: ReactNode }[] = [
  {
    id: "liquid-chrome",
    label: "Liquid Chrome",
    file: "liquid-chrome.tsx",
    icon: (
      <Svg>
        <path d="M12 2.5 6 9a6 6 0 1 0 12 0Z" />
      </Svg>
    ),
  },
  {
    id: "orbit-mesh",
    label: "Orbit Mesh",
    file: "orbit-mesh.tsx",
    icon: (
      <Svg>
        <circle cx="12" cy="12" r="3" />
        <ellipse cx="12" cy="12" rx="9" ry="4" />
      </Svg>
    ),
  },
  {
    id: "spectral-card",
    label: "Spectral Card",
    file: "spectral-card.tsx",
    icon: (
      <Svg>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8.5" cy="9" r="1.5" />
        <path d="m21 15-5-4L5 20" />
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

function Fill({ children }: { children: ReactNode }) {
  return <div className="absolute inset-0">{children}</div>;
}

const PREVIEWS: Record<TabId, ComponentType> = {
  "liquid-chrome": dynamic(
    async () => {
      const { LiquidChrome } = await import("@/components/lazy-ui/liquid-chrome");
      return function LiquidChromePreview() {
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
    },
    { ssr: false, loading: Loading },
  ),
  "orbit-mesh": dynamic(
    async () => {
      const { OrbitMesh } = await import("@/components/lazy-ui/orbit-mesh");
      return function OrbitMeshPreview() {
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
    },
    { ssr: false, loading: Loading },
  ),
  "spectral-card": dynamic(
    async () => {
      const { SpectralCard } = await import("@/components/lazy-ui/spectral-card");
      return function SpectralCardPreview() {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-black p-4">
            <SpectralCard
              media="/images/piano-girl.webp"
              width={156}
              height={277}
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

function Demo({ id }: { id: TabId }) {
  const Preview = PREVIEWS[id];
  return <Preview />;
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
  const [theme, setTheme] = useState<Theme>("light");

  // First-load intro cover, then the staggered reveal.
  const [loaded, setLoaded] = useState(false);
  // Reveal sequence: 1 = pill, 2 = title, 3 = description, 4 = CTA + counters.
  const [step, setStep] = useState(0);
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
  const [history, setHistory] = useState<TabId[]>(["liquid-chrome"]);
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
    // Theme can only be resolved on the client after mount (SSR renders light
    // to keep hydration stable), so this one-shot sync is intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(saved ?? (mq.matches ? "dark" : "light"));
    const onChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(THEME_KEY)) setTheme(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Lenis smooth scroll — same config as the saas reference (expo-out easing,
  // 1.6s glide). Disabled under reduced-motion; cleaned up on unmount.
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

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

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
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  const toggleTheme = () => {
    setTheme((t) => {
      const next: Theme = t === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
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

  // Initial page-load intro: hold a cover briefly, then lift it.
  useEffect(() => {
    const t = window.setTimeout(() => setLoaded(true), 650);
    return () => clearTimeout(t);
  }, []);

  // Sequential reveal (RevealAnimate sweeps) once the intro lifts: title → desc.
  useEffect(() => {
    if (!loaded) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Reduced motion: reveal everything at once (intentional one-shot).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep(99);
      return;
    }
    const timers = [60, 280, 540, 800].map((delay, i) =>
      window.setTimeout(() => setStep(i + 1), delay),
    );
    return () => timers.forEach(clearTimeout);
  }, [loaded]);

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
  const counted = step >= 4;

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
            <Link className="brand" href="/" aria-label="Lazy UI home">
              <span className="mark">
                <BrandMark size={25} />
              </span>
              <span>
                <b>Lazy</b> <span className="z">UI</span>
              </span>
            </Link>
            <nav className="nav-links">
              <Link href="/components">Components</Link>
              <Link href="/blocks">Blocks</Link>
              <Link href="/docs">Docs</Link>
            </nav>
            <div className="nav-right">
              <button className="search" aria-label="Search components">
                <Svg style={{ width: 13, height: 13 }} strokeWidth={2}>
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </Svg>
                Search
                <span className="kbd mono">⌘K</span>
              </button>
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

          {/* Centered copy */}
          <div className="flex justify-center px-6 pt-[150px] max-[850px]:justify-start max-[850px]:pt-[120px] sm:pt-[200px]">
            <div className="flex max-w-3xl flex-col items-center text-center max-[850px]:w-full max-[850px]:items-start max-[850px]:text-left">
              <RevealAnimate trigger={step >= 1}>
                {newComponents.length > 0 ? (
                  (() => {
                    const visible =
                      newComponents.length > 1 ? newComponents.slice(0, 1) : newComponents;
                    const hidden = newComponents.length - visible.length;
                    return (
                      <Link
                        href="/components?tab=new"
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
                    );
                  })()
                ) : (
                  <span className="eyebrow">
                    <span className="dotpulse" />
                    {componentCount} components · {blockCount} blocks
                  </span>
                )}
              </RevealAnimate>

              <h1>
                <RevealAnimate trigger={step >= 2}>
                  Great interfaces, <span className="dim">minimal effort.</span>
                </RevealAnimate>
              </h1>

              <p className="sub">
                <RevealAnimate trigger={step >= 3}>
                  Copy-paste backgrounds, animations, and UI primitives that install
                  straight into your React app as shadcn registry files — no npm
                  package, source lands fully editable.
                </RevealAnimate>
              </p>

              <motion.div
                className="cta-row mt-7 flex flex-wrap items-center justify-center gap-2.5 max-[850px]:w-full max-[850px]:justify-start"
                initial={{ opacity: 0, y: 12 }}
                animate={step >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                transition={{ duration: 0.55, ease: HERO_EASE }}
              >
                <Link href="/components" className="btn btn-solid">
                  Browse components
                </Link>
                <Link href="/docs" className="btn btn-ghost">
                  Read the docs
                </Link>
                <span className="hint hidden sm:inline">npx shadcn add</span>
              </motion.div>

              <motion.div
                className="mt-9 flex flex-wrap items-stretch justify-center gap-y-2 max-[850px]:justify-start"
                initial={{ opacity: 0, y: 12 }}
                animate={step >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                transition={{ duration: 0.55, delay: 0.08, ease: HERO_EASE }}
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
            </div>
          </div>

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
                      <Demo id={current} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* First-load intro cover — fades out once mounted. */}
      <div className={`lui-loader${loaded ? " is-done" : ""}`} aria-hidden="true">
        <div className="lui-loader-inner">
          <span className="lui-loader-mark">
            <BrandMark size={42} />
          </span>
          <span className="lui-loader-word">
            <b>Lazy</b> UI
          </span>
          <span className="lui-loader-bar">
            <i />
          </span>
        </div>
      </div>
    </div>
  );
}

export default HomeHero;
