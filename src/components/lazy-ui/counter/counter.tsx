"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";

export type CounterEasing = "linear" | "ease-out" | "ease-in-out";
export type CounterEffect = "simple" | "wheel" | "smooth" | "fade" | "3d";

export interface CounterProps extends ComponentProps<"span"> {
  value: number;
  speed?: number;
  easing?: CounterEasing;
  format?: (value: number) => string;
  separator?: string;
  decimals?: number;
  effect?: CounterEffect;
}

type CountFrame = {
  value: number;
  from: number;
  progress: number;
};

const DIGITS = Array.from({ length: 10 }, (_, i) => i);

const EASE: Record<CounterEasing, (progress: number) => number> = {
  linear: (progress) => progress,
  "ease-out": (progress) => 1 - Math.pow(1 - progress, 3),
  "ease-in-out": (progress) =>
    progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2,
};

const CSS_EASE: Record<CounterEasing, string> = {
  linear: "linear",
  "ease-out": "cubic-bezier(0.16, 1, 0.3, 1)",
  "ease-in-out": "cubic-bezier(0.65, 0, 0.35, 1)",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function backOut(progress: number) {
  const strength = 1.7;
  const shifted = progress - 1;

  return 1 + (strength + 1) * shifted * shifted * shifted + strength * shifted * shifted;
}

function isDigit(char: string) {
  return char >= "0" && char <= "9";
}

function formatCount(
  value: number,
  format?: (value: number) => string,
  separator?: string,
  decimals?: number,
) {
  if (format) return format(value);
  if (!Number.isFinite(value)) return String(value);

  const raw = decimals === undefined ? String(value) : value.toFixed(decimals);
  if (!separator) return raw;

  const [integer, fraction] = raw.split(".");
  const sign = integer.startsWith("-") ? "-" : "";
  const grouped = integer
    .slice(sign.length)
    .replace(/\B(?=(\d{3})+(?!\d))/g, separator);

  return fraction === undefined
    ? `${sign}${grouped}`
    : `${sign}${grouped}.${fraction}`;
}

function useCountFrame(
  value: number,
  speed: number,
  easing: CounterEasing,
): CountFrame {
  const current = useRef(value);
  const [frame, setFrame] = useState<CountFrame>({
    value,
    from: value,
    progress: 1,
  });

  useEffect(() => {
    const from = current.current;
    if (Object.is(from, value)) return;

    const done = () => {
      current.current = value;
      const raf = requestAnimationFrame(() =>
        setFrame({ value, from: value, progress: 1 }),
      );
      return () => cancelAnimationFrame(raf);
    };

    if (!Number.isFinite(from) || !Number.isFinite(value) || speed <= 0) {
      return done();
    }

    let raf = 0;
    let start = 0;
    const duration = Math.max(0, speed);
    const distance = value - from;
    const ease = EASE[easing];

    const tick = (time: number) => {
      if (!start) start = time;

      const linear = clamp((time - start) / duration, 0, 1);
      const progress = ease(linear);
      const next = from + distance * progress;

      current.current = next;
      setFrame({ value: next, from, progress });

      if (linear < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        current.current = value;
        setFrame({ value, from, progress: 1 });
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, speed, easing]);

  return frame;
}

export function Counter({
  value,
  speed = 1000,
  easing = "ease-out",
  format,
  separator,
  decimals,
  effect = "simple",
  children,
  className,
  style,
  ...props
}: CounterProps) {
  const frame = useCountFrame(value, speed, easing);
  const displayValue =
    decimals === undefined && frame.progress < 1
      ? Math.trunc(frame.value)
      : frame.value;
  const display = formatCount(displayValue, format, separator, decimals);
  const from = formatCount(frame.from, format, separator, decimals);
  const target = formatCount(value, format, separator, decimals);
  const animated = effect !== "simple";

  const rootStyle: CSSProperties = {
    fontVariantNumeric: "tabular-nums",
    fontFeatureSettings: '"tnum"',
    ...(animated
      ? {
          display: "inline-flex",
          alignItems: "baseline",
          gap: "0.02em",
        }
      : {}),
    ...style,
  };

  return (
    <span
      {...props}
      className={["counter", className].filter(Boolean).join(" ")}
      style={rootStyle}
    >
      {effect === "smooth" ? (
        <SmoothText from={from} target={target} progress={frame.progress} />
      ) : effect === "wheel" ? (
        <WheelText value={display} speed={speed} easing={easing} />
      ) : effect === "fade" ? (
        <FadeText value={display} target={target} progress={frame.progress} />
      ) : effect === "3d" ? (
        <Flip3dText value={display} speed={speed} />
      ) : (
        display
      )}
      {children}
    </span>
  );
}

function StaticChar({ children }: { children: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        minWidth: children === " " ? "0.3em" : undefined,
      }}
    >
      {children}
    </span>
  );
}

function FadeText({
  value,
  target,
  progress,
}: {
  value: string;
  target: string;
  progress: number;
}) {
  const targetDigits = Array.from(target).filter(isDigit).reverse();
  const chars = Array.from(value);
  let digitOffset = chars.filter(isDigit).length - 1;

  return chars.map((char, index) => {
    const isCounting =
      isDigit(char) &&
      progress < 1 &&
      targetDigits[digitOffset] !== undefined &&
      targetDigits[digitOffset] !== char;
    const pulse =
      isCounting && progress < 1
        ? Math.sin(((progress * 7 + digitOffset * 0.18) % 1) * Math.PI)
        : 0;
    const style: CSSProperties = {
      display: "inline-block",
      minWidth: char === " " ? "0.3em" : isDigit(char) ? "0.64em" : undefined,
      textAlign: isDigit(char) ? "center" : undefined,
      opacity: isCounting ? 1 - pulse * 0.48 : 1,
      filter: isCounting ? `blur(${pulse * 2.25}px)` : undefined,
      transform: isCounting ? `translateY(${pulse * -0.08}em)` : undefined,
      willChange: isCounting ? "opacity, filter, transform" : undefined,
    };

    if (isDigit(char)) digitOffset -= 1;

    return (
      <span key={`${index}-${value.length}`} style={style}>
        {char}
      </span>
    );
  });
}

function Flip3dText({
  value,
  speed,
}: {
  value: string;
  speed: number;
}) {
  return (
    <span style={cubeLineStyle}>
      {Array.from(value).map((char, index) =>
        isDigit(char) ? (
          <Flip3dGlyph key={`${index}-${value.length}`} char={char} speed={speed} />
        ) : (
          <StaticChar key={`${index}-${char}`}>{char}</StaticChar>
        ),
      )}
    </span>
  );
}

function Flip3dGlyph({ char, speed }: { char: string; speed: number }) {
  const previous = useRef(char);
  const [flip, setFlip] = useState({
    from: char,
    to: char,
    progress: 1,
    active: false,
  });

  useEffect(() => {
    if (char === previous.current) return;

    const from = previous.current;
    previous.current = char;

    let raf = 0;
    let start = 0;
    const duration = clamp(speed * 0.12, 100, 220);

    const tick = (time: number) => {
      if (!start) start = time;

      const progress = clamp((time - start) / duration, 0, 1);
      setFlip({
        from,
        to: char,
        progress,
        active: progress < 1,
      });

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [char, speed]);

  if (!flip.active) {
    return <span style={cubeStaticStyle}>{flip.to}</span>;
  }

  const eased = backOut(flip.progress);
  const clamped = clamp(flip.progress, 0, 1);
  const oldTilt = -92 * eased;
  const newTilt = 92 - 92 * eased;
  const depth = 0.46;

  return (
    <span className="lazy-count-cube-cell" style={cubeCellStyle}>
      <span
        className="lazy-count-cube-face-old"
        style={{
          ...cubeFaceStyle,
          opacity: 1 - clamped,
          transform: `rotateX(${oldTilt}deg) translateZ(${depth}em)`,
          transformOrigin: "50% 100%",
        }}
      >
        {flip.from}
      </span>
      <span
        className="lazy-count-cube-face-new"
        style={{
          ...cubeFaceStyle,
          opacity: clamped,
          transform: `rotateX(${newTilt}deg) translateZ(${depth}em)`,
          transformOrigin: "50% 0%",
        }}
      >
        {flip.to}
      </span>
    </span>
  );
}

function WheelText({
  value,
  speed,
  easing,
}: {
  value: string;
  speed: number;
  easing: CounterEasing;
}) {
  const duration = clamp(speed * 0.18, 80, 260);

  return Array.from(value).map((char, index) =>
    isDigit(char) ? (
      <span key={`${index}-${value.length}`} style={digitShellStyle}>
        <span
          style={{
            display: "grid",
            transform: `translate3d(0, -${Number(char)}em, 0)`,
            transition: `transform ${duration}ms ${CSS_EASE[easing]}`,
            willChange: "transform",
          }}
        >
          {DIGITS.map((digit) => (
            <span key={digit} style={digitRowStyle}>
              {digit}
            </span>
          ))}
        </span>
      </span>
    ) : (
      <StaticChar key={`${index}-${char}`}>{char}</StaticChar>
    ),
  );
}

function SmoothText({
  from,
  target,
  progress,
}: {
  from: string;
  target: string;
  progress: number;
}) {
  const startDigits = Array.from(from).filter(isDigit).reverse();
  const nodes: ReactNode[] = [];
  let digitOffset = 0;

  Array.from(target)
    .reverse()
    .forEach((char, reverseIndex) => {
      const index = target.length - 1 - reverseIndex;

      if (!isDigit(char)) {
        nodes.unshift(<StaticChar key={`${index}-${char}`}>{char}</StaticChar>);
        return;
      }

      nodes.unshift(
        <SmoothDigit
          key={`${index}-${target.length}`}
          from={Number(startDigits[digitOffset] ?? 0)}
          to={Number(char)}
          progress={progress}
        />,
      );
      digitOffset += 1;
    });

  return nodes;
}

function SmoothDigit({
  from,
  to,
  progress,
}: {
  from: number;
  to: number;
  progress: number;
}) {
  let distance = to - from;
  if (Math.abs(distance) > 5) distance += distance > 0 ? -10 : 10;

  const current = from + distance * progress;

  return (
    <span style={digitShellStyle}>
      {DIGITS.map((digit) => {
        let offset = digit - current;
        if (offset > 5) offset -= 10;
        if (offset < -5) offset += 10;

        return (
          <span
            key={digit}
            style={{
              ...smoothDigitStyle,
              opacity: clamp(1 - Math.abs(offset) * 0.45, 0, 1),
              transform: `translate3d(0, ${offset}em, 0)`,
            }}
          >
            {digit}
          </span>
        );
      })}
    </span>
  );
}

const digitShellStyle: CSSProperties = {
  position: "relative",
  display: "inline-block",
  width: "0.64em",
  height: "1em",
  overflow: "hidden",
  lineHeight: 1,
  verticalAlign: "-0.08em",
  WebkitMaskImage:
    "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
  maskImage:
    "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
};

const digitRowStyle: CSSProperties = {
  display: "grid",
  height: "1em",
  placeItems: "center",
};

const smoothDigitStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "grid",
  placeItems: "center",
  willChange: "opacity, transform",
};

const cubeLineStyle: CSSProperties = {
  display: "flex",
  lineHeight: 1,
};

const cubeCellStyle: CSSProperties = {
  position: "relative",
  display: "inline-block",
  width: "1ch",
  height: "1em",
  perspective: "5em",
  fontVariantNumeric: "tabular-nums",
  transformStyle: "preserve-3d",
  verticalAlign: "-0.08em",
};

const cubeStaticStyle: CSSProperties = {
  display: "inline-block",
  width: "1ch",
  textAlign: "center",
};

const cubeFaceStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backfaceVisibility: "hidden",
  transformStyle: "preserve-3d",
  willChange: "opacity, transform",
};
