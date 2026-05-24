"use client";

import { useId, type HTMLAttributes, type ReactNode } from "react";

// Frame geometry — Apple iPhone 14/15 Pro proportions, kept exactly so the
// rounded corners and Dynamic Island line up like the real hardware.
const PHONE_WIDTH = 433;
const PHONE_HEIGHT = 882;
const SCREEN_X = 21.25;
const SCREEN_Y = 19.25;
const SCREEN_WIDTH = 389.5;
const SCREEN_HEIGHT = 843.5;
const SCREEN_RADIUS = 55.75;

// Screen-area percentages (drive the HTML media layer's positioning).
const LEFT_PCT = (SCREEN_X / PHONE_WIDTH) * 100;
const TOP_PCT = (SCREEN_Y / PHONE_HEIGHT) * 100;
const WIDTH_PCT = (SCREEN_WIDTH / PHONE_WIDTH) * 100;
const HEIGHT_PCT = (SCREEN_HEIGHT / PHONE_HEIGHT) * 100;
const RADIUS_H = (SCREEN_RADIUS / SCREEN_WIDTH) * 100;
const RADIUS_V = (SCREEN_RADIUS / SCREEN_HEIGHT) * 100;

// Lock-screen chrome positions in the SVG's user-space units.
const LOCK_BUTTON_R = 28;
const LOCK_BUTTON_Y = 808;
const LOCK_LEFT_X = 78;
const LOCK_RIGHT_X = 354;
const HOME_INDICATOR_Y = 853;
const HOME_INDICATOR_W = 134;

// Status-bar right cluster anchor — items lay out right-to-left so any
// missing icon naturally collapses without leaving a gap.
const STATUS_RIGHT_EDGE = 372;
const STATUS_ICON_GAP = 7;
const STATUS_ICON_WIDTH = { signal: 16, wifi: 16, battery: 27 } as const;

// Pre-computed percentages for the HTML lock-button overlays (needed because
// SVG <circle> can't host backdrop-filter; the glass blur is HTML-only).
const LOCK_BUTTON_SIZE_PCT = ((LOCK_BUTTON_R * 2) / PHONE_WIDTH) * 100;
const LOCK_BUTTON_TOP_PCT =
  ((LOCK_BUTTON_Y - LOCK_BUTTON_R) / PHONE_HEIGHT) * 100;
const LOCK_LEFT_PCT = ((LOCK_LEFT_X - LOCK_BUTTON_R) / PHONE_WIDTH) * 100;
const LOCK_RIGHT_PCT = ((LOCK_RIGHT_X - LOCK_BUTTON_R) / PHONE_WIDTH) * 100;

/**
 * Liquid-glass displacement map. Two linear gradients (R horizontally,
 * G vertically) screen-blended over black define the rim refraction
 * direction; a blurred neutral-gray inner rect zeros out displacement in
 * the centre so only the rim bends light. Static data-URI — no per-render
 * regeneration, no resize observers, no chromatic-channel split.
 */
const GLASS_MAP_URI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'>" +
      "<defs>" +
      "<linearGradient id='r' x1='0' x2='1' y1='0' y2='0'><stop offset='0' stop-color='#000'/><stop offset='1' stop-color='#f00'/></linearGradient>" +
      "<linearGradient id='g' x1='0' x2='0' y1='0' y2='1'><stop offset='0' stop-color='#000'/><stop offset='1' stop-color='#0f0'/></linearGradient>" +
      "</defs>" +
      "<rect width='100' height='100' fill='#000'/>" +
      "<rect width='100' height='100' fill='url(#r)'/>" +
      "<rect width='100' height='100' fill='url(#g)' style='mix-blend-mode:screen'/>" +
      "<rect x='14' y='14' width='72' height='72' rx='36' fill='gray' style='filter:blur(8px)'/>" +
      "</svg>",
  );

export type IphoneSignal = 0 | 1 | 2 | 3 | 4;

