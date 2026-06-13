// Pre-recorded preview clips for the heaviest WebGL/canvas backgrounds. Cards
// in the All components grid play these instead of mounting the live component,
// so a page full of surfaces never spins up a dozen WebGL contexts at once.
// Files live in /public/video; add a slug here once a clip is recorded.
const PREVIEW_VIDEOS: Record<string, string> = {
  "aurora-mesh": "/video/aurora-mesh-preview-1781388326085.webm",
  "chroma-flow": "/video/chroma-flow-preview-1781388334576.webm",
  "horizon-cipher": "/video/horizon-cipher-preview-1781388118004.webm",
  "liquid-chrome": "/video/liquid-chrome-preview-1781388451785.webm",
  "orbit-bloom": "/video/orbit-bloom-preview-1781388227752.webm",
  "orbit-cipher": "/video/orbit-cipher-preview-1781388212203.webm",
  "orbit-mesh": "/video/orbit-mesh-preview-1781388291734.webm",
  "prism-drift": "/video/prism-drift-preview-1781388366643.webm",
  "ripple-surface": "/video/ripple-surface-preview-1781388434694.webm",
  "slime-background": "/video/slime-background-preview-1781388412076.webm",
  "wave-cipher": "/video/wave-cipher-preview-1781388035293.webm",
};

export function previewVideoFor(slug: string): string | undefined {
  return PREVIEW_VIDEOS[slug];
}
