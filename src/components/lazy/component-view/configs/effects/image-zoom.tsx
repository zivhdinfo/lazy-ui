import { Image, ImageZoom } from "@/components/lazy-ui/image-zoom";
import { slider, toggle } from "@/components/lazy/component-detail/controls";
import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/image-zoom"),
  export: "ImageZoom",
  stageMinHeight: 500,
  render: (v) => {
    const zoomScale = (v.zoomScale ?? 2.6) as number;
    const duration = (v.duration ?? 420) as number;
    const edgeBlurAmount = (v.edgeBlurAmount ?? 10) as number;
    const focusRadius = (v.focusRadius ?? 42) as number;
    const edgeBlur = (v.edgeBlur ?? true) as boolean;
    const zoomOnHover = (v.zoomOnHover ?? true) as boolean;
    const zoomOnClick = (v.zoomOnClick ?? true) as boolean;

    return (
      <div className="flex min-h-[460px] w-full items-center justify-center bg-[var(--preview-bg)] p-5">
        <div className="h-[360px] w-full max-w-[680px] overflow-hidden rounded-2xl border border-[var(--border)] bg-black shadow-2xl shadow-black/20">
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
  },
  controls: [
    slider("zoomScale", "Scale", {
      min: 1.2,
      max: 4,
      step: 0.1,
      defaultValue: 2.6,
      format: (n) => `${n.toFixed(1)}x`,
    }),
    slider("duration", "Duration", {
      min: 120,
      max: 900,
      step: 20,
      defaultValue: 420,
      format: (n) => `${Math.round(n)}ms`,
    }),
    slider("edgeBlurAmount", "Blur", {
      min: 0,
      max: 24,
      step: 1,
      defaultValue: 10,
      format: (n) => `${Math.round(n)}px`,
    }),
    slider("focusRadius", "Radius", {
      min: 18,
      max: 72,
      step: 1,
      defaultValue: 42,
      format: (n) => `${Math.round(n)}%`,
    }),
    toggle("edgeBlur", "Edge blur", true),
    toggle("zoomOnHover", "Hover", true),
    toggle("zoomOnClick", "Click", true),
  ],
};
