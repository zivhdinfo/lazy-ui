import { useMemo } from "react";

import { SpringIconLoader } from "@/components/lazy-ui/spring-icon-loader";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  const image1 = (values.image1 ?? "/images/loading/1.png") as string;
  const image2 = (values.image2 ?? "/images/loading/2.png") as string;
  const image3 = (values.image3 ?? "/images/loading/3.png") as string;
  const autoPreview = (values.autoPreview ?? true) as boolean;
  const size = (values.size ?? 56) as number;
  const bounceHeight = (values.bounceHeight ?? 68) as number;
  const gravity = (values.gravity ?? 1550) as number;
  const squash = (values.squash ?? 0.12) as number;
  const stretch = (values.stretch ?? 0.1) as number;
  const tilt = (values.tilt ?? 7) as number;
  const impactHold = (values.impactHold ?? 0.09) as number;
  const shadowColor = (values.shadowColor ?? "#94a3b8") as string;
  const shadowOpacity = (values.shadowOpacity ?? 0.46) as number;
  const iconTransition = (values.iconTransition ?? "blur") as
    | "fade"
    | "blur"
    | "none";
  const icons = useMemo(
    () => [
      { src: image1, alt: "Loading icon 1" },
      { src: image2, alt: "Loading icon 2" },
      { src: image3, alt: "Loading icon 3" },
    ],
    [image1, image2, image3],
  );

  return (
    <div className="grid min-h-[360px] w-full place-items-center rounded-xl bg-black px-6 py-10">
      <SpringIconLoader
        icons={icons}
        loading={autoPreview}
        size={size}
        bounceHeight={bounceHeight}
        gravity={gravity}
        squash={squash}
        stretch={stretch}
        tilt={tilt}
        impactHold={impactHold}
        iconTransition={iconTransition}
        shadowColor={shadowColor}
        shadowOpacity={shadowOpacity}
        label="Loading"
      />
    </div>
  );
}
