"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";

export type AnimatedTab = {
  /** Stable identifier; also used as the `value` / `defaultValue` match. */
  value: string;
  /** Trigger label. */
  label: ReactNode;
  /** Panel content rendered when this tab is active. */
  content: ReactNode;
};

/**
 * Panel transition mode.
 * - `basic` (default): horizontal carousel slide — panels live in a track
 *    that translates, the old panel slides off-screen as the new one arrives.
 * - `blur`: stacked panels, no slide. Crossfade with a soft blur on the
 *    outgoing/incoming halves.
 */
export type AnimateMode = "basic" | "blur";

export type AnimatedTabsProps = {
  /** Tabs to render. The first tab is the default when `defaultValue` is omitted. */
  tabs: AnimatedTab[];
  /** Initially selected tab `value` (uncontrolled). */
  defaultValue?: string;
  /** Selected tab `value` (controlled). */
  value?: string;
  /** Called whenever the selected tab changes. */
  onValueChange?: (value: string) => void;
  /** Transition mode between panels. @default "basic" */
  animate?: AnimateMode;
  /** Extra class names merged onto the root card. */
  className?: string;
};

const subscribeNoop = () => () => {};
function useIsHydrated(): boolean {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

export function AnimatedTabs({
  tabs,
  defaultValue,
  value: controlled,
  onValueChange,
  animate = "basic",
  className,
}: AnimatedTabsProps) {
  const [internal, setInternal] = useState(
    defaultValue ?? tabs[0]?.value ?? "",
  );
  const current = controlled ?? internal;
  const activeIdx = Math.max(
    0,
    tabs.findIndex((t) => t.value === current),
  );
  const isCarousel = animate === "basic";

  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);

  const [indicator, setIndicator] = useState({
    left: 0,
    width: 0,
    visible: false,
  });
  const [stageHeight, setStageHeight] = useState<number | undefined>();
  const hydrated = useIsHydrated();

  useLayoutEffect(() => {
    const el = triggerRefs.current[activeIdx];
    if (el) {
      setIndicator({
        left: el.offsetLeft,
        width: el.offsetWidth,
        visible: true,
      });
    }
  }, [activeIdx]);

  const measureActive = useCallback(() => {
    const el = panelRefs.current[activeIdx];
    if (el) setStageHeight(el.offsetHeight);
  }, [activeIdx]);

  useLayoutEffect(() => {
    measureActive();
  }, [measureActive]);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") return;
    const el = panelRefs.current[activeIdx];
    if (!el) return;
    const ro = new ResizeObserver(() => measureActive());
    ro.observe(el);
    return () => ro.disconnect();
  }, [activeIdx, measureActive]);

  const setValue = (next: string) => {
    if (controlled === undefined) setInternal(next);
    onValueChange?.(next);
  };

  const stageStyle: CSSProperties | undefined =
    stageHeight !== undefined ? { height: stageHeight } : undefined;

  const trackStyle: CSSProperties = isCarousel
    ? { transform: `translate3d(-${activeIdx * 100}%, 0, 0)` }
    : {};

  // Stacked (blur) mode: once we've measured the active panel, we promote
  // inactive panels to `position: absolute` so the stage height tracks only
  // the active panel — not the tallest. Pre-measure, only the active panel
  // renders so the stage gets a sensible natural height to start from.
  const useStackedAbsolute = !isCarousel && hydrated && stageHeight !== undefined;

  return (
    <div
      data-animated-tabs=""
      className={[
        "isolate overflow-hidden rounded-2xl border border-white/10 bg-neutral-950",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        role="tablist"
        className="relative flex items-center gap-1 overflow-hidden border-b border-white/[0.06] bg-white/[0.015] p-2"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute top-2 bottom-[9px] z-0 rounded-md border border-white/10 bg-neutral-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[left,width,opacity] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{
            left: indicator.left,
            width: indicator.width,
            opacity: indicator.visible ? 1 : 0,
          }}
        />
        {tabs.map((tab, i) => {
          const isActive = i === activeIdx;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              ref={(el) => {
                triggerRefs.current[i] = el;
              }}
              onClick={() => setValue(tab.value)}
              className={[
                "relative z-10 cursor-pointer whitespace-nowrap rounded-md px-3.5 py-[7px] text-[12.5px] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-300",
                isActive
                  ? "font-medium text-white"
                  : "text-neutral-500 hover:text-neutral-200",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        className={[
          "relative w-full overflow-hidden",
          hydrated &&
            "transition-[height] duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
        ]
          .filter(Boolean)
          .join(" ")}
        style={stageStyle}
      >
        {isCarousel ? (
          <div
            className={[
              "flex w-full items-start will-change-transform",
              hydrated &&
                "transition-transform duration-[550ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
            ]
              .filter(Boolean)
              .join(" ")}
            style={trackStyle}
          >
            {tabs.map((tab, i) => {
              const isActive = i === activeIdx;
              if (!hydrated && !isActive) return null;
              return (
                <div
                  key={tab.value}
                  role="tabpanel"
                  aria-hidden={!isActive}
                  ref={(el) => {
                    panelRefs.current[i] = el;
                  }}
                  className={[
                    "w-full min-w-0 shrink-0 basis-full",
                    isActive ? "pointer-events-auto" : "pointer-events-none",
                  ].join(" ")}
                >
                  {tab.content}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="relative w-full">
            {tabs.map((tab, i) => {
              const isActive = i === activeIdx;
              // Until we've measured the active panel, render only it in flow
              // so the stage has a sensible natural height.
              if (!useStackedAbsolute && !isActive) return null;
              return (
                <div
                  key={tab.value}
                  role="tabpanel"
                  aria-hidden={!isActive}
                  ref={(el) => {
                    panelRefs.current[i] = el;
                  }}
                  className={[
                    useStackedAbsolute
                      ? "absolute inset-x-0 top-0"
                      : "relative",
                    "w-full min-w-0",
                    isActive ? "pointer-events-auto" : "pointer-events-none",
                    ...panelEffectClasses(animate, isActive),
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {tab.content}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function panelEffectClasses(mode: AnimateMode, isActive: boolean): string[] {
  if (mode === "basic") return [];
  // blur — stacked crossfade with a soft blur on the inactive half.
  return [
    "transition-[opacity,filter] duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
    isActive ? "opacity-100 blur-0 z-10" : "opacity-0 blur-sm",
  ];
}
