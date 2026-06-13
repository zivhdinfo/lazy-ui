import type { ReactNode } from "react";

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
          ? "bg-[var(--ink)] text-[var(--ink-text)]"
          : "bg-transparent text-[var(--text-2)] hover:bg-[var(--panel)] hover:text-[var(--text)]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
