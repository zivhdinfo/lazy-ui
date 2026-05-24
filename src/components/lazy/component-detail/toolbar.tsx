import type { ReactNode } from "react";

export function ToolbarButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] transition-colors",
        active
          ? "border-white/10 bg-neutral-900 text-white"
          : "border-transparent bg-transparent text-neutral-400 hover:text-white",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function DeviceButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={[
        "inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors",
        active
          ? "bg-neutral-800 text-white"
          : "bg-transparent text-neutral-400 hover:bg-white/[0.06] hover:text-white",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
