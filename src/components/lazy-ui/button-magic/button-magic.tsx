import type { ComponentProps } from "react";

type ButtonMagicProps = ComponentProps<"button">;

export function ButtonMagic({
  className,
  children = "Button Magic",
  ...props
}: ButtonMagicProps) {
  return (
    <button
      className={[
        "inline-flex h-10 items-center justify-center rounded-md border border-white/10 bg-neutral-100 px-4 text-sm font-medium text-neutral-950 shadow-[0_0_24px_rgba(255,255,255,0.12)] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:pointer-events-none disabled:opacity-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
