import { CircleCipher } from "@/components/lazy-ui/circle-cipher";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  const characters = (values.characters ?? "0123456789ABCDEF") as string;
  const size = (values.size ?? 12) as number;
  const color = (values.color ?? "#d4d4d4") as string;
  const spread = (values.spread ?? 142) as number;
  const persistence = (values.persistence ?? 1.8) as number;
  const enableFade = (values.enableFade ?? true) as boolean;
  const opacity = (values.opacity ?? 1) as number;
  return (
    <div className="relative flex min-h-[520px] w-full items-center justify-center overflow-hidden rounded-xl">
      <CircleCipher
        characters={characters}
        size={size}
        color={color}
        spread={spread}
        persistence={persistence}
        enableFade={enableFade}
        opacity={opacity}
      />
      <p className="pointer-events-none text-[11px] uppercase tracking-[0.22em] text-neutral-500">
        Move your cursor
      </p>
    </div>
  );
}
