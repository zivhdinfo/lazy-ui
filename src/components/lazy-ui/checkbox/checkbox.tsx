"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root>;

function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "group/checkbox peer inline-flex size-4 shrink-0 items-center justify-center rounded-[5px] border border-white/15 bg-white/[0.04] text-white outline-none transition-[background-color,border-color,transform] duration-200 ease-out",
        "hover:scale-105 hover:border-white/25 hover:bg-white/[0.06]",
        "active:scale-95",
        "data-[state=checked]:border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-black",
        "data-[state=indeterminate]:border-white/40 data-[state=indeterminate]:bg-white data-[state=indeterminate]:text-black",
        "focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        forceMount
        data-slot="checkbox-indicator"
        className="grid place-items-center"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3"
        >
          <path
            d="M4.5 12.75l6 6 9-13.5"
            pathLength={1}
            className={cn(
              "[stroke-dasharray:1] [stroke-dashoffset:1]",
              "transition-[stroke-dashoffset] duration-200 ease-out",
              "group-data-[state=checked]/checkbox:[stroke-dashoffset:0] group-data-[state=checked]/checkbox:delay-100",
            )}
          />
          <line
            x1="5"
            y1="12"
            x2="19"
            y2="12"
            pathLength={1}
            className={cn(
              "[stroke-dasharray:1] [stroke-dashoffset:1]",
              "transition-[stroke-dashoffset] duration-200 ease-out",
              "group-data-[state=indeterminate]/checkbox:[stroke-dashoffset:0]",
            )}
          />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox, type CheckboxProps };
