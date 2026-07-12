"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import * as React from "react";

export type ScrollImageCarouselImage = {
  src: string;
  alt?: string;
  caption?: string;
};

export type ScrollImageCarouselHoverFadeMode = "row" | "all";

export type ScrollImageCarouselProps = Omit<
  React.ComponentPropsWithoutRef<"section">,
  "children"
> & {
  images: ScrollImageCarouselImage[];
  rows?: 1 | 2 | 3;
  speed?: number;
  copies?: number;
  cardWidth?: number;
  randomize?: boolean;
  hoverFade?: boolean;
  hoverFadeRadius?: number;
  hoverFadeIntensity?: number;
  hoverFadeMode?: ScrollImageCarouselHoverFadeMode;
  stopOnHover?: boolean;
};

type ActiveHover = {
  rowIndex: number;
  itemIndex: number;
} | null;

const DEFAULT_ROWS = 2;
const DEFAULT_SPEED = 0.55;
const DEFAULT_COPIES = 5;
const DEFAULT_CARD_WIDTH = 300;
const DEFAULT_HOVER_FADE_RADIUS = 4;
const DEFAULT_HOVER_FADE_INTENSITY = 0.68;
const MAX_VELOCITY_BOOST = 4;

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function wrap(min: number, max: number, value: number) {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}

function randomFromSeed(seed: number) {
  let value = seed + 0x6d2b79f5;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
}

function seededShuffle<T>(items: readonly T[], seed: number) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(randomFromSeed(seed + i) * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function splitRows<T>(items: readonly T[], rows: number) {
  const out: T[][] = Array.from({ length: rows }, () => []);
  items.forEach((item, index) => {
    out[index % rows].push(item);
  });
  return out.filter((row) => row.length > 0);
}

function ShotCard({
  image,
  cardWidth,
  rowIndex,
  itemIndex,
  activeHover,
  hoverFadeMode,
  hoverFade,
  hoverFadeRadius,
  hoverFadeIntensity,
  onHover,
  onLeave,
}: {
  image: ScrollImageCarouselImage;
  cardWidth: number;
  rowIndex: number;
  itemIndex: number;
  activeHover: ActiveHover;
  hoverFadeMode: ScrollImageCarouselHoverFadeMode;
  hoverFade: boolean;
  hoverFadeRadius: number;
  hoverFadeIntensity: number;
  onHover: (hover: Exclude<ActiveHover, null>) => void;
  onLeave: () => void;
}) {
  const width = clamp(cardWidth, 80, 520);
  const hoverApplies =
    hoverFade &&
    activeHover !== null &&
    (hoverFadeMode === "all" || activeHover.rowIndex === rowIndex);
  const active =
    hoverApplies &&
    activeHover?.rowIndex === rowIndex &&
    activeHover.itemIndex === itemIndex;
  const crossRow =
    hoverApplies && activeHover !== null && activeHover.rowIndex !== rowIndex;
  const distance =
    hoverApplies && activeHover !== null
      ? Math.abs(itemIndex - activeHover.itemIndex)
      : 0;
  const faded = hoverApplies && !active;
  const effectiveDistance = crossRow
    ? Math.max(distance, hoverFadeRadius)
    : distance;
  const falloff = faded
    ? clamp(effectiveDistance / Math.max(1, hoverFadeRadius), 0, 1)
    : 0;
  const fadeAmount = faded
    ? clamp(hoverFadeIntensity, 0, 0.92) * (0.18 + falloff * 0.82)
    : 0;
  const opacity = faded ? clamp(1 - fadeAmount, 0.16, 1) : 1;
  const blur = faded ? 0.2 + falloff * 3.4 : 0;
  const saturate = faded ? 1 - falloff * 0.42 : active ? 1.12 : 1;
  const brightness = faded ? 1 - falloff * 0.2 : active ? 1.04 : 1;
  const scale = active ? 1.035 : faded ? 1 - falloff * 0.025 : 1;

  return (
    <motion.figure
      animate={{
        opacity,
        filter: `blur(${blur}px) saturate(${saturate}) brightness(${brightness})`,
        scale,
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 28,
        mass: 0.7,
        opacity: { duration: 0.26, ease: [0.16, 1, 0.3, 1] },
        filter: { duration: 0.34, ease: [0.16, 1, 0.3, 1] },
      }}
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") onHover({ rowIndex, itemIndex });
      }}
      onPointerLeave={onLeave}
      style={{
        flex: "0 0 auto",
        width,
        margin: 0,
        marginRight: 20,
        position: "relative",
        zIndex: active ? 2 : 1,
        transformOrigin: "center center",
      }}
    >
      <div
        style={{
          aspectRatio: "3 / 4",
          overflow: "hidden",
          borderRadius: 16,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.src}
          alt={image.alt ?? image.caption ?? "Carousel image"}
          draggable={false}
          loading="lazy"
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            userSelect: "none",
            transition: "transform 520ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </div>
      {image.caption ? (
        <figcaption
          style={{
            marginTop: 12,
            color: "rgba(255,255,255,0.56)",
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            fontSize: 11,
            lineHeight: 1.5,
          }}
        >
          &quot;{image.caption}&quot;
        </figcaption>
      ) : null}
    </motion.figure>
  );
}