export interface IphoneProps extends HTMLAttributes<HTMLDivElement> {
  /** Image src shown in the screen area. */
  src?: string;
  /** Video src shown in the screen area (autoplay, muted, loop). */
  videoSrc?: string;
  /** Custom screen content. Wins over `src` / `videoSrc`. */
  children?: ReactNode;
  /** Show the status bar row (time, signal, wifi, battery). @default true */
  statusBar?: boolean;
  /** Time label rendered in the status bar. @default "9:41" */
  time?: string;
  /** Filled signal bars (0–4). @default 4 */
  signal?: IphoneSignal;
  /** Show the wifi glyph. @default true */
  wifi?: boolean;
  /** Battery percentage (0–100, auto-clamped). @default 100 */
  battery?: number;
  /** Render the percentage number inside the battery glyph. @default false */
  batteryText?: boolean;
  /** Show the flashlight + camera lock-screen shortcuts. @default true */
  lockButtons?: boolean;
  /** Show the bottom home-indicator pill. @default true */
  homeIndicator?: boolean;
  /** Color of the outer phone frame and the side buttons. Inner screen
   *  bezel stays black regardless. @default "#de7343" */
  bezelColor?: string;
  /** Extra class merged onto the screen wrapper (the rounded mask layer). */
  screenClassName?: string;
}

