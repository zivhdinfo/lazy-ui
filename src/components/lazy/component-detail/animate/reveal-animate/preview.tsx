import { RevealAnimate } from "@/components/lazy-ui/reveal-animate";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  return (
    <div className="rounded-xl px-6 py-5">
      <RevealAnimate
        trigger={(values.trigger ?? true) as boolean}
        from={(values.from ?? "left") as "left" | "right"}
        duration={(values.duration ?? 450) as number}
        className="text-2xl font-light text-neutral-100"
      >
        Reveal me, hide me.
      </RevealAnimate>
    </div>
  );
}