function MarqueeRow({
  images,
  direction,
  speed,
  copies,
  cardWidth,
  rowIndex,
  activeHover,
  onHover,
  onLeave,
  hoverFade,
  hoverFadeRadius,
  hoverFadeIntensity,
  hoverFadeMode,
  stopOnHover,
}: {
  images: ScrollImageCarouselImage[];
  direction: 1 | -1;
  speed: number;
  copies: number;
  cardWidth: number;
  rowIndex: number;
  activeHover: ActiveHover;
  onHover: (hover: Exclude<ActiveHover, null>) => void;
  onLeave: () => void;
  hoverFade: boolean;
  hoverFadeRadius: number;
  hoverFadeIntensity: number;
  hoverFadeMode: ScrollImageCarouselHoverFadeMode;
  stopOnHover: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const safeCopies = Math.max(2, Math.floor(copies));
  const setFraction = 100 / safeCopies;
  const baseX = useMotionValue(direction === 1 ? -setFraction / 2 : 0);
  const directionFactor = React.useRef<number>(direction);
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const draggingRef = React.useRef(false);
  const lastPointerXRef = React.useRef(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const rowHovered =
    activeHover !== null &&
    (activeHover.rowIndex === rowIndex || hoverFadeMode === "all");

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(
    smoothVelocity,
    [0, 1200],
    [0, MAX_VELOCITY_BOOST],
    { clamp: false },
  );

  const x = useTransform(baseX, (value) =>
    `${wrap(-setFraction, 0, value)}%`
  );

  useAnimationFrame((_, delta) => {
    if (prefersReducedMotion || draggingRef.current) return;
    if (stopOnHover && rowHovered) return;

    const step = Math.max(0, speed) * (delta / 1000);
    const boost = velocityFactor.get();

    if (boost < 0) directionFactor.current = -direction;
    else if (boost > 0) directionFactor.current = direction;

    baseX.set(
      baseX.get() +
        directionFactor.current * step * (1 + Math.abs(boost)) * -1,
    );
  });

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    onLeave();
    draggingRef.current = true;
    lastPointerXRef.current = event.clientX;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const trackWidth = trackRef.current?.scrollWidth ?? 0;
    if (trackWidth <= 0) return;

    const delta = event.clientX - lastPointerXRef.current;
    lastPointerXRef.current = event.clientX;
    baseX.set(baseX.get() + (delta / trackWidth) * 100);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {}
  };

  if (prefersReducedMotion) {
    return (
      <div
        style={{
          overflowX: "auto",
          overscrollBehaviorX: "contain",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div style={{ display: "flex", width: "max-content" }}>
          {images.map((image, index) => (
            <ShotCard
              key={image.src}
              image={image}
              cardWidth={cardWidth}
              rowIndex={rowIndex}
              itemIndex={index}
              activeHover={activeHover}
              hoverFadeMode={hoverFadeMode}
              hoverFade={hoverFade}
              hoverFadeRadius={hoverFadeRadius}
              hoverFadeIntensity={hoverFadeIntensity}
              onHover={onHover}
              onLeave={onLeave}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        cursor: isDragging ? "grabbing" : "grab",
        overflow: "hidden",
        touchAction: "pan-y",
      }}
    >
      <motion.div
        ref={trackRef}
        style={{ x, display: "flex", width: "max-content" }}
      >
        {Array.from({ length: safeCopies }, (_, copy) =>
          images.map((image, index) => (
            <ShotCard
              key={`${copy}-${image.src}`}
              image={image}
              cardWidth={cardWidth}
              rowIndex={rowIndex}
              itemIndex={copy * images.length + index}
              activeHover={activeHover}
              hoverFadeMode={hoverFadeMode}
              hoverFade={hoverFade}
              hoverFadeRadius={hoverFadeRadius}
              hoverFadeIntensity={hoverFadeIntensity}
              onHover={onHover}
              onLeave={onLeave}
            />
          )),
        )}
      </motion.div>
    </div>
  );
}

export function ScrollImageCarousel({
  images,
  rows = DEFAULT_ROWS,
  speed = DEFAULT_SPEED,
  copies = DEFAULT_COPIES,
  cardWidth = DEFAULT_CARD_WIDTH,
  randomize = true,
  hoverFade = true,
  hoverFadeRadius = DEFAULT_HOVER_FADE_RADIUS,
  hoverFadeIntensity = DEFAULT_HOVER_FADE_INTENSITY,
  hoverFadeMode = "row",
  stopOnHover = false,
  className,
  style,
  ...props
}: ScrollImageCarouselProps) {
  const [shuffleSeed, setShuffleSeed] = React.useState<number | null>(null);
  const safeRows = clamp(Math.floor(rows), 1, 3);
  const orderedImages = React.useMemo(() => {
    if (!randomize || shuffleSeed === null) return images;
    return seededShuffle(images, shuffleSeed);
  }, [images, randomize, shuffleSeed]);
  const rowItems = React.useMemo(
    () => splitRows(orderedImages, safeRows),
    [orderedImages, safeRows],
  );
  const [activeHover, setActiveHover] = React.useState<ActiveHover>(null);

  React.useEffect(() => {
    const id = window.setTimeout(() => {
      setShuffleSeed(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  if (images.length === 0) return null;

  return (
    <section
      className={cx("scroll-image-carousel", className)}
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        ...style,
      }}
      {...props}
    >
      <div
        style={{
          position: "relative",
          zIndex: 0,
          display: "flex",
          flexDirection: "column",
          gap: 40,
        }}
      >
        {rowItems.map((row, index) => (
          <MarqueeRow
            key={index}
            images={row}
            direction={index % 2 === 0 ? 1 : -1}
            speed={speed}
            copies={copies}
            cardWidth={cardWidth}
            rowIndex={index}
            activeHover={activeHover}
            onHover={setActiveHover}
            onLeave={() => setActiveHover(null)}
            hoverFade={hoverFade}
            hoverFadeRadius={hoverFadeRadius}
            hoverFadeIntensity={hoverFadeIntensity}
            hoverFadeMode={hoverFadeMode}
            stopOnHover={stopOnHover}
          />
        ))}
      </div>
    </section>
  );
}