export function Iphone({
  src,
  videoSrc,
  children,
  statusBar = true,
  time = "9:41",
  signal = 4,
  wifi = true,
  battery = 100,
  batteryText = false,
  lockButtons = true,
  homeIndicator = true,
  bezelColor = "#de7343",
  className,
  screenClassName,
  style,
  ...props
}: IphoneProps) {
  const hasVideo = !!videoSrc;
  const hasChildren = children !== undefined && children !== null && children !== false;
  const hasMedia = hasVideo || !!src || hasChildren;

  const batteryPct = clamp(Math.round(battery), 0, 100);
  const batteryFill = (batteryPct / 100) * 23; // inner rect max width is 23

  // Unique-per-instance ID for the SVG filter so multiple Iphones on the
  // page don't share the same <filter id>.
  const reactId = useId();
  const glassFilterId = `iphone-glass-${reactId.replace(/[:]/g, "")}`;

  // Right-anchored status-bar layout: walk the cluster right→left, skip any
  // hidden item, and X positions just slide to fill the gap.
  const statusIcons: Array<"signal" | "wifi" | "battery"> = [
    "signal",
    ...(wifi ? (["wifi"] as const) : []),
    "battery",
  ];
  const statusX = {} as Record<"signal" | "wifi" | "battery", number>;
  {
    let cursor = STATUS_RIGHT_EDGE;
    for (let i = statusIcons.length - 1; i >= 0; i--) {
      const key = statusIcons[i];
      cursor -= STATUS_ICON_WIDTH[key];
      statusX[key] = cursor;
      cursor -= STATUS_ICON_GAP;
    }
  }

  return (
    <div
      className={cx(
        "relative inline-block w-full align-middle leading-none",
        className,
      )}
      style={{ aspectRatio: `${PHONE_WIDTH}/${PHONE_HEIGHT}`, ...style }}
      {...props}
    >
      {hasMedia && (
        <div
          className={cx("absolute z-0 overflow-hidden", screenClassName)}
          style={{
            left: `${LEFT_PCT}%`,
            top: `${TOP_PCT}%`,
            width: `${WIDTH_PCT}%`,
            height: `${HEIGHT_PCT}%`,
            borderRadius: `${RADIUS_H}% / ${RADIUS_V}%`,
          }}
          aria-hidden={!hasChildren}
        >
          {hasChildren ? (
            children
          ) : hasVideo ? (
            <video
              className="block size-full object-cover"
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              src={src}
              alt=""
              className="block size-full object-cover object-top"
              draggable={false}
            />
          )}
        </div>
      )}

      <svg
        viewBox={`0 0 ${PHONE_WIDTH} ${PHONE_HEIGHT}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none absolute inset-0 size-full"
        style={{ transform: "translateZ(0)" }}
        aria-hidden="true"
      >
        {/* Two bezels.
            1) Outer phone frame — thin, color via `bezelColor` (3 SVG units wide).
            2) Inner screen bezel — black, hardcoded. The screen-punch mask
               carves the display rectangle out of this so media shows through. */}
        <g mask={hasMedia ? "url(#iphone-screen-punch)" : undefined}>
          {/* Outer phone frame */}
          <rect
            x="2"
            y="0"
            width="428"
            height="882"
            rx="73"
            ry="73"
            style={{ fill: bezelColor }}
          />

          {/* Side buttons — share the frame color */}
          <path
            d="M0 171C0 170.448 0.447715 170 1 170H3V204H1C0.447715 204 0 203.552 0 203V171Z"
            style={{ fill: bezelColor }}
          />
          <path
            d="M1 234C1 233.448 1.44772 233 2 233H3.5V300H2C1.44772 300 1 299.552 1 299V234Z"
            style={{ fill: bezelColor }}
          />
          <path
            d="M1 319C1 318.448 1.44772 318 2 318H3.5V385H2C1.44772 385 1 384.552 1 384V319Z"
            style={{ fill: bezelColor }}
          />
          <path
            d="M430 279H432C432.552 279 433 279.448 433 280V384C433 384.552 432.552 385 432 385H430V279Z"
            style={{ fill: bezelColor }}
          />

          {/* Inner screen bezel — hardcoded black */}
          <rect
            x="5"
            y="3"
            width="422"
            height="876"
            rx="70"
            ry="70"
            fill="#000000"
          />
        </g>

        {/* Top speaker hint */}
        <path
          opacity="0.4"
          d="M174 5H258V5.5C258 6.60457 257.105 7.5 256 7.5H176C174.895 7.5 174 6.60457 174 5.5V5Z"
          style={{ fill: bezelColor }}
        />

        {/* Dynamic Island (front camera area) */}
        <path
          d="M154 48.5C154 38.2827 162.283 30 172.5 30H259.5C269.717 30 278 38.2827 278 48.5C278 58.7173 269.717 67 259.5 67H172.5C162.283 67 154 58.7173 154 48.5Z"
          className="fill-[#0a0a0a]"
        />
        <circle cx="259.5" cy="48.5" r="8" className="fill-[#1a1a1a]" />
        <circle cx="259.5" cy="48.5" r="3.6" className="fill-[#2b2b2b]" />

        {/* Status bar — right-anchored cluster; hidden icons collapse the row. */}
        {statusBar && (
          <g>
            {/* Signal bars */}
            <g
              transform={`translate(${statusX.signal}, 41)`}
              className="fill-white"
            >
              <rect x="0" y="11" width="3" height="3" rx="0.6" opacity={signal >= 1 ? 1 : 0.3} />
              <rect x="4.5" y="9" width="3" height="5" rx="0.6" opacity={signal >= 2 ? 1 : 0.3} />
              <rect x="9" y="6.5" width="3" height="7.5" rx="0.6" opacity={signal >= 3 ? 1 : 0.3} />
              <rect x="13.5" y="4" width="3" height="10" rx="0.6" opacity={signal >= 4 ? 1 : 0.3} />
            </g>

            {/* Wifi */}
            {wifi && (
              <g
                transform={`translate(${statusX.wifi}, 44)`}
                className="fill-white"
              >
                <path d="M8 0 A10 10 0 0 1 16 4 L14.2 5.5 A7.5 7.5 0 0 0 8 2.4 A7.5 7.5 0 0 0 1.8 5.5 L0 4 A10 10 0 0 1 8 0 Z" />
                <path d="M8 3.5 A7 7 0 0 1 13 5.7 L11.3 7.2 A4.5 4.5 0 0 0 8 6 A4.5 4.5 0 0 0 4.7 7.2 L3 5.7 A7 7 0 0 1 8 3.5 Z" />
                <circle cx="8" cy="9" r="1.6" />
              </g>
            )}

            {/* Battery */}
            <g
              transform={`translate(${statusX.battery}, 41)`}
              aria-label={`Battery ${batteryPct}%`}
            >
              <rect
                x="0.5"
                y="0.5"
                width="26"
                height="12"
                rx="3.2"
                ry="3.2"
                className="stroke-white/40"
                strokeWidth="1"
                fill="none"
              />
              <rect x="28" y="4.5" width="1.5" height="4" rx="0.5" className="fill-white/40" />
              <rect x="2" y="2" width={batteryFill} height="9" rx="1.6" className="fill-white" />
              {batteryText && (
                <text
                  x="13.5"
                  y="10.5"
                  fontSize="7.5"
                  fontWeight="700"
                  className="fill-[#0a0a0a]"
                  fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif"
                  textAnchor="middle"
                >
                  {batteryPct}
                </text>
              )}
            </g>
          </g>
        )}

        {/* Home indicator */}
        {homeIndicator && (
          <rect
            x={(PHONE_WIDTH - HOME_INDICATOR_W) / 2}
            y={HOME_INDICATOR_Y}
            width={HOME_INDICATOR_W}
            height="5"
            rx="2.5"
            className="fill-white"
            opacity="0.9"
          />
        )}

        <defs>
          <mask id="iphone-screen-punch" maskUnits="userSpaceOnUse">
            <rect x="0" y="0" width={PHONE_WIDTH} height={PHONE_HEIGHT} fill="white" />
            <rect
              x={SCREEN_X}
              y={SCREEN_Y}
              width={SCREEN_WIDTH}
              height={SCREEN_HEIGHT}
              rx={SCREEN_RADIUS}
              ry={SCREEN_RADIUS}
              fill="black"
            />
          </mask>
        </defs>
      </svg>

      {/* Liquid-glass SVG filter for the lock buttons. Defs only — the
          filter is referenced via CSS backdrop-filter url(). */}
      {lockButtons && <LiquidGlassDefs id={glassFilterId} />}

      {/* Lock-screen shortcuts — rendered as HTML so they can host real
          backdrop-filter glass refraction (SVG circles can't). */}
      {lockButtons && (
        <>
          <LockButton
            leftPct={LOCK_LEFT_PCT}
            topPct={LOCK_BUTTON_TOP_PCT}
            sizePct={LOCK_BUTTON_SIZE_PCT}
            icon="flashlight"
            glassFilterId={glassFilterId}
          />
          <LockButton
            leftPct={LOCK_RIGHT_PCT}
            topPct={LOCK_BUTTON_TOP_PCT}
            sizePct={LOCK_BUTTON_SIZE_PCT}
            icon="camera"
            glassFilterId={glassFilterId}
          />
        </>
      )}
    </div>
  );
}

interface LockButtonProps {
  leftPct: number;
  topPct: number;
  sizePct: number;
  icon: "flashlight" | "camera";
  /** SVG filter ID (without `url(#...)` wrapping). */
  glassFilterId: string;
}

function LockButton({
  leftPct,
  topPct,
  sizePct,
  icon,
  glassFilterId,
}: LockButtonProps) {
  // url(#...) gives rim refraction (in browsers that support it);
  // blur+saturate provides the frosted base layer and is also the graceful
  // fallback when the url() filter isn't supported.
  const backdrop = `url(#${glassFilterId}) blur(3px) saturate(180%)`;
  const fallbackBackdrop = "blur(8px) saturate(180%)";
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute flex items-center justify-center rounded-full"
      style={{
        left: `${leftPct}%`,
        top: `${topPct}%`,
        width: `${sizePct}%`,
        aspectRatio: "1",
        backgroundColor: "rgba(0, 0, 0, 0.18)",
        backdropFilter: backdrop,
        WebkitBackdropFilter: fallbackBackdrop,
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,0.22), inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -2px 4px rgba(0,0,0,0.25)",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: "44%", height: "44%" }}
      >
        {icon === "flashlight" ? (
          <>
            <path d="M8 2.5 H16 V6 L13.5 9 H10.5 L8 6 Z" />
            <path d="M10.5 9 V20.5 H13.5 V9" />
            <line x1="10.5" y1="13.5" x2="13.5" y2="13.5" />
          </>
        ) : (
          <>
            <path d="M3 8 A2 2 0 0 1 5 6 H7.5 L9.2 4 H14.8 L16.5 6 H19 A2 2 0 0 1 21 8 V18 A2 2 0 0 1 19 20 H5 A2 2 0 0 1 3 18 Z" />
            <circle cx="12" cy="13" r="4" />
          </>
        )}
      </svg>
    </div>
  );
}

/**
 * Filter defs for the liquid-glass refraction. Hidden SVG container — only
 * the `<filter>` is consumed (referenced from CSS `backdrop-filter:
 * url(#id)`).
 */
function LiquidGlassDefs({ id }: { id: string }) {
  return (
    <svg
      aria-hidden
      style={{
        position: "absolute",
        width: 0,
        height: 0,
        pointerEvents: "none",
      }}
    >
      <defs>
        <filter id={id} colorInterpolationFilters="sRGB">
          <feImage
            href={GLASS_MAP_URI}
            x="0"
            y="0"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            result="map"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale="-22"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}

Iphone.displayName = "Iphone";

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function cx(...parts: Array<string | undefined | false | null>) {
  return parts.filter(Boolean).join(" ");
}
