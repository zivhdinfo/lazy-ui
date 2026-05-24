import type { ComponentProps } from "react";

type TextGradientProps = ComponentProps<"span">;

export function TextGradient({
  className,
  children = "Silver gradient text",
  ...props
}: TextGradientProps) {
  return (
    <span
      className={[
        "bg-gradient-to-r from-neutral-100 via-neutral-400 to-neutral-700 bg-clip-text text-transparent",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
