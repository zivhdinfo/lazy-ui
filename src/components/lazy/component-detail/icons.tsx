const iconProps = {
  width: 14,
  height: 14,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function EyeIcon() {
  return (
    <svg {...iconProps} aria-hidden>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function CodeIcon() {
  return (
    <svg {...iconProps} aria-hidden>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

export function DesktopIcon() {
  return (
    <svg {...iconProps} width={15} height={15} aria-hidden>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </svg>
  );
}

export function TabletIcon() {
  return (
    <svg {...iconProps} width={15} height={15} aria-hidden>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M11 18h2" />
    </svg>
  );
}

export function MobileIcon() {
  return (
    <svg {...iconProps} width={15} height={15} aria-hidden>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </svg>
  );
}

export function RefreshIcon() {
  return (
    <svg {...iconProps} width={15} height={15} aria-hidden>
      <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

/**
 * Curved drag handle. `bend` is the horizontal offset (in path units) of the
 * quadratic-bezier control point at the middle — positive bends right, negative
 * left. `glow` toggles a layered drop-shadow.
 */
export function CurvedHandle({ bend, glow }: { bend: number; glow: boolean }) {
  const HEIGHT = 120;
  const MIDX = 8;
  const cx = MIDX + bend;
  return (
    <svg
      width={16}
      height={HEIGHT}
      viewBox={`0 0 16 ${HEIGHT}`}
      className="pointer-events-none overflow-visible"
      aria-hidden
    >
      <path
        d={`M ${MIDX} 6 Q ${cx} ${HEIGHT / 2}, ${MIDX} ${HEIGHT - 6}`}
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
        style={{
          transition: "stroke 0.2s ease, filter 0.25s ease",
          filter: glow
            ? "drop-shadow(0 0 4px rgba(255,255,255,0.9)) drop-shadow(0 0 12px rgba(255,255,255,0.4))"
            : "none",
        }}
      />
    </svg>
  );
}
