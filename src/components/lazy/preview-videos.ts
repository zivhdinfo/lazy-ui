// Pre-recorded preview clips for the heaviest WebGL/canvas backgrounds. Cards
// in the All components grid play these instead of mounting the live component,
// so a page full of surfaces never spins up a dozen WebGL contexts at once.
// Files live in /public/video; add a slug here once a clip is recorded.
const PREVIEW_VIDEOS: Record<string, string> = {
  "aurora-mesh": "/video/aurora-mesh-preview-1781388326085.webm",
  "bling-transition": "/video/bling-transition-preview-1781388990194.webm",
  "border-glow": "/video/border-glow-preview-1781389440149.webm",
  "chroma-flow": "/video/chroma-flow-preview-1781388334576.webm",
  "horizon-cipher": "/video/horizon-cipher-preview-1781388118004.webm",
  "image-zoom": "/video/image-zoom-preview-1781389580102.webm",
  "liquid-chrome": "/video/liquid-chrome-preview-1781388451785.webm",
  "liquid-reveal": "/video/liquid-reveal-preview-1781388954411.webm",
  "liquid-transition": "/video/liquid-transition-preview-1781388999122.webm",
  "matrix-grid": "/video/matrix-grid-preview-1781389110978.webm",
  "orbit-bloom": "/video/orbit-bloom-preview-1781388227752.webm",
  "orbit-cipher": "/video/orbit-cipher-preview-1781388212203.webm",
  "orbit-mesh": "/video/orbit-mesh-preview-1781388291734.webm",
  "pixel-cursor": "/video/pixel-cursor-preview-1781389126935.webm",
  "prism-drift": "/video/prism-drift-preview-1781388366643.webm",
  "ripple-surface": "/video/ripple-surface-preview-1781388434694.webm",
  "slime-background": "/video/slime-background-preview-1781388412076.webm",
  "spectral-card": "/video/spectral-card-preview-1781389368770.webm",
  "wave-cipher": "/video/wave-cipher-preview-1781388035293.webm",
};

// Most clips are landscape backgrounds and fill the 16:9 card edge-to-edge
// (cover). A few are portrait/odd-ratio component shots — listing the slug here
// switches the card to `contain` so the whole frame shows at its true ratio
// instead of being cropped to a slice. spectral-card is recorded portrait.
const CONTAIN_VIDEOS = new Set<string>(["spectral-card"]);

export function previewVideoFor(slug: string): string | undefined {
  return PREVIEW_VIDEOS[slug];
}

export function previewVideoFitFor(slug: string): "cover" | "contain" {
  return CONTAIN_VIDEOS.has(slug) ? "contain" : "cover";
}
