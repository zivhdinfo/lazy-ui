"use client";

import { useEffect } from "react";

// App-wide FPS watchdog with a WebGL context safety-sweep.
//
// What it does: samples the real frame rate, and when FPS stays below a floor
// for a sustained window, it releases orphaned WebGL contexts — canvases that
// have left the DOM but whose GPU context is still alive. Browsers cap live
// WebGL contexts (~16) and evict the oldest once exceeded, so a stray live
// context is both leaked GPU memory and a stolen slot; reclaiming it is what
// keeps the rest of the page smooth.
//
// What it deliberately does NOT do: it never releases a context whose canvas
// is still in the document. The lazy-ui WebGL components do not re-initialise
// on `webglcontextrestored`, so force-losing a visible (or merely scrolled-
// away but still mounted) canvas would leave it permanently blank. It also
// makes no quality/DPR changes and never pauses a running animation — it is
// purely a reclamation net on top of each component's own unmount release.
//
// In practice the per-component unmount release already frees detached
// contexts within a tick, so this sweep is a backstop: it catches anything
// that slipped through (a future or third-party WebGL canvas without the
// unmount fix, or a release deferred past an eviction) under real pressure.

const LOW_FPS = 40; // a window below this counts as "under pressure"
const SAMPLE_MS = 1000; // FPS is averaged over windows this long
const SUSTAIN_MS = 2000; // FPS must stay low this long before a sweep fires
const COOLDOWN_MS = 4000; // minimum gap between sweeps
// A window far longer than SAMPLE_MS means the rAF clock stalled (tab switch,
// sleep, a blocking task) rather than a true low frame rate — discard it so a
// resume doesn't read as 1fps and trigger a spurious sweep.
const STALL_MS = SAMPLE_MS * 3;

type GlContext = WebGLRenderingContext | WebGL2RenderingContext;
type GlEntry = { canvas: WeakRef<HTMLCanvasElement>; gl: WeakRef<GlContext> };

declare global {
  interface Window {
    __lazyuiGlRegistry?: GlEntry[];
    __lazyuiGlPatched?: boolean;
  }
}

// Install an observe-only wrapper around getContext that records every WebGL
// context behind WeakRefs. Weak so the registry can never pin a canvas or
// context alive — that would turn the leak detector into a leak. Idempotent:
// guarded by a window flag so HMR / a second mount never double-wraps.
function ensureRegistry(): GlEntry[] {
  if (!window.__lazyuiGlRegistry) window.__lazyuiGlRegistry = [];
  const registry = window.__lazyuiGlRegistry;

  if (!window.__lazyuiGlPatched && typeof HTMLCanvasElement !== "undefined") {
    window.__lazyuiGlPatched = true;
    const proto = HTMLCanvasElement.prototype;
    const original = proto.getContext;
    const patched = function (
      this: HTMLCanvasElement,
      ...args: Parameters<typeof original>
    ): RenderingContext | null {
      const ctx = (
        original as (...a: unknown[]) => RenderingContext | null
      ).apply(this, args);
      const type = args[0];
      if (
        ctx &&
        (type === "webgl2" || type === "webgl" || type === "experimental-webgl")
      ) {
        registry.push({
          canvas: new WeakRef(this),
          gl: new WeakRef(ctx as GlContext),
        });
      }
      return ctx;
    } as typeof original;
    proto.getContext = patched;
  }

  return registry;
}

// Release every tracked context whose canvas has left the DOM, and prune
// collected / already-lost entries so the registry stays small. Returns the
// count released (used only for the dev console line).
function sweepOrphans(): number {
  const registry = window.__lazyuiGlRegistry;
  if (!registry || registry.length === 0) return 0;

  let released = 0;
  const survivors: GlEntry[] = [];
  for (const entry of registry) {
    const canvas = entry.canvas.deref();
    const gl = entry.gl.deref();
    if (!canvas || !gl) continue; // garbage-collected → drop
    if (gl.isContextLost()) continue; // already released → drop
    if (!canvas.isConnected) {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      released++;
      continue; // now lost → drop
    }
    survivors.push(entry); // connected and live → keep watching
  }
  window.__lazyuiGlRegistry = survivors;
  return released;
}

export function WebglFpsWatchdog() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    ensureRegistry();

    let raf = 0;
    let frames = 0;
    let windowStart = performance.now();
    let lowSince = 0; // timestamp FPS first went low this streak (0 = not low)
    let lastSweep = 0;

    const reset = () => {
      frames = 0;
      windowStart = performance.now();
      lowSince = 0;
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      frames += 1;
      const elapsed = now - windowStart;
      if (elapsed < SAMPLE_MS) return;

      if (elapsed > STALL_MS) {
        reset(); // clock discontinuity, not a real low-FPS window
        return;
      }

      const fps = (frames * 1000) / elapsed;
      frames = 0;
      windowStart = now;

      if (fps >= LOW_FPS) {
        lowSince = 0;
        return;
      }

      if (!lowSince) lowSince = now;
      const sustained = now - lowSince >= SUSTAIN_MS;
      const offCooldown = now - lastSweep >= COOLDOWN_MS;
      if (sustained && offCooldown) {
        const released = sweepOrphans();
        lastSweep = now;
        lowSince = now; // restart the sustain window after acting
        if (process.env.NODE_ENV === "development" && released > 0) {
          console.info(
            `[WebglFpsWatchdog] ${fps.toFixed(0)}fps — released ${released} orphaned WebGL context${released === 1 ? "" : "s"}.`,
          );
        }
      }
    };

    const onVisibility = () => {
      // rAF pauses while hidden; on return the first window would be a giant
      // gap. Reset so it isn't misread as a stall-or-low sample.
      if (!document.hidden) reset();
    };
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}

export default WebglFpsWatchdog;
