import { Image, ImageZoom } from "@/components/lazy-ui/image-zoom";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  const zoomScale = (values.zoomScale ?? 2.6) as number;
  const duration = (values.duration ?? 420) as number;
  const edgeBlurAmount = (values.edgeBlurAmount ?? 10) as number;
  const focusRadius = (values.focusRadius ?? 42) as number;
  const edgeBlur = (values.edgeBlur ?? true) as boolean;
  const zoomOnHover = (values.zoomOnHover ?? true) as boolean;
  const zoomOnClick = (values.zoomOnClick ?? true) as boolean;

  return (
    <div className="flex min-h-[460px] w-full items-center justify-center bg-neutral-950 p-5">
      <div className="h-[360px] w-full max-w-[680px] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-black/60">
        <ImageZoom
          zoomScale={zoomScale}
          duration={duration}
          edgeBlur={edgeBlur}
          edgeBlurAmount={edgeBlurAmount}
          focusRadius={focusRadius}
          zoomOnHover={zoomOnHover}
          zoomOnClick={zoomOnClick}
          aria-label="Zoom image preview"
          className="rounded-2xl"
        >
          <Image
            src="/images/caitlyn.jpg"
            alt="Portrait preview"
            objectFit="cover"
          />
        </ImageZoom>
      </div>
    </div>
  );
}
