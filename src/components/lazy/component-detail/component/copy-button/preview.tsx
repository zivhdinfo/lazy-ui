import { CopyButton } from "@/components/lazy-ui/copy-button";
import type { IconAnimate } from "@/components/lazy-ui/copy-button";

import type { CustomizeValues } from "../../../customize";

type TextAs = "inline" | "tooltip";

export function Preview({ values }: { values: CustomizeValues }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl px-6 py-4">
      <CopyButton
        content="npm install lazy-ui"
        text={values.text as boolean}
        textAs={(values.textAs ?? "inline") as TextAs}
        revealAnimate={(values.revealAnimate ?? true) as boolean}
        iconAnimate={(values.iconAnimate ?? "blur") as IconAnimate}
        label="Copy"
        delay={(values.delay ?? 4000) as number}
        className="text-sm text-neutral-100"
      />
    </div>
  );
}
