import type { ComponentItem } from "./types";

export { REGISTRY_BASE_URL } from "./base-url";
export { buildRegistryItemJson, normalizeRegistryName } from "./build";
export type {
  ComponentItem,
  ComponentKind,
  ExtraRegistryFile,
  RegistryFile,
  RegistryItemJson,
} from "./types";

export const components: ComponentItem[] = [
  {
    slug: "animated-tabs",
    title: "Animated Tabs",
    description:
      "A single-card tab control with spring-eased indicator and smooth panel transitions.",
    category: "Navigation",
    target: "components/lazy-ui/animated-tabs/animated-tabs.tsx",
    status: "published",
  },
  {
    slug: "copy-button",
    title: "Copy Button",
    description:
      "A clipboard button with animated icon swaps, optional labels, and tooltip text.",
    category: "Buttons",
    target: "components/lazy-ui/copy-button/copy-button.tsx",
    status: "published",
    // Pulls RevealAnimate from this registry automatically when installed.
    internalDependencies: ["reveal-animate"],
  },
  {
    slug: "github-stars-button",
    title: "GitHub Stars Button",
    description:
      "A GitHub repo button with automatic star fetching and animated Counter digits.",
    category: "Buttons",
    target: "components/lazy-ui/github-stars-button/github-stars-button.tsx",
    status: "published",
    dependencies: ["lucide-react"],
    internalDependencies: ["counter"],
  },
  {
    slug: "flip-button",
    title: "Flip Button",
    description:
      "A two-face button with top/bottom flip motion, press feedback, and preset glass-gradient palettes.",
    category: "Buttons",
    target: "components/lazy-ui/flip-button/flip-button.tsx",
    status: "published",
    dependencies: ["motion"],
  },
  {
    slug: "image-zoom",
    title: "Image Zoom",
    description:
      "A lightweight image zoom effect with pointer-smoothed focus, click or hover activation, and a soft blurred edge rim.",
    category: "Effects",
    target: "components/lazy-ui/image-zoom/image-zoom.tsx",
    status: "published",
  },
  {
    slug: "smooth-cursor",
    title: "Smooth Cursor",
    description:
      "A custom cursor wrapper with MotionValue pointer tracking, spring-lagged label, press feedback, and local or viewport scope.",
    category: "Effects",
    target: "components/lazy-ui/smooth-cursor/smooth-cursor.tsx",
    status: "published",
    dependencies: ["motion"],
  },
  {
    slug: "reveal-animate",
    title: "Reveal Animate",
    description:
      "A masked text reveal that sweeps content in or out with blur.",
    category: "Animate",
    target: "components/lazy-ui/reveal-animate/reveal-animate.tsx",
    status: "published",
  },
  {
    slug: "counter",
    title: "Counter",
    description:
      "Animated number with simple, wheel, smooth, fade, and 3D digit effects.",
    category: "Animate",
    target: "components/lazy-ui/counter/counter.tsx",
    status: "published",
  },
  {
    slug: "shiny-text",
    title: "Shiny Text",
    description:
      "CSS text shine with beam/glass variants and reduced-motion support.",
    category: "Text Animate",
    target: "components/lazy-ui/text-animate/shiny-text/shiny-text.tsx",
    status: "published",
  },
  {
    slug: "text-warp",
    title: "Text Warp",
    description:
      "Per-letter depth animation — letters zoom in blurred from below and dissolve outward on exit.",
    category: "Text Animate",
    target: "components/lazy-ui/text-animate/text-warp/text-warp.tsx",
    status: "published",
    dependencies: ["motion"],
  },
  {
    slug: "text-rise",
    title: "Text Rise",
    description:
      "Per-letter slide-up with a soft blur — letters rise into place and lift away on exit.",
    category: "Text Animate",
    target: "components/lazy-ui/text-animate/text-rise/text-rise.tsx",
    status: "published",
    dependencies: ["motion"],
  },
  {
    slug: "text-spin",
    title: "Text Spin",
    description:
      "Per-letter 3D X-axis flip — letters tumble in through a small perspective and roll out on exit.",
    category: "Text Animate",
    target: "components/lazy-ui/text-animate/text-spin/text-spin.tsx",
    status: "published",
    dependencies: ["motion"],
  },
  {
    slug: "text-scramble",
    title: "Text Scramble",
    description:
      "Random glyph noise that resolves into the real text — fires on hover, mount, or first scroll into view.",
    category: "Text Animate",
    target: "components/lazy-ui/text-animate/text-scramble/text-scramble.tsx",
    status: "published",
  },
  {
    slug: "spinning-text",
    title: "Spinning Text",
    description:
      "Text laid along a circular SVG path that rotates continuously — supports center content, direction, and reversal.",
    category: "Text Animate",
    target:
      "components/lazy-ui/text-animate/spinning-text/spinning-text.tsx",
    status: "published",
    dependencies: ["motion"],
  },
  {
    slug: "text-flip",
    title: "Text Flip",
    description:
      "Per-character 3D flip — letters tumble around an axis on hover, mount, or first scroll into view.",
    category: "Text Animate",
    target: "components/lazy-ui/text-animate/text-flip/text-flip.tsx",
    status: "published",
    dependencies: ["motion"],
  },
  {
    slug: "progress",
    title: "Progress",
    description:
      "Radix Progress with animated fill, optional glow effects, and flexible value labels.",
    category: "Feedback",
    target: "components/lazy-ui/progress/progress.tsx",
    status: "published",
    dependencies: ["radix-ui", "motion"],
  },
  {
    slug: "switch",
    title: "Switch",
    description:
      "Radix Switch with drag, flick snapping, size presets, and motion release curves.",
    category: "Forms",
    target: "components/lazy-ui/switch/switch.tsx",
    status: "published",
    dependencies: ["radix-ui", "motion"],
  },
  {
    slug: "glass-button",
    title: "Glass Button",
    description:
      "A pill button with a built-in SVG glass filter — turbulence + displacement refraction baked in, with tint and distortion presets.",
    category: "Buttons",
    target: "components/lazy-ui/glass-button/glass-button.tsx",
    status: "published",
  },
  {
    slug: "checkbox",
    title: "Checkbox",
    description:
      "Radix Checkbox with CSS-drawn check and indeterminate states.",
    category: "Forms",
    target: "components/lazy-ui/checkbox/checkbox.tsx",
    status: "published",
    dependencies: ["radix-ui"],
  },
  {
    slug: "iphone",
    title: "iPhone",
    description:
      "An iPhone bezel mock with status bar, Dynamic Island, lock-screen shortcuts, and home indicator. Drop in an image, video, or custom children.",
    category: "Device Mocks",
    target: "components/lazy-ui/device-mocks/iphone/iphone.tsx",
    status: "published",
  },
  {
    slug: "circle-cipher",
    title: "Circle Cipher",
    description:
      "A cursor-following glyph trail — speed-gated brush lights cells on a Canvas2D grid, characters fade as the signal decays.",
    category: "Animate",
    target: "components/lazy-ui/circle-cipher/circle-cipher.tsx",
    status: "published",
    dependencies: ["motion"],
  },
  {
    slug: "liquid-reveal",
    title: "Liquid Reveal",
    description:
      "A WebGL fluid sim — cursor leaves a dye trail that uncovers a second image through the first, with idle auto-drift.",
    category: "Animate",
    target: "components/lazy-ui/liquid-reveal/liquid-reveal.tsx",
    status: "published",
    dependencies: ["three"],
  },
  {
    slug: "liquid-transition",
    title: "Liquid Transition",
    description:
      "A WebGL scene-cut — image A bleeds into image B through an animated fbm front with edge refraction, looping ping-pong.",
    category: "Animate",
    target: "components/lazy-ui/liquid-transition/liquid-transition.tsx",
    status: "published",
    dependencies: ["three"],
  },
  {
    slug: "wave-cipher",
    title: "Wave Cipher",
    description:
      "A glyph-filled background — vertical column bands with traveling wave crests, churning glyphs from a configurable charset.",
    category: "Background",
    target: "components/lazy-ui/wave-cipher/wave-cipher.tsx",
    status: "published",
    dependencies: ["motion"],
  },
  {
    slug: "horizon-cipher",
    title: "Horizon Cipher",
    description:
      "A retro perspective grid of glyphs receding to a horizon — scrolling rows, traveling wave ridge, and a two-tone color cycle.",
    category: "Background",
    target: "components/lazy-ui/horizon-cipher/horizon-cipher.tsx",
    status: "published",
    dependencies: ["motion"],
  },
  {
    slug: "orbit-cipher",
    title: "Orbit Cipher",
    description:
      "A radial cipher with four effect modes — ripple, spiral, vortex, and pulse — anchored to a configurable center with falloff.",
    category: "Background",
    target: "components/lazy-ui/orbit-cipher/orbit-cipher.tsx",
    status: "published",
    dependencies: ["motion"],
  },
  {
    slug: "orbit-bloom",
    title: "Orbit Bloom",
    description:
      "A radial grid of shapes that morph between circle and square — same four effect modes as Orbit Cipher, but shape-based instead of glyph-based.",
    category: "Background",
    target: "components/lazy-ui/orbit-bloom/orbit-bloom.tsx",
    status: "published",
    dependencies: ["motion"],
  },
  {
    slug: "orbit-mesh",
    title: "Orbit Mesh",
    description:
      "A lattice of dots that physically displace through the radial wave field — points push outward on crests and inward on troughs, with optional spiral twist.",
    category: "Background",
    target: "components/lazy-ui/orbit-mesh/orbit-mesh.tsx",
    status: "published",
    dependencies: ["motion"],
  },
  {
    slug: "matrix-grid",
    title: "Matrix Grid",
    description:
      "A canvas dot grid that reveals from an origin and rides four wave shapes — ripple, diagonal S-curve, breathing pulse, and cursor-tracked ripple. Flicker, hover/click/instant triggers, FPS cap, ResizeObserver + IntersectionObserver baked in.",
    category: "Animate",
    target: "components/lazy-ui/matrix-grid/matrix-grid.tsx",
    status: "published",
  },
  {
    slug: "particle-halo",
    title: "Particle Halo",
    description:
      "A ring of colored particles that breathes in and out with elastic + back easings. The cursor angle around the center sweeps the breathe progress, so the wave follows your pointer.",
    category: "Animate",
    target: "components/lazy-ui/particle-halo/particle-halo.tsx",
    status: "published",
    dependencies: ["motion"],
  },
  {
    slug: "aurora-mesh",
    title: "Aurora Mesh",
    description:
      "A flowing mesh gradient background — up to 8 color anchors drift on independent lissajous curves, the last anchor follows the cursor, and clicks emit a ripple that warps the field. Ships with glass + gooey SVG filters for children.",
    category: "Background",
    target: "components/lazy-ui/aurora-mesh/aurora-mesh.tsx",
    status: "published",
    dependencies: ["motion"],
  },
  {
    slug: "chroma-flow",
    title: "Chroma Flow",
    description:
      "Vertical neon streaks flowing through a curl field, painted with a multi-stop rainbow gradient — sharpened peaks, soft bloom, and a black-hole cursor that bends streaks into orbit. Pauses when off-screen.",
    category: "Background",
    target: "components/lazy-ui/chroma-flow/chroma-flow.tsx",
    status: "published",
    dependencies: ["motion"],
  },
  {
    slug: "prism-drift",
    title: "Prism Drift",
    description:
      "A four-corner gradient warped by an fbm flow field with chromatic dispersion at the peaks and iridescent rainbow shimmer — six color presets, cursor eddy, pauses when off-screen.",
    category: "Background",
    target: "components/lazy-ui/prism-drift/prism-drift.tsx",
    status: "published",
    dependencies: ["motion"],
  },
  {
    slug: "shadow-mesh",
    title: "Shadow Mesh",
    description:
      "A single dark plume drifting through a WebGL field — radial alpha mass warped by FBM noise, anchor follows the cursor, fully premultiplied so it composites over any background.",
    category: "Background",
    target: "components/lazy-ui/shadow-mesh/shadow-mesh.tsx",
    status: "published",
    dependencies: ["motion"],
  },
  {
    slug: "slime-background",
    title: "Slime Background",
    description:
      "A glossy marbled liquid surface — double-warped FBM height field, analytic normals, Blinn-Phong specular highlights, and a cursor-dimple that presses into the slime. Five color presets including toxic purple/green.",
    category: "Background",
    target: "components/lazy-ui/slime-background/slime-background.tsx",
    status: "published",
    dependencies: ["motion"],
  },
  {
    slug: "neumorphism",
    title: "Neumorphism",
    description:
      "A cascade of soft rounded plates with directional light + shadow — pure CSS box-shadow neumorphism, parallax tilt on cursor, and a slow drift to keep the surface alive. Five palettes covering pearl, bone, silver, graphite, and obsidian.",
    category: "Background",
    target: "components/lazy-ui/neumorphism/neumorphism.tsx",
    status: "published",
    dependencies: ["motion"],
  },
  {
    slug: "ripple-surface",
    title: "Ripple Surface",
    description:
      "A field of soft concentric rings shaded by a directional light — WebGL sin-ridge height field with four travel modes (outward, inward, breathe, drift), tanh-smoothed ridges, a faded core that kills the seam at the origin, and eight palettes from pearl to obsidian. Pauses when off-screen.",
    category: "Background",
    target: "components/lazy-ui/ripple-surface/ripple-surface.tsx",
    status: "published",
    dependencies: ["motion"],
  },
  {
    slug: "liquid-chrome",
    title: "Liquid Chrome",
    description:
      "An inky liquid surface lit by two coloured studio lights — doubly domain-warped FBM, analytic normals, per-light Blinn-Phong specular, sparkle dust on the crests, and a cursor that stirs the flow. Six palettes from nightfire (black + gold + blue) to polished chrome.",
    category: "Background",
    target: "components/lazy-ui/liquid-chrome/liquid-chrome.tsx",
    status: "published",
    dependencies: ["motion"],
  },
  {
    slug: "bling-transition",
    title: "Bling Transition",
    description:
      "An image A → B transition with palette-tinted sparkle cores blooming along the wipe boundary — fbm-driven wipe, IQ-palette kaleidoscope sparkles only at the moving edge, ping-pong looping.",
    category: "Animate",
    target: "components/lazy-ui/bling-transition/bling-transition.tsx",
    status: "published",
    dependencies: ["three"],
  },
  {
    slug: "grid-background",
    title: "Grid Background",
    description:
      "SVG-based grid backdrop — dots, lines, dashed, or crosshair — that stays crisp at any browser zoom. Optional radial / linear fade.",
    category: "Background",
    target: "components/lazy-ui/grid-background/grid-background.tsx",
    status: "published",
  },
  {
    slug: "stack-list",
    title: "Stack List",
    description:
      "A vertical card stack with motion-first entrance/exit, optional auto-injection, swipe-to-dismiss, and configurable hover/click effects. Honors reduced motion.",
    category: "Animate",
    target: "components/lazy-ui/stack-list/stack-list.tsx",
    status: "published",
    dependencies: ["motion"],
  },
  {
    slug: "animate-tooltip",
    title: "Animate Tooltip",
    description:
      "Radix Tooltip with motion entrance, shared slide transitions, and optional cursor follow.",
    category: "Overlay",
    target: "components/lazy-ui/animate-tooltip/animate-tooltip.tsx",
    status: "published",
    dependencies: ["motion", "radix-ui"],
    extraFiles: [
      {
        src: "components/ui/tooltip.tsx",
        target: "components/ui/tooltip.tsx",
        type: "registry:component",
      },
      {
        src: "lib/get-strict-context.tsx",
        target: "lib/get-strict-context.tsx",
        type: "registry:lib",
      },
    ],
  },
  {
    slug: "pricing-1",
    title: "Pricing · Classic",
    description:
      "A centered 3-tier pricing section with a start-free banner and an inverted featured card.",
    category: "Blocks · Pricing",
    target: "components/lazy-ui/blocks/pricing-1/pricing-1.tsx",
    status: "published",
    kind: "block",
    dependencies: ["motion"],
    internalDependencies: ["counter"],
    extraFiles: [
      {
        src: "components/lazy-ui/blocks/pricing-shared/pricing-shared.tsx",
        target: "components/lazy-ui/blocks/pricing-shared/pricing-shared.tsx",
        type: "registry:component",
      },
    ],
  },
  {
    slug: "pricing-2",
    title: "Pricing · Bento",
    description:
      "A bento dual-tier layout — small Free card next to a wide inverted Plus card with two sub-prices and an animated Annual/Monthly toggle.",
    category: "Blocks · Pricing",
    target: "components/lazy-ui/blocks/pricing-2/pricing-2.tsx",
    status: "published",
    kind: "block",
    dependencies: ["motion"],
    internalDependencies: ["counter"],
    extraFiles: [
      {
        src: "components/lazy-ui/blocks/pricing-shared/pricing-shared.tsx",
        target: "components/lazy-ui/blocks/pricing-shared/pricing-shared.tsx",
        type: "registry:component",
      },
    ],
  },
  {
    slug: "pricing-3",
    title: "Pricing · Editorial",
    description:
      "Bold editorial pricing — oversized headline with italic accent, three minimal cards with massive price numerals and corner index labels.",
    category: "Blocks · Pricing",
    target: "components/lazy-ui/blocks/pricing-3/pricing-3.tsx",
    status: "published",
    kind: "block",
    dependencies: ["motion"],
    internalDependencies: ["counter"],
    extraFiles: [
      {
        src: "components/lazy-ui/blocks/pricing-shared/pricing-shared.tsx",
        target: "components/lazy-ui/blocks/pricing-shared/pricing-shared.tsx",
        type: "registry:component",
      },
    ],
  },
  {
    slug: "pricing-4",
    title: "Pricing · Matrix",
    description:
      "Dense feature comparison table with 4 tier columns, sectioned rows, and a breathing top-edge glow on the featured column.",
    category: "Blocks · Pricing",
    target: "components/lazy-ui/blocks/pricing-4/pricing-4.tsx",
    status: "published",
    kind: "block",
    dependencies: ["motion"],
    internalDependencies: ["counter"],
    extraFiles: [
      {
        src: "components/lazy-ui/blocks/pricing-shared/pricing-shared.tsx",
        target: "components/lazy-ui/blocks/pricing-shared/pricing-shared.tsx",
        type: "registry:component",
      },
    ],
  },
  {
    slug: "pricing-5",
    title: "Pricing · Usage",
    description:
      "Usage-based pricing with an interactive tier slider — left rail of trust points, right card whose price tweens between stops via an animated Counter.",
    category: "Blocks · Pricing",
    target: "components/lazy-ui/blocks/pricing-5/pricing-5.tsx",
    status: "published",
    kind: "block",
    dependencies: ["motion"],
    internalDependencies: ["counter"],
    extraFiles: [
      {
        src: "components/lazy-ui/blocks/pricing-shared/pricing-shared.tsx",
        target: "components/lazy-ui/blocks/pricing-shared/pricing-shared.tsx",
        type: "registry:component",
      },
    ],
  },
];

export function getPublishedComponents(): ComponentItem[] {
  return components.filter((c) => c.status === "published");
}

export function getComponentBySlug(slug: string): ComponentItem | undefined {
  return components.find((c) => c.slug === slug);
}

/** Published items rendered under `/blocks/<slug>` (full page sections). */
export function getPublishedBlocks(): ComponentItem[] {
  return components.filter((c) => c.status === "published" && c.kind === "block");
}

/** Published items rendered under `/components/<slug>` (single primitives). */
export function getPublishedComponentsOnly(): ComponentItem[] {
  return components.filter((c) => c.status === "published" && c.kind !== "block");
}

export function getBlockBySlug(slug: string): ComponentItem | undefined {
  return components.find((c) => c.slug === slug && c.kind === "block");
}
