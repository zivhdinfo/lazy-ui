"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";

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
    <Link href={`/components/${item.slug}`} className="mq-chip mono">
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

  // GSAP, in one gsap.matchMedia (reverts on unmount; reduced motion skips it).
  // Both breakpoints get (1): one infinite xPercent loop per row (alternating
  // direction), playing only while the section is on screen. Desktop (≥851px,
  // matching the CSS breakpoint) adds (2): a pinned, scrubbed accordion timeline.
  // Rows share a fixed-height block via flex-grow — row 1 starts at grow 1 (the
  // whole block), rows 2/3 at grow 0 (collapsed). Scrolling grows row 2 then row
  // 3 in, so the heights redistribute 100% → 50/50 → thirds. Each row's
  // `.mq-track` is scaled to match its band height (3 → 1.5 → 1), so the chips
  // fill the tall band when few rows show and settle to their resting size at
  // thirds. The loop writes xPercent and the reveal writes scale on the same
  // track — different transform components, so GSAP composes them without
  // overwriting.
  //
  // Mobile keeps the row-by-row scroll reveal but swaps the mechanism: pinning
  // + per-frame flex-grow writes force a layout pass on three full-catalogue
  // tracks every scroll frame, which janks hard on phones. There the rows rest
  // at static thirds via the max-width CSS block and rows 2/3 fade-and-rise in,
  // scrubbed to the section's travel through the viewport — opacity/transform
  // only, so the reveal stays on the compositor.
  const rowsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reduced) return;
    const root = rowsRef.current;
    if (!root) return;
    const section = root.closest<HTMLElement>(".marquee");

    const mm = gsap.matchMedia(root);
    mm.add(
      { desktop: "(min-width: 851px)", mobile: "(max-width: 850px)" },
      (gsapCtx) => {
        const desktop = Boolean(gsapCtx.conditions?.desktop);
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
            paused: true,
          });
        });

        // Run the loops only while the section is actually on screen, so the
        // marquee never costs main-thread time while the user scrolls the rest
        // of the page.
        ScrollTrigger.create({
          trigger: section ?? root,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) =>
            loops.forEach((t) => (self.isActive ? t.play() : t.pause())),
        });

        if (!desktop) {
          // Same reveal beat as the desktop accordion — rows surface one after
          // another as the section scrolls up — but unpinned and compositor-only
          // (no flex-grow layout writes, no pin jitter under native touch
          // scroll). No track scaling here: mobile rows are chip-height with
          // overflow hidden, so any scale > 1 would clip the chips.
          const rowEls = gsap.utils.toArray<HTMLElement>(".mq-row", root);
          if (rowEls.length >= 3) {
            const [, r2, r3] = rowEls;
            gsap.set([r2, r3], { autoAlpha: 0, y: 18 });
            const tl = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: root,
                start: "top 90%",
                end: "top 40%",
                scrub: 1,
              },
            });
            tl.to(r2, { autoAlpha: 1, y: 0, duration: 1 })
              .to(r3, { autoAlpha: 1, y: 0, duration: 1 }, ">");
          }
          return;
        }

        // Hover-pause is desktop-only: on touch, the pointerenter from a tap
        // would freeze the loops with no pointerleave to resume them.
        const pause = () => loops.forEach((t) => t.pause());
        const resume = () => loops.forEach((t) => t.resume());
        root.addEventListener("pointerenter", pause);
        root.addEventListener("pointerleave", resume);

        const rowEls = gsap.utils.toArray<HTMLElement>(".mq-row", root);
        if (section && rowEls.length >= 3) {
          const [r1, r2, r3] = rowEls;
          const [t1, t2, t3] = tracks;

          gsap.set(r1, { flexGrow: 1, autoAlpha: 1 });
          gsap.set([r2, r3], { flexGrow: 0, autoAlpha: 0 });
          gsap.set([t1, t2, t3], { transformOrigin: "center center" });
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
              // Default pinType ("fixed") — Lenis scrolls the native scroller,
              // and transform-pinning under native scroll repositions a frame
              // behind the compositor, which reads as per-frame jitter.
              pin: true,
              anticipatePin: 1,
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
        }

        return () => {
          root.removeEventListener("pointerenter", pause);
          root.removeEventListener("pointerleave", resume);
        };
      },
    );

    // Pin distance + flex heights are measured from layout. The home fonts
    // (Outfit/JetBrains) change chip/block height after they load, so recompute
    // once they're ready — otherwise the pin-spacer is sized from the fallback
    // font and ends up too short.
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }

    return () => mm.revert();
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
