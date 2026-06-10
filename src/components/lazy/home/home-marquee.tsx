"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";

import { componentHref } from "@/registry/categories";
import { getPublishedComponentsOnly } from "@/registry/components";
import type { ComponentItem } from "@/registry/types";

// Component marquee — the breadth beat after the "Why" bento. Three rows of the
// full catalogue scroll past in alternating directions, so the eye reads the
// library's size at a glance and every chip is a real link into a component.
// The three rows reveal as an accordion while the section is pinned: row 1 fills
// the full block height (its chips scaled up), then as the user scrolls rows 2
// and 3 grow in and the height redistributes 100% → 50/50 → thirds. All styling
// lives under `.lui-home` so light/dark tokens cascade in.

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const REVEAL_EASE = [0.16, 1, 0.3, 1] as const;

const HEAD_STAGGER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

// Round-robin split so each row carries a distinct slice of the catalogue —
// no two rows show the same chip at the same horizontal position.
function splitRows<T>(items: T[], rows: number): T[][] {
  const out: T[][] = Array.from({ length: rows }, () => []);
  items.forEach((it, i) => out[i % rows].push(it));
  return out;
}

function Chip({ item }: { item: ComponentItem }) {
  return (
    <Link href={componentHref(item)} className="mq-chip mono">
      {item.title}
    </Link>
  );
}

