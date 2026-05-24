import type { ReactNode } from "react";

/**
 * Shared marketing overlay used by Aurora / Chroma / Slime / Shadow previews.
 * Pass `title` as JSX since the title pattern (which word is italic/bold)
 * differs per surface. `variant="light"` flips the palette so dark plumes
 * read on a pale surface (Shadow's bone palette).
 */

type Variant = "dark" | "light";

export type HeroOverlayProps = {
  /** Eyebrow chip text. */
  eyebrow: string;
  /** JSX title — caller decides which spans are italic/bold. */
  title: ReactNode;
  /** Description paragraph under the title. */
  description: string;
  /** Dot color in the eyebrow chip. Defaults to white in dark, near-black in light. */
  accent?: string;
  /** Light vs. dark surface theming. @default "dark" */
  variant?: Variant;
};

export function HeroOverlay({
  eyebrow,
  title,
  description,
  accent,
  variant = "dark",
}: HeroOverlayProps) {
  const isLight = variant === "light";
  const textColor = isLight ? "text-neutral-900" : "text-white";
  const textColorSoft = isLight ? "text-neutral-800" : "text-white/80";
  const chipClass = isLight
    ? "border-black/15 bg-white/40"
    : "border-white/20 bg-white/10";
  const dotBg = accent
    ? { background: accent }
    : isLight
      ? { background: "#1c1c1c" }
      : { background: "#ffffff" };
  const browseBtnClass = isLight
    ? "border-black/30 text-neutral-900 hover:bg-black/5"
    : "border-white/30 text-white hover:bg-white/10";
  const ctaBtnClass = isLight
    ? "bg-neutral-900 text-white hover:bg-neutral-700"
    : "bg-white text-black hover:bg-white/90";
  const navHoverClass = isLight ? "hover:bg-black/10" : "hover:bg-white/10";
  const loginBtnClass = isLight
    ? "bg-neutral-900 text-white"
    : "bg-white text-black";

  return (
    <>
      <header
        className={`relative z-10 flex items-center justify-between p-5 ${textColor}`}
      >
        <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span
            className="inline-block h-5 w-5 rounded-md"
            style={{
              background:
                "linear-gradient(180deg, #fff 0%, #d4d4d4 50%, #8a8a8a 100%)",
            }}
          />
          Lazy-ui
        </div>
        <nav
          className={`flex items-center gap-1 text-[11px] font-light ${textColorSoft}`}
        >
          <a className={`rounded-full px-3 py-1.5 ${navHoverClass}`} href="#">
            Docs
          </a>
          <a className={`rounded-full px-3 py-1.5 ${navHoverClass}`} href="#">
            Pricing
          </a>
          <button
            className={`ml-2 h-8 rounded-full px-5 text-[11px] font-medium ${loginBtnClass}`}
          >
            Login
          </button>
        </nav>
      </header>

      <main className={`relative z-10 max-w-md px-6 pt-16 pb-8 ${textColor}`}>
        <div
          className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-light backdrop-blur-md ${chipClass}`}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={dotBg} />
          {eyebrow}
        </div>
        <h1 className="text-4xl leading-tight tracking-tight">{title}</h1>
        <p
          className={`mt-3 max-w-sm text-[11px] font-light leading-relaxed ${textColorSoft}`}
        >
          {description}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            className={`rounded-full border px-5 py-2 text-[11px] font-light transition-colors ${browseBtnClass}`}
          >
            Browse
          </button>
          <button
            className={`rounded-full px-5 py-2 text-[11px] font-medium transition-colors ${ctaBtnClass}`}
          >
            Get started
          </button>
        </div>
      </main>
    </>
  );
}
