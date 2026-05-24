import type { ComponentProps } from "react";

type CardGlowProps = ComponentProps<"div">;

export function CardGlow({ className, children, ...props }: CardGlowProps) {
  return (
    <div
      className={[
        "rounded-lg border border-white/10 bg-neutral-950 p-6 text-neutral-100 shadow-[0_0_44px_rgba(255,255,255,0.08)] transition hover:border-white/20",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children ?? (
        <div className="space-y-2">
          <p className="text-sm font-medium">Glow card</p>
          <p className="text-sm leading-6 text-neutral-400">
            A quiet container with a subtle silver glow.
          </p>
        </div>
      )}
    </div>
  );
}