export function HomeMarquee() {
  const reduced = useReducedMotion();
  const components = useMemo(() => getPublishedComponentsOnly(), []);
  const rows = useMemo(() => splitRows(components, 3), [components]);

  const headItem = reduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
        visible: { opacity: 1, y: 0, filter: "blur(0px)" },
      };
  const headItemTransition = { duration: reduced ? 0.2 : 0.8, ease: REVEAL_EASE };

  // GSAP, all in one gsap.context (reverts on unmount; reduced motion skips it):
  // (1) one infinite xPercent loop per row (alternating direction), paused while
  // the pointer is over the rows; (2) a pinned, scrubbed accordion timeline. Rows
  // share a fixed-height block via flex-grow — row 1 starts at grow 1 (the whole
  // block), rows 2/3 at grow 0 (collapsed). Scrolling grows row 2 then row 3 in,
  // so the heights redistribute 100% → 50/50 → thirds. Each row's `.mq-track` is
  // scaled to match its band height (3 → 1.5 → 1), so the chips fill the tall
  // band when few rows show and settle to their resting size at thirds. The loop
  // writes xPercent and the reveal writes scale on the same track — different
  // transform components, so GSAP composes them without overwriting. The same
  // accordion runs on both breakpoints via gsap.matchMedia — only the pin tech
  // differs: desktop (≥851px) uses pinType "transform" (it scrolls under Lenis),
  // mobile (≤850px) uses "fixed" so the pin doesn't jitter on native momentum
  // scroll.
  const rowsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reduced) return;
    const root = rowsRef.current;
    if (!root) return;
    const section = root.closest<HTMLElement>(".marquee");

    const ctx = gsap.context(() => {
      const tracks = gsap.utils.toArray<HTMLElement>(".mq-track", root);
      const loops = tracks.map((track, i) => {
        const rtl = i % 2 === 1;
        const duration = 48 + i * 6;
        if (rtl) gsap.set(track, { xPercent: -50 });
        return gsap.to(track, {
          xPercent: rtl ? 0 : -50,
          duration,
          ease: "none",
          repeat: -1,
        });
      });
      // Pause the loops only on real hover — on touch, pointerenter fires on tap
      // and would freeze the marquee until the finger lifts.
      if (window.matchMedia("(hover: hover)").matches) {
        const pause = () => loops.forEach((t) => t.pause());
        const resume = () => loops.forEach((t) => t.resume());
        root.addEventListener("pointerenter", pause);
        root.addEventListener("pointerleave", resume);
      }

      const rowEls = gsap.utils.toArray<HTMLElement>(".mq-row", root);
      if (section && rowEls.length >= 3) {
        const [r1, r2, r3] = rowEls;
        const [t1, t2, t3] = tracks;
        gsap.set([t1, t2, t3], { transformOrigin: "center center" });

        // Same accordion on both breakpoints — only the pin technique differs.
        // Desktop scrolls under Lenis (smoothed wheel), where pinType "transform"
        // keeps the pin glued to the smoothed position. Mobile scrolls with
        // native momentum on the compositor thread, where "transform" pinning
        // lags and jitters (the original jank), so it uses "fixed". The flex-grow
        // height morph stays cheap here — 3 items in a 150px box, and the chips
        // inside don't reflow — so with the jitter gone the morph is smooth.
        const buildAccordion = (pinType: "transform" | "fixed") => {
          gsap.set(r1, { flexGrow: 1, autoAlpha: 1 });
          gsap.set([r2, r3], { flexGrow: 0, autoAlpha: 0 });
          gsap.set(t1, { scale: 3 });
          gsap.set(t2, { scale: 1.5 });
          gsap.set(t3, { scale: 1 });

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              // Pin a touch below the top so the fixed header (≈80px) never
              // covers the pinned heading.
              trigger: section,
              start: "top top+=100",
              // Longer pin range = a taller pin-spacer = more scroll room below,
              // so the 3rd row finishes revealing well before scroll runs out.
              end: "+=240%",
              scrub: 1,
              pin: true,
              anticipatePin: 1,
              pinType,
              invalidateOnRefresh: true,
            },
          });
          // Stage A: 100% → 50/50
          tl.to(r2, { flexGrow: 1, autoAlpha: 1, duration: 1 }, 0)
            .to(t1, { scale: 1.5, duration: 1 }, 0);
          // Stage B: 50/50 → thirds
          tl.to(r3, { flexGrow: 1, autoAlpha: 1, duration: 1 }, ">")
            .to([t1, t2], { scale: 1, duration: 1 }, "<")
            .to(t3, { scale: 1, duration: 1 }, "<");
          // Trailing hold so the reveal finishes with scroll room to spare,
          // never cut off at the very bottom.
          tl.to({}, { duration: 0.5 });
        };

        // matchMedia builds the active branch and reverts it on breakpoint flip;
        // the outer ctx.revert() tears both down on unmount.
        const mm = gsap.matchMedia();
        mm.add("(min-width: 851px)", () => buildAccordion("transform"));
        mm.add("(max-width: 850px)", () => buildAccordion("fixed"));
      }
    }, root);

    // Pin distance + flex heights are measured from layout. The home fonts
    // (Outfit/JetBrains) change chip/block height after they load, so recompute
    // once they're ready — otherwise the pin-spacer is sized from the fallback
    // font and ends up too short.
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section className="marquee" id="components" aria-labelledby="marquee-title">
      <div className="wrap">
        <motion.div
          className="features-head"
          variants={HEAD_STAGGER}
          initial="hidden"
          whileInView="visible"
          viewport={{ margin: "-15%" }}
        >
          <motion.span
            className="eyebrow"
            variants={headItem}
            transition={headItemTransition}
          >
            <span className="dotpulse" />
            The library
          </motion.span>
          <motion.h2
            id="marquee-title"
            className="features-title"
            variants={headItem}
            transition={headItemTransition}
          >
            {components.length} primitives, one install away.
          </motion.h2>
          <motion.p
            className="features-lead"
            variants={headItem}
            transition={headItemTransition}
          >
            Backgrounds, text effects, device mocks, and UI primitives — every
            one a real registry file you can add by URL. Tap any to open it.
          </motion.p>
        </motion.div>

        <div className="mq-rows" ref={rowsRef}>
          {rows.map((items, i) => {
            // Doubled track so GSAP's -50% shift lands on the identical copy and
            // the loop is seamless.
            const doubled = [...items, ...items];
            return (
              <div key={i} className="mq-row">
                <div className="mq-track">
                  {doubled.map((it, j) => (
                    <Chip key={`${it.slug}-${j}`} item={it} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HomeMarquee;
