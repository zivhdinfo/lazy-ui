type PropRow = {
  name: string;
  type: string;
  default?: string;
  description: string;
};

type CreditLink = {
  label: string;
  href: string;
  description: string;
};

type ComponentContent = {
  componentName: string;
  usageCode: string;
  api: PropRow[];
  credits?: CreditLink[];
};

const COMPONENT_CONTENT: Record<string, ComponentContent> = {
  "animated-tabs": {
    componentName: "AnimatedTabs",
    usageCode: `import { AnimatedTabs } from "@/components/lazy-ui/animated-tabs";

export function Demo() {
  return (
    <AnimatedTabs
      defaultValue="preview"
      tabs={[
        {
          value: "preview",
          label: "Preview",
          content: <div className="p-8 text-sm text-neutral-300">Preview content</div>,
        },
        {
          value: "code",
          label: "Code",
          content: <pre className="p-4 text-xs">{\`<Button />\`}</pre>,
        },
      ]}
    />
  );
}`,
    api: [
      {
        name: "tabs",
        type: "AnimatedTab[]",
        default: "—",
        description:
          "Array of `{ value, label, content }`. Order defines slide direction.",
      },
      {
        name: "defaultValue",
        type: "string",
        default: "tabs[0].value",
        description:
          "Initially selected tab `value`. Uncontrolled — ignored if `value` is set.",
      },
      {
        name: "value",
        type: "string",
        default: "—",
        description: "Selected tab `value`. Controlled mode; pair with `onValueChange`.",
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        default: "—",
        description: "Fires whenever the active tab changes (controlled or not).",
      },
      {
        name: "animate",
        type: '"basic" | "blur"',
        default: '"basic"',
        description:
          "Transition mode. `basic` = carousel slide; `blur` = stacked crossfade with soft blur on the outgoing half.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the root card.",
      },
    ],
    credits: [
      {
        label: "React useSyncExternalStore",
        href: "https://react.dev/reference/react/useSyncExternalStore",
        description: "SSR-safe state subscription for the active tab.",
      },
      {
        label: "ResizeObserver",
        href: "https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver",
        description: "Measures panel height for smooth stage transitions.",
      },
    ],
  },
  "copy-button": {
    componentName: "CopyButton",
    usageCode: `import { CopyButton } from "@/components/lazy-ui/copy-button";

export function Demo() {
  return (
    <>
      {/* Icon only (default) */}
      <CopyButton content="npm install lazy-ui" />

      {/* Inline label with RevealAnimate wipe */}
      <CopyButton content="npm install lazy-ui" text label="Copy" />

      {/* Tooltip label on hover */}
      <CopyButton content="npm install lazy-ui" text textAs="tooltip" />

      {/* Pick a different icon animation */}
      <CopyButton content="npm install lazy-ui" iconAnimate="reveal" />
    </>
  );
}`,
    api: [
      {
        name: "content",
        type: "string",
        default: "—",
        description: "Text written to the clipboard on click.",
      },
      {
        name: "text",
        type: "boolean",
        default: "false",
        description: "Show the label text alongside (or via tooltip) the icon.",
      },
      {
        name: "textAs",
        type: '"inline" | "tooltip"',
        default: '"inline"',
        description: "Where to render the label when `text` is true.",
      },
      {
        name: "revealAnimate",
        type: "boolean",
        default: "true",
        description:
          "When the inline label swaps, wipe it with RevealAnimate (old text wipes toward the icon, new text wipes out). Disable for an instant swap.",
      },
      {
        name: "iconAnimate",
        type: '"blur" | "draw" | "reveal"',
        default: '"blur"',
        description:
          "Icon swap animation. `blur` (default) = scale + opacity + blur; `draw` = stroke-dashoffset draw-in (same technique as the Checkbox indicator); `reveal` = RevealAnimate mask wipe.",
      },
      {
        name: "label",
        type: "string",
        default: '"Copy"',
        description: "Label text (rendered inline or inside the tooltip).",
      },
      {
        name: "copiedLabel",
        type: "string",
        default: '"Copied"',
        description: "Label swapped in while in the copied state.",
      },
      {
        name: "delay",
        type: "number",
        default: "4000",
        description: "How long the copied state lingers before reverting (ms).",
      },
      {
        name: "copied",
        type: "boolean",
        default: "—",
        description: "Controlled copied state. Leave undefined for uncontrolled.",
      },
      {
        name: "onCopiedChange",
        type: "(copied: boolean) => void",
        default: "—",
        description: "Fires whenever the copied state changes.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the button.",
      },
    ],
    credits: [
      {
        label: "Animate UI",
        href: "https://animate-ui.com/",
        description: "Reference point for compact motion-first copy actions.",
      },
      {
        label: "Clipboard API",
        href: "https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText",
        description: "Native clipboard write used by the button action.",
      },
    ],
  },
  "github-stars-button": {
    componentName: "GithubStarsButton",
    usageCode: `import { GithubStarsButton } from "@/components/lazy-ui/github-stars-button";

export function Demo() {
  return (
    <GithubStarsButton
      username="zivhdinfo"
      repo="lazy-ui"
      initialValue={12848}
    />
  );
}`,
    api: [
      {
        name: "username",
        type: "string",
        default: "—",
        description: "GitHub username or organization.",
      },
      {
        name: "repo",
        type: "string",
        default: "—",
        description: "GitHub repository name.",
      },
      {
        name: "label",
        type: "string",
        default: '"GitHub"',
        description: "Button label.",
      },
      {
        name: "value",
        type: "number",
        default: "—",
        description:
          "Controlled star count. When provided, automatic fetching is skipped.",
      },
      {
        name: "initialValue",
        type: "number",
        default: "0",
        description: "Fallback star count shown before the API request resolves.",
      },
      {
        name: "fetchStars",
        type: "boolean",
        default: "true when value is undefined",
        description:
          "Fetch the repository star count automatically when the component is uncontrolled.",
      },
      {
        name: "apiEndpoint",
        type: "string",
        default: "—",
        description:
          "Optional proxy endpoint. It receives `owner` and `repo` query params and should return `{ stars }`.",
      },
      {
        name: "showCount",
        type: "boolean",
        default: "true",
        description: "Show the animated star count beside the label.",
      },
      {
        name: "counterEffect",
        type: '"simple" | "wheel" | "smooth" | "fade" | "3d"',
        default: '"3d"',
        description: "Counter animation effect used for the star count.",
      },
      {
        name: "variant",
        type: '"default" | "star" | "ghost" | "solid" | "silver"',
        default: '"default"',
        description:
          "Visual palette. `silver` paints the brand silver gradient with dark text; `star` tints with yellow; `solid` is a deep black surface; `ghost` is borderless until hover.",
      },
      {
        name: "displayFormat",
        type: '"full" | "compact" | "plus"',
        default: '"compact"',
        description:
          "How the star count renders. `full` → 14,021. `compact` → 14k. `plus` → 14000+.",
      },
      {
        name: "hoverMode",
        type: '"none" | "label" | "full"',
        default: '"none"',
        description:
          "On hover: `label` swaps just the label text, `full` cross-fades the entire inner content for a call-to-action.",
      },
      {
        name: "hoverLabel",
        type: "string",
        default: '"Star this"',
        description: "Label shown on hover when `hoverMode=\"label\"`.",
      },
      {
        name: "hoverContent",
        type: "ReactNode",
        default: '"Star on GitHub"',
        description: "Inner content shown on hover when `hoverMode=\"full\"`.",
      },
      {
        name: "hoverDuration",
        type: "number",
        default: "300",
        description:
          "Duration in milliseconds of the hover content swap (`label` / `full` modes). Higher = slower, more deliberate feel.",
      },
      {
        name: "href",
        type: "string",
        default: "computed GitHub repo URL",
        description: "Override the generated repository URL.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the anchor button.",
      },
    ],
  },
  "flip-button": {
    componentName: "FlipButton",
    usageCode: `import { FlipButton } from "@/components/lazy-ui/flip-button";

export function Demo() {
  return (
    <div className="flex flex-wrap gap-3">
      <FlipButton reveal="Ship it" palette="light">Deploy</FlipButton>
      <FlipButton from="bottom" front="Open docs" reveal="Read now" palette="dark" />
    </div>
  );
}`,
    api: [
      {
        name: "children",
        type: "ReactNode",
        default: "—",
        description: "Front face content. Ignored when `front` is provided.",
      },
      {
        name: "front",
        type: "ReactNode",
        default: "children",
        description: "Explicit front face content, useful for generated usage snippets.",
      },
      {
        name: "reveal",
        type: "ReactNode",
        default: '"Continue"',
        description: "Back face content shown on hover or keyboard focus.",
      },
      {
        name: "from",
        type: '"top" | "bottom"',
        default: '"top"',
        description: "Direction the back face enters from.",
      },
      {
        name: "palette",
        type: '"light" | "dark"',
        default: '"light"',
        description:
          "Monochrome surface tuned to the ink design system. `light` is the white secondary-button face with ink text; `dark` is the ink-grad primary fill with white text.",
      },
      {
        name: "tapScale",
        type: "number",
        default: "0.96",
        description: "Scale applied while the pointer is pressed.",
      },
      {
        name: "perspective",
        type: "number",
        default: "900",
        description: "CSS perspective depth for the 3D flip.",
      },
      {
        name: "flipTransition",
        type: "Transition",
        default: "built-in spring",
        description: "Motion transition used by both faces.",
      },
      {
        name: "classNames",
        type: "FlipButtonClassNames",
        default: "—",
        description: "Slot-level class overrides for front, back, and content spans.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the root button.",
      },
    ],
  },
  "image-zoom": {
    componentName: "ImageZoom",
    usageCode: `import { Image, ImageZoom } from "@/components/lazy-ui/image-zoom";

export function Demo() {
  return (
    <ImageZoom zoomScale={2.6} edgeBlur>
      <Image src="/images/caitlyn.jpg" alt="Preview" />
    </ImageZoom>
  );
}`,
    api: [
      {
        name: "zoomScale",
        type: "number",
        default: "2.6",
        description: "Scale applied while the image is zoomed.",
      },
      {
        name: "duration",
        type: "number",
        default: "420",
        description: "Zoom transition duration in milliseconds.",
      },
      {
        name: "easing",
        type: "string",
        default: '"cubic-bezier(0.16, 1, 0.3, 1)"',
        description: "CSS easing used for zoom and edge-blur opacity.",
      },
      {
        name: "focusSmoothing",
        type: "number",
        default: "0.18",
        description:
          "Pointer focus lerp factor. Higher values follow the cursor faster.",
      },
      {
        name: "zoomOnClick",
        type: "boolean",
        default: "true",
        description: "Toggle persistent zoom on click or tap.",
      },
      {
        name: "zoomOnHover",
        type: "boolean",
        default: "true",
        description: "Zoom while hovering with a mouse, trackpad, or pen.",
      },
      {
        name: "edgeBlur",
        type: "boolean",
        default: "true",
        description:
          "Render a masked backdrop-blur rim around the current focus point.",
      },
      {
        name: "edgeBlurAmount",
        type: "number",
        default: "10",
        description: "Blur amount for the edge rim in pixels.",
      },
      {
        name: "focusRadius",
        type: "number",
        default: "42",
        description:
          "Clear area around the cursor; everything outside it gets the blur rim.",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        description: "Disable interaction and keep the image at scale 1.",
      },
      {
        name: "width",
        type: "React.CSSProperties['width']",
        default: '"100%"',
        description: "Root width.",
      },
      {
        name: "height",
        type: "React.CSSProperties['height']",
        default: '"100%"',
        description: "Root height.",
      },
      {
        name: "children",
        type: "React.ReactElement",
        default: "—",
        description: "Image or media element rendered inside the zoom surface.",
      },
    ],
    credits: [
      {
        label: "Animate UI Image Zoom",
        href: "https://animate-ui.com/docs/primitives/effects/image-zoom",
        description:
          "Reference and credit for the original Image Zoom primitive API.",
      },
      {
        label: "requestAnimationFrame",
        href: "https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame",
        description: "Pointer focus smoothing without scheduling leaks.",
      },
    ],
  },
  "spectral-card": {
    componentName: "SpectralCard",
    usageCode: `import { SpectralCard } from "@/components/lazy-ui/spectral-card";

export function Demo() {
  return (
    <SpectralCard
      media="/images/piano-girl.webp"
      width={360}
      height={640}
      tone="ember"
    >
      <div className="flex h-full items-end p-6 text-white">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/60">
            Lazy UI
          </p>
          <h3 className="text-3xl font-light">Spectral Card</h3>
        </div>
      </div>
    </SpectralCard>
  );
}`,
    api: [
      {
        name: "media",
        type: "string",
        default: '"/images/piano-girl.webp"',
        description: "Image source uploaded to the WebGL texture.",
      },
      {
        name: "mediaLabel",
        type: "string",
        default: '""',
        description:
          "Accessible label for the static reduced-motion fallback layer.",
      },
      {
        name: "mediaRatio",
        type: "number",
        default: "auto",
        description:
          "Source image width divided by height. Omit to detect it after load.",
      },
      {
        name: "tone",
        type: '"ember" | "aqua" | "violet" | "mono"',
        default: '"ember"',
        description: "Highlight tint and static fallback overlay preset.",
      },
      {
        name: "energy",
        type: "number",
        default: "1",
        description:
          "Master multiplier for hover distortion, tilt, chroma, and sheen.",
      },
      {
        name: "restZoom",
        type: "number",
        default: "0.08",
        description:
          "Always-on texture overscan. Keeps the image edge hidden during tilt.",
      },
      {
        name: "hoverZoom",
        type: "number",
        default: "0.24",
        description: "Texture zoom applied while the pointer is active.",
      },
      {
        name: "spectrum",
        type: "number",
        default: "0.7",
        description: "RGB channel separation around the pointer.",
      },
      {
        name: "displace",
        type: "number",
        default: "0.85",
        description: "Localized refraction strength near the pointer.",
      },
      {
        name: "gloss",
        type: "number",
        default: "0.45",
        description: "Diagonal highlight and light grain strength.",
      },
      {
        name: "tiltDepth",
        type: "number",
        default: "10",
        description: "Maximum card rotation in degrees.",
      },
      {
        name: "floatRange",
        type: "number",
        default: "10",
        description: "Pixel translation that follows the pointer.",
      },
      {
        name: "hoverDuration",
        type: "number",
        default: "1.8",
        description:
          "Duration in seconds for the shader hover value to ease in and out.",
      },
      {
        name: "motionDuration",
        type: "number",
        default: "0.45",
        description:
          "Duration in seconds for tilt, position, and scale to follow the pointer.",
      },
      {
        name: "alpha",
        type: "number",
        default: "1",
        description: "Canvas texture alpha.",
      },
      {
        name: "width",
        type: "React.CSSProperties['width']",
        default: '"100%"',
        description: "Root width.",
      },
      {
        name: "height",
        type: "React.CSSProperties['height']",
        default: '"100%"',
        description: "Root height.",
      },
      {
        name: "corner",
        type: "React.CSSProperties['borderRadius']",
        default: "24",
        description: "Root clipping radius.",
      },
      {
        name: "children",
        type: "ReactNode",
        default: "—",
        description: "Overlay content rendered above the image surface.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names passed to the root element.",
      },
    ],
    credits: [
      {
        label: "GSAP quickTo",
        href: "https://gsap.com/docs/v3/GSAP/gsap.quickTo()/",
        description:
          "Interruptible pointer and transform easing without spawning new tweens per move.",
      },
      {
        label: "WebGL2RenderingContext",
        href: "https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext",
        description:
          "Direct shader rendering without React Three Fiber or raycaster overhead.",
      },
      {
        label: "IntersectionObserver",
        href: "https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver",
        description: "Pauses the render loop work when the card is off-screen.",
      },
    ],
  },
  "smooth-cursor": {
    componentName: "SmoothCursor",
    usageCode: `import { SmoothCursor } from "@/components/lazy-ui/smooth-cursor";

export function Demo() {
  return (
    <SmoothCursor label="Design" color="#f97316">
      <div className="rounded-2xl border p-8">
        <button className="rounded-full bg-white px-4 py-2 text-black">
          Hover surface
        </button>
      </div>
    </SmoothCursor>
  );
}`,
    api: [
      {
        name: "children",
        type: "ReactNode",
        default: "—",
        description: "Surface where the custom cursor is active.",
      },
      {
        name: "label",
        type: "ReactNode",
        default: '"Lazy UI"',
        description: "Content rendered inside the cursor label pill.",
      },
      {
        name: "cursor",
        type: "ReactNode",
        default: "default arrow",
        description: "Custom cursor glyph. Leave empty to use the built-in arrow.",
      },
      {
        name: "color",
        type: "string",
        default: '"#f97316"',
        description: "Fill color for the cursor glyph and label background.",
      },
      {
        name: "textColor",
        type: "string",
        default: '"#ffffff"',
        description: "Text color inside the label pill.",
      },
      {
        name: "size",
        type: "number",
        default: "28",
        description: "Cursor glyph size in pixels.",
      },
      {
        name: "trigger",
        type: '"hover" | "press" | "always"',
        default: '"hover"',
        description:
          "When the cursor is visible. `always` still waits for a pointer position before showing.",
      },
      {
        name: "global",
        type: "boolean",
        default: "false",
        description:
          "Use viewport coordinates and a fixed overlay instead of local surface coordinates.",
      },
      {
        name: "showLabel",
        type: "boolean",
        default: "true",
        description: "Show or hide the label pill.",
      },
      {
        name: "hideNativeCursor",
        type: "boolean",
        default: "true",
        description: "Hide the browser cursor while the custom cursor is visible.",
      },
      {
        name: "hideOnTouch",
        type: "boolean",
        default: "true",
        description: "Do not render the custom cursor on coarse-pointer devices.",
      },
      {
        name: "offset",
        type: "{ x?: number; y?: number }",
        default: "{ x: 0, y: 0 }",
        description: "Pixel offset from the pointer to the cursor glyph anchor.",
      },
      {
        name: "labelOffset",
        type: "{ x?: number; y?: number }",
        default: "derived from size",
        description: "Pixel offset from the pointer to the label pill.",
      },
      {
        name: "spring",
        type: "SpringOptions",
        default: "built-in cursor spring",
        description: "Motion spring used by the cursor glyph.",
      },
      {
        name: "labelSpring",
        type: "SpringOptions",
        default: "built-in label spring",
        description: "Motion spring used by the lagging label.",
      },
      {
        name: "tiltStrength",
        type: "number",
        default: "12",
        description: "Extra rotation added from horizontal pointer velocity.",
      },
      {
        name: "tilt",
        type: "number",
        default: "-14",
        description: "Resting cursor rotation in degrees.",
      },
      {
        name: "pressScale",
        type: "number",
        default: "0.92",
        description: "Scale applied while the pointer is pressed.",
      },
      {
        name: "zIndex",
        type: "number",
        default: "50",
        description: "Stacking order for the cursor overlay layer.",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        description: "Disable the custom cursor and leave the wrapped content interactive.",
      },
      {
        name: "classNames",
        type: "SmoothCursorClassNames",
        default: "—",
        description: "Slot-level class overrides for root, layer, cursor, glyph, and label.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the root surface.",
      },
    ],
  },
  "reveal-animate": {
    componentName: "RevealAnimate",
    usageCode: `import { useState } from "react";
import { RevealAnimate } from "@/components/lazy-ui/reveal-animate";

export function Demo() {
  const [shown, setShown] = useState(true);
  return (
    <button onClick={() => setShown((v) => !v)}>
      <RevealAnimate trigger={shown}>Hello, world.</RevealAnimate>
    </button>
  );
}`,
    api: [
      {
        name: "children",
        type: "ReactNode",
        default: "—",
        description: "Content to reveal.",
      },
      {
        name: "trigger",
        type: "boolean",
        default: "true",
        description: "Reveal when true, hide when false. Toggle to play.",
      },
      {
        name: "from",
        type: '"left" | "right"',
        default: '"left"',
        description: "Side the reveal sweeps in from.",
      },
      {
        name: "duration",
        type: "number",
        default: "450",
        description: "Animation duration in milliseconds.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the wrapper span.",
      },
    ],
    credits: [
      {
        label: "CSS mask-image",
        href: "https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image",
        description: "Mask sweep that drives the reveal treatment.",
      },
    ],
  },
  "counter": {
    componentName: "Counter",
    usageCode: `import { Counter } from "@/components/lazy-ui/counter";

export function Demo() {
  return (
    <Counter
      value={12848}
      separator=","
      effect="3d"
      className="text-5xl font-semibold text-neutral-100"
    >
      <span className="ml-2 text-base text-neutral-500">users</span>
    </Counter>
  );
}`,
    api: [
      {
        name: "value",
        type: "number",
        default: "—",
        description: "Number to animate toward.",
      },
      {
        name: "speed",
        type: "number",
        default: "1000",
        description: "Animation duration in milliseconds.",
      },
      {
        name: "easing",
        type: '"linear" | "ease-out" | "ease-in-out"',
        default: '"ease-out"',
        description: "Progress easing used by the count animation.",
      },
      {
        name: "format",
        type: "(value: number) => string",
        default: "—",
        description:
          "Custom formatter. When provided, it owns the rendered text and overrides `separator` / `decimals`.",
      },
      {
        name: "separator",
        type: "string",
        default: "—",
        description: "Thousands separator, for example `,` or `.`.",
      },
      {
        name: "decimals",
        type: "number",
        default: "—",
        description: "Fixed decimal places for the animated output.",
      },
      {
        name: "effect",
        type: '"simple" | "wheel" | "smooth" | "fade" | "3d"',
        default: '"simple"',
        description:
          "`simple` renders text directly, `wheel` rolls digits, `smooth` blends through the shortest wheel path, `fade` pulses only changing digits, and `3d` flips each changed display digit through a small perspective cube.",
      },
      {
        name: "children",
        type: "ReactNode",
        default: "—",
        description: "Optional suffix or inline content rendered after the count.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the root span.",
      },
    ],
    credits: [
      {
        label: "requestAnimationFrame",
        href: "https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame",
        description: "Frame loop for dependency-free number interpolation.",
      },
    ],
  },
  "shiny-text": {
    componentName: "ShinyText",
    usageCode: `import { ShinyText } from "@/components/lazy-ui/text-animate/shiny-text";

export function Demo() {
  return (
    <ShinyText
      duration={5}
      intensity={0.32}
      className="text-5xl font-semibold text-neutral-100"
    >
      Shiny Text
    </ShinyText>
  );
}`,
    api: [
      {
        name: "children",
        type: "ReactNode",
        default: "—",
        description: "Text or inline content to render.",
      },
      {
        name: "duration",
        type: "number",
        default: "5",
        description: "Sweep duration in seconds.",
      },
      {
        name: "intensity",
        type: "number",
        default: "0.32",
        description: "Dimmed text intensity from 0 to 1.",
      },
      {
        name: "variant",
        type: '"beam" | "glass"',
        default: '"beam"',
        description: "`beam` uses a sharp moving glint, `glass` uses a softer liquid band.",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        description: "Render plain text without the animated treatment.",
      },
      {
        name: "respectMotion",
        type: "boolean",
        default: "true",
        description: "Stop animation when the user prefers reduced motion.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the root span.",
      },
    ],
  },
  "text-warp": {
    componentName: "TextWarp",
    usageCode: `import { useState } from "react";
import { TextWarp } from "@/components/lazy-ui/text-animate/text-warp";

export function Demo() {
  const [shown, setShown] = useState(true);
  return (
    <button onClick={() => setShown((v) => !v)}>
      <TextWarp
        text="Animate every letter."
        trigger={shown}
        className="text-5xl font-light text-neutral-100"
      />
    </button>
  );
}`,
    api: [
      {
        name: "text",
        type: "string",
        default: "—",
        description:
          "Text to animate. Words split on spaces; each letter is its own motion span.",
      },
      {
        name: "trigger",
        type: "boolean",
        default: "true",
        description:
          "Toggle to play. `true` runs the entry (letters zoom in from depth); `false` runs the exit (letters dissolve outward).",
      },
      {
        name: "wordStagger",
        type: "number",
        default: "0.2",
        description:
          "Seconds between word starts. Drives the parent motion variant's `staggerChildren`.",
      },
      {
        name: "letterStagger",
        type: "number",
        default: "0.04",
        description:
          "Seconds between letter starts inside a word. Drives the word's `staggerChildren`.",
      },
      {
        name: "entryDuration",
        type: "number",
        default: "1.2",
        description: "Entry animation duration in seconds.",
      },
      {
        name: "exitDuration",
        type: "number",
        default: "1.6",
        description: "Exit animation duration in seconds.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the root span.",
      },
    ],
  },
  "text-rise": {
    componentName: "TextRise",
    usageCode: `import { useState } from "react";
import { TextRise } from "@/components/lazy-ui/text-animate/text-rise";

export function Demo() {
  const [shown, setShown] = useState(true);
  return (
    <button onClick={() => setShown((v) => !v)}>
      <TextRise
        text="Rise into place."
        trigger={shown}
        className="text-5xl font-light text-neutral-100"
      />
    </button>
  );
}`,
    api: [
      {
        name: "text",
        type: "string",
        default: "—",
        description:
          "Text to animate. Words split on spaces; each letter rises individually.",
      },
      {
        name: "trigger",
        type: "boolean",
        default: "true",
        description:
          "Toggle to play. `true` rises letters into place; `false` lifts them away.",
      },
      {
        name: "wordStagger",
        type: "number",
        default: "0.12",
        description: "Seconds between word starts.",
      },
      {
        name: "letterStagger",
        type: "number",
        default: "0.035",
        description: "Seconds between letter starts inside a word.",
      },
      {
        name: "entryDuration",
        type: "number",
        default: "0.7",
        description: "Entry animation duration in seconds.",
      },
      {
        name: "exitDuration",
        type: "number",
        default: "0.5",
        description: "Exit animation duration in seconds.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the root span.",
      },
    ],
  },
  "spinning-text": {
    componentName: "SpinningText",
    usageCode: `import { SpinningText } from "@/components/lazy-ui/text-animate/spinning-text";

export function Demo() {
  return (
    <SpinningText
      duration={14}
      radius={5}
      center={<span className="text-2xl text-neutral-100">★</span>}
      className="text-[11px] tracking-[0.18em] text-neutral-200"
    >
      BUILD LAZILY • BUILD LAZILY •
    </SpinningText>
  );
}`,
    api: [
      {
        name: "children",
        type: "string",
        default: "—",
        description:
          "Letters laid evenly around the ring. The string is also mirrored into an `sr-only` span for screen readers.",
      },
      {
        name: "duration",
        type: "number",
        default: "10",
        description: "Seconds per full rotation (minimum 0.5).",
      },
      {
        name: "reverse",
        type: "boolean",
        default: "false",
        description:
          "Spin counter-clockwise instead of clockwise.",
      },
      {
        name: "radius",
        type: "number",
        default: "5",
        description:
          "Ring radius in `ch` units, so the circle scales naturally with the inherited font-size. The wrapper auto-sizes off this value.",
      },
      {
        name: "center",
        type: "ReactNode",
        default: "—",
        description:
          "Content rendered at the dead center (icon, badge, button). Sits above the spinning ring and ignores pointer events.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description:
          "Extra class names on the wrapper. Font-size and color cascade into each glyph via normal CSS inheritance.",
      },
    ],
  },
  "text-scramble": {
    componentName: "TextScramble",
    usageCode: `import { TextScramble } from "@/components/lazy-ui/text-animate/text-scramble";

export function Demo() {
  return (
    <TextScramble
      text="Hover to decode."
      trigger="hover"
      easing="ease-out"
      duration={800}
      className="text-3xl font-mono text-neutral-100"
    />
  );
}`,
    api: [
      {
        name: "text",
        type: "string",
        default: "—",
        description:
          "Final, locked-in text. Used as `aria-label` so screen readers always read the plain string regardless of mode.",
      },
      {
        name: "trigger",
        type: '"hover" | "mount" | "view"',
        default: '"hover"',
        description:
          "What kicks off the animation. `hover` runs on mouse-enter; `mount` plays once on first render; `view` plays the first time the element scrolls into the viewport.",
      },
      {
        name: "easing",
        type: '"linear" | "ease-in" | "ease-out" | "ease-in-out"',
        default: '"linear"',
        description:
          "Easing curve applied to the per-letter reveal schedule. `ease-out` resolves quickly at the start and slows toward the end; `ease-in` does the opposite.",
      },
      {
        name: "duration",
        type: "number",
        default: "800",
        description: "Total animation duration in ms (minimum 50ms).",
      },
      {
        name: "tickMs",
        type: "number",
        default: "30",
        description:
          "Frame interval in ms. Lower values refresh the scramble noise more frequently (minimum 8ms).",
      },
      {
        name: "charset",
        type: "string",
        default: '"X$@aHzo0y#?*01+"',
        description: "Glyphs sampled during the scramble noise — used by every mode.",
      },
      {
        name: "replayKey",
        type: "string | number | boolean",
        default: "—",
        description:
          "Change this value to replay the animation imperatively — bind it to a counter you increment on click, etc.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the root span.",
      },
    ],
  },
  "text-flip": {
    componentName: "TextFlip",
    usageCode: `import { TextFlip } from "@/components/lazy-ui/text-animate/text-flip";

export function Demo() {
  return (
    <TextFlip
      text="Hover to flip."
      direction="right"
      stagger={0.04}
      className="text-5xl font-light text-neutral-100"
    />
  );
}`,
    api: [
      {
        name: "text",
        type: "string",
        default: "—",
        description:
          "Text to animate. Words split on spaces; each grapheme is its own motion span.",
      },
      {
        name: "as",
        type: "ElementType",
        default: '"p"',
        description: "Root element tag — swap to `h1`, `span`, `div`, etc.",
      },
      {
        name: "direction",
        type: '"top" | "right" | "bottom" | "left"',
        default: '"right"',
        description:
          "Axis and direction the flip pivots around. `left`/`right` rotate on Y, `top`/`bottom` rotate on X.",
      },
      {
        name: "stagger",
        type: "number",
        default: "0.04",
        description:
          "Seconds between character starts. Combined with `staggerFrom` to decide each char's delay.",
      },
      {
        name: "staggerFrom",
        type: '"first" | "last" | "center" | number',
        default: '"first"',
        description:
          "Where the stagger originates. `first`/`last` walk one way, `center` ripples outward, a number anchors to a specific index.",
      },
      {
        name: "duration",
        type: "number",
        default: "0.55",
        description: "Per-character flip duration in seconds.",
      },
      {
        name: "trigger",
        type: '"hover" | "mount" | "view"',
        default: '"hover"',
        description:
          "What kicks the animation off. `hover` plays on mouse-enter (re-trigger-safe), `mount` plays once on first render, `view` plays the first time the element scrolls into view.",
      },
      {
        name: "transition",
        type: "Transition",
        default: "—",
        description:
          "Custom Motion transition. When set, it overrides the per-char duration/delay/easing — apply your own if you need a spring or different curve.",
      },
      {
        name: "perspective",
        type: "number",
        default: "1000",
        description: "Perspective applied to the root in pixels. Lower values exaggerate the depth.",
      },
      {
        name: "charClassName",
        type: "string",
        default: "—",
        description: "Class merged onto each character span — handy for per-letter color or shadow.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the root element.",
      },
    ],
  },
  "text-spin": {
    componentName: "TextSpin",
    usageCode: `import { useState } from "react";
import { TextSpin } from "@/components/lazy-ui/text-animate/text-spin";

export function Demo() {
  const [shown, setShown] = useState(true);
  return (
    <button onClick={() => setShown((v) => !v)}>
      <TextSpin
        text="Flip into view."
        trigger={shown}
        className="text-5xl font-light text-neutral-100"
      />
    </button>
  );
}`,
    api: [
      {
        name: "text",
        type: "string",
        default: "—",
        description:
          "Text to animate. Words split on spaces; each letter flips individually.",
      },
      {
        name: "trigger",
        type: "boolean",
        default: "true",
        description:
          "Toggle to play. `true` flips letters in; `false` rolls them out.",
      },
      {
        name: "wordStagger",
        type: "number",
        default: "0.14",
        description: "Seconds between word starts.",
      },
      {
        name: "letterStagger",
        type: "number",
        default: "0.04",
        description: "Seconds between letter starts inside a word.",
      },
      {
        name: "entryDuration",
        type: "number",
        default: "0.8",
        description: "Entry animation duration in seconds.",
      },
      {
        name: "exitDuration",
        type: "number",
        default: "0.6",
        description: "Exit animation duration in seconds.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the root span.",
      },
    ],
  },
  progress: {
    componentName: "Progress",
    usageCode: `import { Progress } from "@/components/lazy-ui/progress";

export function Demo() {
  return (
    <Progress
      value={62}
      animation="spring"
      effect="glow"
      valuePosition="edge-leading"
      className="w-72"
    />
  );
}`,
    api: [
      {
        name: "value",
        type: "number | null",
        default: "—",
        description:
          "Current value (0 → `max`). Pass `null` or omit to show the indeterminate shuttle loop.",
      },
      {
        name: "max",
        type: "number",
        default: "100",
        description: "Maximum value. The indicator fills to `value / max`.",
      },
      {
        name: "size",
        type: '"sm" | "md" | "lg"',
        default: '"md"',
        description: "Visual size preset — controls bar height.",
      },
      {
        name: "animation",
        type: '"spring" | "smooth" | "wobble"',
        default: '"spring"',
        description:
          "Curve used when `value` changes. `spring` is balanced; `smooth` is a clean ease-out tween; `wobble` is bouncy / underdamped.",
      },
      {
        name: "effect",
        type: '"none" | "stripes" | "glow" | "pulse"',
        default: '"none"',
        description:
          "Visual treatment of the indicator. `stripes` paints a moving barber-pole. `glow` replaces the white fill with a gradient through `glowColors` and modulates brightness directionally — bright pulse when the value rises, dim pulse when it falls. `pulse` dims the fill rhythmically.",
      },
      {
        name: "glowPalette",
        type: '"default" | "rainbow" | "warm" | "cool" | string[]',
        default: '"default"',
        description:
          "Palette used by the `glow` effect. Pass a preset name for a built-in template (`default` is `[\"#f7f7f7\", \"#e100ff\"]`; `rainbow` is 7 hues; `warm` and `cool` are 3-color sets) — or pass your own array of CSS colors for full control. The gradient sits inside the white fill and only lights up while the value is changing.",
      },
      {
        name: "valuePosition",
        type: '"hidden" | "end" | "above-leading" | "inside-leading" | "edge-leading"',
        default: '"hidden"',
        description:
          "Where to render the live value label. `end` floats above the bar right-aligned; `above-leading` floats above the bar and x-tracks the fill's leading edge; `inside-leading` sits inside the fill anchored to its leading edge (the bar auto-grows to fit the text); `edge-leading` is a pill chip straddling the bar's top border at the leading edge. Floating labels counter-translate so they stay inside the track at both ends. All positions stream their text frame-by-frame via a DOM ref — no React re-renders.",
      },
      {
        name: "formatValue",
        type: "(value: number, max: number) => string",
        default: "v => `${Math.round((v / max) * 100)}%`",
        description: "Custom formatter for the displayed label.",
      },
      {
        name: "getValueLabel",
        type: "(value: number, max: number) => string",
        default: "—",
        description:
          "Screen-reader label (`aria-valuetext`). Forwarded to the Radix primitive.",
      },
      {
        name: "trackClassName",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the track (outer bar).",
      },
      {
        name: "indicatorClassName",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the indicator (the fill).",
      },
      {
        name: "valueClassName",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the value label span.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description:
          "Extra class names merged onto the outermost element. When a floating label is rendered (`end`, `above-leading`, `edge-leading`), this is the wrapper that the label is positioned against — so width constraints (e.g. `max-w-sm`) anchor the label correctly to the bar's outer frame.",
      },
    ],
    credits: [
      {
        label: "Radix Progress",
        href: "https://www.radix-ui.com/primitives/docs/components/progress",
        description: "Accessible progress semantics and primitive structure.",
      },
      {
        label: "Motion for React",
        href: "https://motion.dev/docs/react",
        description: "Motion values drive the fill and live value label.",
      },
    ],
  },
  "spring-icon-loader": {
    componentName: "SpringIconLoader",
    usageCode: `import { useState } from "react";
import { SpringIconLoader } from "@/components/lazy-ui/spring-icon-loader";

const icons = [
  "/images/loading/1.png",
  "/images/loading/2.png",
  "/images/loading/3.png",
];

export function Demo() {
  const [loading, setLoading] = useState(true);

  return (
    <SpringIconLoader
      icons={icons}
      loading={loading}
      size={56}
      bounceHeight={68}
      gravity={1550}
      squash={0.12}
      stretch={0.1}
      tilt={7}
      shadowColor="#94a3b8"
      shadowOpacity={0.46}
      onIconChange={({ index }) => console.log("Icon landed", index)}
      onComplete={() => console.log("Loading complete")}
    />
  );
}`,
    api: [
      {
        name: "icons",
        type: "(string | { src: string; alt?: string })[]",
        default: "loading demo icons",
        description:
          "Image URLs cycled by the loader. Icons can be strings or `{ src, alt }` objects, and they only change at the landing moment.",
      },
      {
        name: "loading",
        type: "boolean",
        default: "true",
        description:
          "Controls the loop. `true` keeps bouncing; `false` stops the loader and fires `onComplete` once.",
      },
      {
        name: "initialIndex",
        type: "number",
        default: "0",
        description: "Icon index used for the first rendered image.",
      },
      {
        name: "size",
        type: "number",
        default: "48",
        description: "Icon box size in CSS pixels.",
      },
      {
        name: "bounceHeight",
        type: "number",
        default: "58",
        description: "Jump height in pixels, measured upward from the landing point.",
      },
      {
        name: "gravity",
        type: "number",
        default: "1550",
        description:
          "Downward acceleration in px/s2. Higher values make each hop faster and heavier.",
      },
      {
        name: "impactHold",
        type: "number",
        default: "0.09",
        description:
          "Seconds the icon stays on the ground before launching into the next bounce.",
      },
      {
        name: "squash",
        type: "number",
        default: "0.12",
        description:
          "Squash amount at impact. The icon widens and compresses slightly when it lands.",
      },
      {
        name: "stretch",
        type: "number",
        default: "0.1",
        description:
          "Velocity-based stretch while the icon launches and falls. Keeps the bounce feeling elastic.",
      },
      {
        name: "tilt",
        type: "number",
        default: "7",
        description:
          "Airborne left-right rotation in degrees. Direction alternates each landing so the loop feels weightier.",
      },
      {
        name: "iconTransition",
        type: '"fade" | "blur" | "none"',
        default: '"blur"',
        description:
          "Image transition used only at impact. `blur` adds the smoothest scale + blur fade.",
      },
      {
        name: "shadowColor",
        type: "string",
        default: '"#94a3b8"',
        description:
          "CSS color for the ground shadow. The gray default is tuned to stay visible on dark previews.",
      },
      {
        name: "shadowOpacity",
        type: "number",
        default: "0.46",
        description:
          "Master shadow opacity at the landing point. Use this for normal customization.",
      },
      {
        name: "shadowMinScale",
        type: "number",
        default: "0.38",
        description:
          "Advanced shadow control: smallest width scale at the top of the bounce.",
      },
      {
        name: "shadowMaxOpacity",
        type: "number",
        default: "shadowOpacity",
        description:
          "Advanced override for landing opacity. Usually use `shadowOpacity` instead.",
      },
      {
        name: "shadowMinOpacity",
        type: "number",
        default: "0.08",
        description: "Advanced shadow control: shadow opacity near the apex.",
      },
      {
        name: "label",
        type: "string",
        default: '"Loading"',
        description: "Accessible label applied to the status root.",
      },
      {
        name: "onIconChange",
        type: "(event: SpringIconLoaderEvent) => void",
        default: "—",
        description:
          "Fired exactly when the icon touches the ground and the next icon is selected.",
      },
      {
        name: "onBounce",
        type: "(event: SpringIconLoaderEvent) => void",
        default: "—",
        description:
          "Fired on every landing, including loops where there is only one icon.",
      },
      {
        name: "onComplete",
        type: "(event: SpringIconLoaderEvent) => void",
        default: "—",
        description: "Fired once when `loading` changes from true to false.",
      },
      {
        name: "classNames",
        type: "SpringIconLoaderClassNames",
        default: "—",
        description:
          "Slot-level class overrides for stage, icon, body, image, and shadow.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the root element.",
      },
    ],
    credits: [
      {
        label: "GSAP ticker",
        href: "https://gsap.com/docs/v3/GSAP/gsap.ticker/",
        description:
          "Runs the tiny physics loop and cleans up cleanly through `useGSAP`.",
      },
      {
        label: "Motion AnimatePresence",
        href: "https://motion.dev/docs/react-animate-presence",
        description:
          "Crossfades the image layers without changing icons between landings.",
      },
    ],
  },
  switch: {
    componentName: "Switch",
    usageCode: `import { Switch } from "@/components/lazy-ui/switch";

export function Demo() {
  return (
    <div className="flex items-center gap-3">
      <Switch id="airplane" defaultChecked />
      <label htmlFor="airplane" className="text-sm text-neutral-200">
        Airplane mode
      </label>
    </div>
  );
}`,
    api: [
      {
        name: "checked",
        type: "boolean",
        default: "—",
        description:
          "Controlled checked state. Pair with `onCheckedChange`. Leave undefined for uncontrolled.",
      },
      {
        name: "defaultChecked",
        type: "boolean",
        default: "false",
        description: "Initial state when uncontrolled.",
      },
      {
        name: "onCheckedChange",
        type: "(checked: boolean) => void",
        default: "—",
        description: "Fires on click, keyboard (Space / Enter), or drag release.",
      },
      {
        name: "size",
        type: '"sm" | "md" | "lg"',
        default: '"md"',
        description: "Visual size preset.",
      },
      {
        name: "animation",
        type: '"spring" | "wobble" | "smooth" | "stretch"',
        default: '"spring"',
        description:
          "Snap animation on release / state change. `spring` is balanced with mild overshoot; `wobble` is bouncy and underdamped; `smooth` is a clean ease-out tween with no overshoot; `stretch` is a spring with a horizontal squash keyframe so the thumb gels through travel.",
      },
      {
        name: "disableDrag",
        type: "boolean",
        default: "false",
        description:
          "Disable click-and-drag interaction. Toggle becomes click / keyboard only.",
      },
      {
        name: "flickVelocity",
        type: "number",
        default: "0.35",
        description:
          "Velocity threshold (px / ms) at release. Above this, the flick direction wins over position — a fast nudge toggles even before passing the midpoint.",
      },
      {
        name: "thumbContent",
        type: "ReactNode",
        default: "—",
        description: "Content rendered inside the thumb (icon, dot, etc.).",
      },
      {
        name: "thumbClassName",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the thumb.",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        description: "Greys out the switch and blocks pointer / keyboard input.",
      },
      {
        name: "required",
        type: "boolean",
        default: "false",
        description: "Marks the switch as required for form submission.",
      },
      {
        name: "name",
        type: "string",
        default: "—",
        description: "Name forwarded to the hidden form input.",
      },
      {
        name: "value",
        type: "string",
        default: '"on"',
        description: "Value sent with the form when checked.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the root track.",
      },
    ],
    credits: [
      {
        label: "Radix Switch",
        href: "https://www.radix-ui.com/primitives/docs/components/switch",
        description: "Accessible switch behavior and form integration.",
      },
      {
        label: "Motion for React",
        href: "https://motion.dev/docs/react",
        description: "Release curves and drag snap animation.",
      },
    ],
  },
  "glass-button": {
    componentName: "GlassButton",
    usageCode: `import { GlassButton } from "@/components/lazy-ui/glass-button";

export function Demo() {
  return (
    // The glass refracts whatever sits behind it — place it over imagery.
    <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-[url('/your-bg.jpg')] bg-cover p-8">
      <GlassButton size="md">Hover me</GlassButton>
      <GlassButton size="lg" tint="cool" distortion={18}>
        Get started
      </GlassButton>
    </div>
  );
}`,
    api: [
      {
        name: "children",
        type: "ReactNode",
        default: "—",
        description:
          "Button label or arbitrary inline content. Rendered twice so the roll can swap one copy for the next.",
      },
      {
        name: "distortion",
        type: "number",
        default: "14",
        description:
          "Refraction strength in CSS pixels — how hard the glass bends the background behind it. The idle drift swings ±2; hover swings ±4 around base+4; a click pops a +24 wave that decays over ~700ms.",
      },
      {
        name: "frequency",
        type: "number",
        default: "0.009",
        description:
          "Turbulence base frequency. Smaller values give bigger, more lens-like ripples; larger values give a finer frosted texture. Drifts over time so the ripple pattern keeps reshaping.",
      },
      {
        name: "tint",
        type: '"neutral" | "cool" | "warm"',
        default: '"neutral"',
        description:
          "Faint cast on the frosted fill and sheen. `cool` leans blue, `warm` leans amber, `neutral` stays clear.",
      },
      {
        name: "size",
        type: '"sm" | "md" | "lg"',
        default: '"md"',
        description: "Visual size preset — controls padding and text size.",
      },
      {
        name: "roll",
        type: "boolean",
        default: "true",
        description:
          "Roll the label up to a fresh copy on hover. Auto-disabled when the user prefers reduced motion.",
      },
      {
        name: "staticGlass",
        type: "boolean",
        default: "false",
        description:
          "Freeze the liquid drift so the refraction is static. Auto-enabled when the user prefers reduced motion.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the underlying button.",
      },
    ],
  },
  checkbox: {
    componentName: "Checkbox",
    usageCode: `import { Checkbox } from "@/components/lazy-ui/checkbox";

export function Demo() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="terms" defaultChecked />
      <label htmlFor="terms" className="text-sm text-neutral-200">
        Accept terms and conditions
      </label>
    </div>
  );
}`,
    api: [
      {
        name: "checked",
        type: 'boolean | "indeterminate"',
        default: "—",
        description:
          "Controlled checked state. Pass `\"indeterminate\"` for the three-state look. Pair with `onCheckedChange`.",
      },
      {
        name: "defaultChecked",
        type: 'boolean | "indeterminate"',
        default: "false",
        description: "Initial state when uncontrolled.",
      },
      {
        name: "onCheckedChange",
        type: '(checked: boolean | "indeterminate") => void',
        default: "—",
        description: "Fires whenever the state changes.",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        description: "Greys out the box and blocks clicks/keyboard.",
      },
      {
        name: "required",
        type: "boolean",
        default: "false",
        description: "Marks the box as required for form submission.",
      },
      {
        name: "name",
        type: "string",
        default: "—",
        description: "Name forwarded to the hidden form input.",
      },
      {
        name: "value",
        type: "string",
        default: '"on"',
        description: "Value sent with the form when checked.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the root button.",
      },
    ],
    credits: [
      {
        label: "Radix Checkbox",
        href: "https://www.radix-ui.com/primitives/docs/components/checkbox",
        description: "Accessible checked and indeterminate state model.",
      },
    ],
  },
  iphone: {
    componentName: "Iphone",
    usageCode: `import { Iphone } from "@/components/lazy-ui/device-mocks/iphone";

export function Demo() {
  return (
    <Iphone
      src="/lock-screen.jpg"
      time="9:41"
      signal={4}
      wifi
      battery={82}
      className="max-w-[280px]"
    />
  );
}`,
    api: [
      {
        name: "src",
        type: "string",
        default: "—",
        description:
          "Image src painted into the screen area. Cropped with `object-cover object-top`.",
      },
      {
        name: "videoSrc",
        type: "string",
        default: "—",
        description:
          "Video src for the screen — autoplays muted, loops, plays inline. Wins over `src`.",
      },
      {
        name: "children",
        type: "ReactNode",
        default: "—",
        description:
          "Custom screen content. Wins over `src` / `videoSrc` — drop in a div, gradient, or full lock-screen mock.",
      },
      {
        name: "statusBar",
        type: "boolean",
        default: "true",
        description: "Show the status bar row (time + signal + wifi + battery).",
      },
      {
        name: "time",
        type: "string",
        default: '"9:41"',
        description: "Time label rendered on the left of the status bar.",
      },
      {
        name: "signal",
        type: "0 | 1 | 2 | 3 | 4",
        default: "4",
        description: "Filled signal bars. Empty bars dim to 30% opacity.",
      },
      {
        name: "wifi",
        type: "boolean",
        default: "true",
        description: "Show the wifi glyph.",
      },
      {
        name: "battery",
        type: "number",
        default: "100",
        description: "Battery percentage (0–100). Drives the inner fill width.",
      },
      {
        name: "batteryText",
        type: "boolean",
        default: "false",
        description: "Render the percentage number inside the battery glyph.",
      },
      {
        name: "lockButtons",
        type: "boolean",
        default: "true",
        description:
          "Show the bottom flashlight + camera lock-screen shortcuts.",
      },
      {
        name: "homeIndicator",
        type: "boolean",
        default: "true",
        description: "Show the bottom home-indicator pill.",
      },
      {
        name: "bezelColor",
        type: "string",
        default: '"#de7343"',
        description:
          "CSS color for the thin outer phone frame and the four side buttons. The inner screen bezel stays black regardless.",
      },
      {
        name: "screenClassName",
        type: "string",
        default: "—",
        description:
          "Extra class merged onto the screen wrapper (the rounded layer that clips media).",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description:
          "Extra class merged onto the outer element. Width is governed here — the SVG fills it and the aspect-ratio is locked.",
      },
    ],
  },
  "animate-tooltip": {
    componentName: "AnimateTooltip",
    usageCode: `import {
  AnimateTooltip,
  AnimateTooltipGroup,
} from "@/components/lazy-ui/animate-tooltip";

export function Demo() {
  return (
    <AnimateTooltipGroup>
      <div className="flex gap-3">
        <AnimateTooltip content="First tip" side="auto" arrow>
          <button className="rounded bg-white px-3 py-1.5 text-sm text-black">
            One
          </button>
        </AnimateTooltip>
        <AnimateTooltip content="Slides over from One" side="auto" arrow>
          <button className="rounded bg-white px-3 py-1.5 text-sm text-black">
            Two
          </button>
        </AnimateTooltip>
      </div>
    </AnimateTooltipGroup>
  );
}`,
    api: [
      {
        name: "children",
        type: "ReactElement",
        default: "—",
        description:
          "The trigger — a single React element. AnimateTooltip clones it to attach pointer/focus handlers and a ref.",
      },
      {
        name: "content",
        type: "ReactNode",
        default: "—",
        description: "The tooltip body.",
      },
      {
        name: "side",
        type: '"top" | "right" | "bottom" | "left" | "auto"',
        default: '"top"',
        description:
          'Which side of the trigger to anchor to. `"auto"` picks the side from where the cursor enters the trigger — top half → top, bottom half → bottom, left/right by dominant axis.',
      },
      {
        name: "sideOffset",
        type: "number",
        default: "6",
        description: "Pixel gap between the trigger and the tooltip.",
      },
      {
        name: "align",
        type: '"start" | "center" | "end"',
        default: '"center"',
        description: "Alignment along the chosen side.",
      },
      {
        name: "alignOffset",
        type: "number",
        default: "0",
        description: "Pixel offset along the alignment axis.",
      },
      {
        name: "delayDuration",
        type: "number",
        default: "150",
        description:
          "Delay before the first hover opens the tooltip (ms). Forwarded to the auto-wrapped `TooltipProvider`'s `openDelay`.",
      },
      {
        name: "arrow",
        type: "boolean",
        default: "false",
        description: "Show the small arrow pointing at the trigger.",
      },
      {
        name: "followCursor",
        type: "boolean | \"x\" | \"y\"",
        default: "false",
        description:
          "Let the tooltip drift toward the cursor while it hovers the trigger. `true` follows on both axes; `\"x\"` or `\"y\"` constrains to one axis.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the content.",
      },
    ],
    credits: [
      {
        label: "Radix Tooltip",
        href: "https://www.radix-ui.com/primitives/docs/components/tooltip",
        description: "Provider, trigger, portal, and positioning primitives.",
      },
      {
        label: "Motion for React",
        href: "https://motion.dev/docs/react",
        description: "Shared layout slide and cursor-follow spring.",
      },
    ],
  },
  "circle-cipher": {
    componentName: "CircleCipher",
    usageCode: `import { CircleCipher } from "@/components/lazy-ui/circle-cipher";

export function Demo() {
  return (
    <div className="relative h-96 w-full overflow-hidden bg-black">
      <CircleCipher color="#00ff00" />
    </div>
  );
}`,
    api: [
      {
        name: "characters",
        type: "string",
        default: '"✶✤↣⌧✷*.;:"',
        description:
          "Glyph charset. Each lit cell picks one at random and keeps it for that cell's lifetime.",
      },
      {
        name: "size",
        type: "number",
        default: "24",
        description: "Cell size in pixels. Smaller values produce a denser grid.",
      },
      {
        name: "color",
        type: "string",
        default: '"#00ff00"',
        description: "CSS color used to draw the glyphs.",
      },
      {
        name: "spread",
        type: "number",
        default: "80",
        description: "Brush radius around the cursor, in pixels.",
      },
      {
        name: "persistence",
        type: "number",
        default: "2",
        description: "Trail half-life — higher values make glyphs linger longer.",
      },
      {
        name: "enableFade",
        type: "boolean",
        default: "true",
        description:
          "Fade each glyph by its current trail strength. When false, every lit glyph draws at full alpha.",
      },
      {
        name: "opacity",
        type: "number",
        default: "1",
        description: "Multiplier applied to the final draw alpha.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the root container.",
      },
    ],
  },
  "pixel-cursor": {
    componentName: "PixelCursor",
    usageCode: `import { PixelCursor } from "@/components/lazy-ui/pixel-cursor";

export function Demo() {
  return (
    <div className="relative h-96 w-full overflow-hidden bg-black">
      <PixelCursor
        color="#ffffff"
        edgeColor1="#7c3aed"
        edgeColor2="#22d3ee"
        lag={0.8}
      />
    </div>
  );
}`,
    api: [
      {
        name: "color",
        type: "string",
        default: '"#ffffff"',
        description:
          "Core color. Fills the brightest pixels at the center of the cursor trail.",
      },
      {
        name: "edgeColor1",
        type: "string",
        default: '"#7c3aed"',
        description: "Secondary color for the mid-strength ring of pixels.",
      },
      {
        name: "edgeColor2",
        type: "string",
        default: '"#22d3ee"',
        description: "Secondary color for the faintest outer ring of pixels.",
      },
      {
        name: "pixelSize",
        type: "number",
        default: "8",
        description:
          "Square pixel size in pixels. Larger values light fewer, chunkier pixels.",
      },
      {
        name: "spread",
        type: "number",
        default: "70",
        description: "Brush radius around the cursor, in pixels.",
      },
      {
        name: "density",
        type: "number",
        default: "0.6",
        description:
          "Fraction (0..1) of cells eligible to light. Lower values thin the trail into a sparser speckle.",
      },
      {
        name: "persistence",
        type: "number",
        default: "1.5",
        description: "Trail half-life — higher values make pixels linger longer.",
      },
      {
        name: "lag",
        type: "number",
        default: "0",
        description:
          "How far the pixels lag behind the cursor (0..1). 0 follows instantly; higher values trail further behind with more delay.",
      },
      {
        name: "opacity",
        type: "number",
        default: "1",
        description: "Multiplier applied to the final draw alpha.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the root container.",
      },
    ],
  },
  "liquid-reveal": {
    componentName: "LiquidReveal",
    usageCode: `import { LiquidReveal } from "@/components/lazy-ui/liquid-reveal";

export function Demo() {
  return (
    <div className="relative h-[480px] w-full overflow-hidden rounded-xl">
      <LiquidReveal
        frontImage="/images/armor.png"
        backImage="/images/human.png"
      />
    </div>
  );
}`,
    api: [
      {
        name: "frontImage",
        type: "string",
        default: "—",
        description:
          "URL of the image shown by default. Stays visible where the liquid hasn't passed.",
      },
      {
        name: "backImage",
        type: "string",
        default: "—",
        description:
          "URL of the image revealed inside the dye trail as the cursor disturbs the surface.",
      },
      {
        name: "cursorSize",
        type: "number",
        default: "200",
        description: "Radius of the dye splat dropped at the cursor, in pixels.",
      },
      {
        name: "mouseForce",
        type: "number",
        default: "60",
        description:
          "Strength of the velocity impulse injected by mouse motion. Higher = more splashy.",
      },
      {
        name: "resolution",
        type: "number",
        default: "0.5",
        description:
          "Simulation buffer scale (0.25–1). Lower is cheaper but blurrier.",
      },
      {
        name: "viscous",
        type: "number",
        default: "42",
        description:
          "Velocity diffusion — higher values make the fluid feel thicker and slower.",
      },
      {
        name: "revealStrength",
        type: "number",
        default: "1",
        description: "How aggressively the dye uncovers the back image.",
      },
      {
        name: "revealSoftness",
        type: "number",
        default: "0.85",
        description:
          "Soft edge of the reveal mask. 0 is a hard cut; >1 fades broadly.",
      },
      {
        name: "autoDemo",
        type: "boolean",
        default: "true",
        description:
          "Drift the cursor across the canvas when the user is idle.",
      },
      {
        name: "autoSpeed",
        type: "number",
        default: "0.5",
        description: "Idle drift speed, in normalized units per second.",
      },
      {
        name: "autoResumeDelay",
        type: "number",
        default: "1200",
        description:
          "Milliseconds the cursor must be idle before the demo drift resumes.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the root container.",
      },
    ],
  },
  "liquid-transition": {
    componentName: "LiquidTransition",
    usageCode: `import { LiquidTransition } from "@/components/lazy-ui/liquid-transition";

export function Demo() {
  return (
    <div className="relative h-[480px] w-full overflow-hidden rounded-xl">
      <LiquidTransition
        imageA="/images/liqid-hole-dark.png"
        imageB="/images/liqid-hole-light.png"
      />
    </div>
  );
}`,
    api: [
      {
        name: "imageA",
        type: "string",
        default: "—",
        description: "URL of the first image. Fully visible at progress 0.",
      },
      {
        name: "imageB",
        type: "string",
        default: "—",
        description: "URL of the second image. Fully visible at progress 1.",
      },
      {
        name: "progress",
        type: "number",
        default: "—",
        description:
          "Controlled progress 0..1. When supplied, autoplay is ignored.",
      },
      {
        name: "autoPlay",
        type: "boolean",
        default: "true",
        description:
          "Animate progress automatically. Ignored when `progress` is provided.",
      },
      {
        name: "duration",
        type: "number",
        default: "2400",
        description: "Length of one A → B sweep in milliseconds.",
      },
      {
        name: "hold",
        type: "number",
        default: "1200",
        description:
          "Milliseconds to dwell at each end of the sweep when looping.",
      },
      {
        name: "loop",
        type: "boolean",
        default: "true",
        description:
          "Ping-pong forever. When false, the transition stops at B after one sweep.",
      },
      {
        name: "direction",
        type: `"noise" | "horizontal" | "vertical" | "radial"`,
        default: `"noise"`,
        description:
          "Shape of the moving front. Noise is a liquid blob, the others bias the sweep along an axis or outward from the center.",
      },
      {
        name: "drip",
        type: "number",
        default: "0.55",
        description:
          "How strongly the direction biases the noise field. 0 is a pure noise blob, 1 is a clean directional wipe.",
      },
      {
        name: "distortion",
        type: "number",
        default: "0.08",
        description:
          "Liquid refraction amplitude at the moving boundary, in UV units.",
      },
      {
        name: "softness",
        type: "number",
        default: "0.18",
        description:
          "Soft edge of the boundary mask. 0 is a hard wipe; larger values feather the front.",
      },
      {
        name: "noiseScale",
        type: "number",
        default: "2.4",
        description: "Noise scale — higher values produce finer streaks.",
      },
      {
        name: "onComplete",
        type: "() => void",
        default: "—",
        description:
          "Called when the forward sweep finishes (and at each end of a ping-pong cycle).",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the root container.",
      },
    ],
  },
  "wave-cipher": {
    componentName: "WaveCipher",
    usageCode: `import { WaveCipher } from "@/components/lazy-ui/wave-cipher";

export function Demo() {
  return (
    <div className="relative h-96 w-full overflow-hidden bg-black">
      <WaveCipher columns={3} invertColumns />
    </div>
  );
}`,
    api: [
      {
        name: "columns",
        type: "number",
        default: "3",
        description:
          "Number of vertical column bands. Each band gets its own phase-offset wave.",
      },
      {
        name: "invertColumns",
        type: "boolean",
        default: "false",
        description:
          "Move bright bands from column centers to column edges — produces thin rivers of glyphs between dark columns.",
      },
      {
        name: "bandWidth",
        type: "number",
        default: "0.6",
        description:
          "Width of the bright band inside each column, in 0..1 of the column half-width. Wider = thicker glyph river; especially visible with `invertColumns`.",
      },
      {
        name: "characters",
        type: "string",
        default: '"0123456789ABCDEF"',
        description:
          "Glyph charset. Each cell picks one deterministically and the index cycles slowly with `glyphChurn`.",
      },
      {
        name: "color",
        type: "string",
        default: '"#d4d4d4"',
        description: "CSS color used to draw the glyphs.",
      },
      {
        name: "speed",
        type: "number",
        default: "0.8",
        description: "Wave travel speed. Higher values pull crests through columns faster.",
      },
      {
        name: "size",
        type: "number",
        default: "16",
        description: "Cell size in pixels. Smaller values produce a denser glyph grid.",
      },
      {
        name: "noisePower",
        type: "number",
        default: "2",
        description:
          "Exponent applied to wave peaks. Higher = sharper, darker valleys; lower = soft glow.",
      },
      {
        name: "glyphChurn",
        type: "number",
        default: "0.6",
        description: "How fast each cell cycles its glyph. Zero locks the charset to its initial pick.",
      },
      {
        name: "opacity",
        type: "number",
        default: "1",
        description: "Multiplier applied to the final draw alpha.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the root container.",
      },
    ],
  },
  "horizon-cipher": {
    componentName: "HorizonCipher",
    usageCode: `import { HorizonCipher } from "@/components/lazy-ui/horizon-cipher";

export function Demo() {
  return (
    <div className="relative h-96 w-full overflow-hidden">
      <HorizonCipher />
    </div>
  );
}`,
    api: [
      {
        name: "characters",
        type: "string",
        default: '"0123456789ABCDEF"',
        description:
          "Glyph charset. Each cell picks one deterministically; picks shuffle on each integer scroll step.",
      },
      {
        name: "columns",
        type: "number",
        default: "32",
        description:
          "Number of columns across the canvas at the near row. Cell width auto-derives from `canvasWidth / columns`, so more columns means a denser grid (not a wider one).",
      },
      {
        name: "depthRows",
        type: "number",
        default: "22",
        description: "Number of depth rows from the near edge up to the horizon.",
      },
      {
        name: "vanishY",
        type: "number",
        default: "0.35",
        description:
          "Vanishing-point Y, normalized to canvas height. 0 = top edge, 0.5 = middle, ~0.35 puts the horizon a third of the way down.",
      },
      {
        name: "curve",
        type: "number",
        default: "2",
        description:
          "Perspective curvature exponent. Higher values compress more rows near the horizon.",
      },
      {
        name: "farScale",
        type: "number",
        default: "0.25",
        description:
          "Cell scale at the horizon relative to the near row. Smaller values give a stronger depth illusion.",
      },
      {
        name: "fontScale",
        type: "number",
        default: "0.9",
        description:
          "Font size as a fraction of the cell width. Lower = airier glyphs with visible gaps; higher = packed.",
      },
      {
        name: "scrollSpeed",
        type: "number",
        default: "1",
        description: "How fast rows advance toward the camera.",
      },
      {
        name: "waveSpeed",
        type: "number",
        default: "1",
        description: "Speed of the wave ridge that lights cells across columns.",
      },
      {
        name: "wavePower",
        type: "number",
        default: "6",
        description:
          "Wave peak sharpness. Higher = thinner, brighter ridges; lower = soft glow over the whole grid.",
      },
      {
        name: "waveFrequency",
        type: "number",
        default: "3",
        description: "How many ridge crests fit across the grid horizontally.",
      },
      {
        name: "waveAmplitude",
        type: "number",
        default: "1.4",
        description:
          "Lateral wobble amplitude — how much each ridge curves with row depth.",
      },
      {
        name: "baseAlpha",
        type: "number",
        default: "0.07",
        description:
          "Baseline alpha applied to every glyph so the perspective grid is faintly visible at rest.",
      },
      {
        name: "colorSpeed",
        type: "number",
        default: "1",
        description: "Speed of the color cycle between `color1` and `color2`.",
      },
      {
        name: "color1",
        type: "string",
        default: '"#290596"',
        description: "Primary tone in the two-tone cycle.",
      },
      {
        name: "color2",
        type: "string",
        default: '"#93229D"',
        description: "Secondary tone in the two-tone cycle.",
      },
      {
        name: "background",
        type: "string",
        default: '"#000000"',
        description: "Background fill drawn each frame beneath the glyphs.",
      },
      {
        name: "opacity",
        type: "number",
        default: "1",
        description: "Multiplier applied to the final draw alpha.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the root container.",
      },
    ],
  },
  "orbit-cipher": {
    componentName: "OrbitCipher",
    usageCode: `import { OrbitCipher } from "@/components/lazy-ui/orbit-cipher";

export function Demo() {
  return (
    <div className="relative h-96 w-full overflow-hidden">
      <OrbitCipher effect="spiral" />
    </div>
  );
}`,
    api: [
      {
        name: "effect",
        type: '"ripple" | "spiral" | "vortex" | "pulse"',
        default: '"spiral"',
        description:
          "Radial pattern mode. `ripple` = concentric rings, `spiral` = arms twisting outward, `vortex` = arms with quadratic radial twist, `pulse` = radial pulses modulated by angular petals.",
      },
      {
        name: "characters",
        type: "string",
        default: '"0123456789ABCDEF"',
        description: "Glyph charset. Each cell picks one deterministically.",
      },
      {
        name: "columns",
        type: "number",
        default: "36",
        description: "Cells across the canvas. Cell width = canvasWidth / columns.",
      },
      {
        name: "rows",
        type: "number",
        default: "22",
        description: "Cells down the canvas.",
      },
      {
        name: "speed",
        type: "number",
        default: "1",
        description: "Overall animation speed multiplier.",
      },
      {
        name: "waveFrequency",
        type: "number",
        default: "1",
        description: "Spatial frequency of the radial wave — higher = more bands.",
      },
      {
        name: "wavePower",
        type: "number",
        default: "4",
        description: "Wave peak sharpness. Higher = thinner, brighter ridges.",
      },
      {
        name: "spiralArms",
        type: "number",
        default: "3",
        description: "Number of arms in `spiral`, `vortex`, and `pulse` modes.",
      },
      {
        name: "falloff",
        type: "number",
        default: "1.5",
        description:
          "Radial darkening exponent — higher concentrates brightness at the center.",
      },
      {
        name: "baseAlpha",
        type: "number",
        default: "0.05",
        description:
          "Baseline alpha so the grid is faintly visible everywhere, not only on ridges.",
      },
      {
        name: "colorSpeed",
        type: "number",
        default: "1",
        description: "Speed of the two-tone color cycle.",
      },
      {
        name: "glyphChurn",
        type: "number",
        default: "0.5",
        description:
          "How fast each cell cycles its glyph. Zero locks the charset to its initial pick.",
      },
      {
        name: "color1",
        type: "string",
        default: '"#7c3aed"',
        description: "Primary tone in the two-tone cycle.",
      },
      {
        name: "color2",
        type: "string",
        default: '"#22d3ee"',
        description: "Secondary tone in the two-tone cycle.",
      },
      {
        name: "background",
        type: "string",
        default: '"#000000"',
        description: "Background fill drawn each frame beneath the glyphs.",
      },
      {
        name: "opacity",
        type: "number",
        default: "1",
        description: "Multiplier applied to the final draw alpha.",
      },
      {
        name: "fontScale",
        type: "number",
        default: "0.9",
        description: "Font size as a fraction of the cell width.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the root container.",
      },
    ],
  },
  "orbit-bloom": {
    componentName: "OrbitBloom",
    usageCode: `import { OrbitBloom } from "@/components/lazy-ui/orbit-bloom";

export function Demo() {
  return (
    <div className="relative h-96 w-full overflow-hidden">
      <OrbitBloom effect="spiral" />
    </div>
  );
}`,
    api: [
      {
        name: "effect",
        type: '"ripple" | "spiral" | "vortex" | "pulse"',
        default: '"spiral"',
        description:
          "Radial pattern mode. `ripple` = concentric rings, `spiral` = arms uncoiling outward, `vortex` = log-radius arms with inverse spin, `pulse` = radial pulses modulated by angular petals.",
      },
      {
        name: "columns",
        type: "number",
        default: "28",
        description: "Cells across the canvas. Cell width = canvasWidth / columns.",
      },
      {
        name: "rows",
        type: "number",
        default: "18",
        description: "Cells down the canvas.",
      },
      {
        name: "speed",
        type: "number",
        default: "1",
        description: "Overall animation speed multiplier.",
      },
      {
        name: "waveFrequency",
        type: "number",
        default: "1",
        description: "Spatial frequency of the radial wave.",
      },
      {
        name: "wavePower",
        type: "number",
        default: "3",
        description: "Wave peak sharpness. Higher = thinner, brighter ridges.",
      },
      {
        name: "spiralArms",
        type: "number",
        default: "3",
        description: "Number of arms in `spiral`, `vortex`, and `pulse`.",
      },
      {
        name: "falloff",
        type: "number",
        default: "1.5",
        description:
          "Radial darkening exponent — higher concentrates brightness at the center.",
      },
      {
        name: "baseAlpha",
        type: "number",
        default: "0.06",
        description:
          "Baseline alpha so the shape grid is faintly visible everywhere.",
      },
      {
        name: "colorSpeed",
        type: "number",
        default: "1",
        description: "Speed of the two-tone color cycle.",
      },
      {
        name: "shape",
        type: "number",
        default: "0.4",
        description:
          "Base shape — 0 = full circle, 1 = full square, 0.5 = squircle. Per-cell shape also drifts with radius so the grid morphs outward from the center.",
      },
      {
        name: "shapeShift",
        type: "number",
        default: "0.3",
        description:
          "Speed at which the shape oscillates between circle and square over time. 0 disables the shift.",
      },
      {
        name: "fillRatio",
        type: "number",
        default: "0.8",
        description:
          "Shape side as a fraction of cell width at full intensity. Off-crest cells shrink to small dots.",
      },
      {
        name: "color1",
        type: "string",
        default: '"#7c3aed"',
        description: "Primary tone in the two-tone cycle.",
      },
      {
        name: "color2",
        type: "string",
        default: '"#f0abfc"',
        description: "Secondary tone in the two-tone cycle.",
      },
      {
        name: "background",
        type: "string",
        default: '"#000000"',
        description: "Background fill drawn each frame beneath the shapes.",
      },
      {
        name: "opacity",
        type: "number",
        default: "1",
        description: "Multiplier applied to the final draw alpha.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the root container.",
      },
    ],
  },
  "particle-halo": {
    componentName: "ParticleHalo",
    usageCode: `import { ParticleHalo } from "@/components/lazy-ui/particle-halo";

export function Demo() {
  return (
    <div className="relative h-[640px] w-full overflow-hidden rounded-2xl">
      <ParticleHalo
        colors={["#7c3aed", "#f5f3ff"]}
        shape="line"
        mode="wave"
        trail={0.85}
        radius={0.7}
        intensity={1}
        duration={16}
        className="absolute inset-0"
      />
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-7xl font-semibold tracking-tighter text-white">
        Build lazily.
      </span>
    </div>
  );
}`,
    api: [
      {
        name: "particleCount",
        type: "number",
        default: "1800",
        description:
          "How many particles ride the ring. Auto-halves to 1000 on viewports under 600 px on either axis. Larger counts give a denser ring at the cost of per-frame fill time.",
      },
      {
        name: "colors",
        type: "string[]",
        default: '["#a3a3a3","#f8f8f8"]',
        description:
          "Palette each particle samples from. Repeating an entry biases probability. Any number of CSS color strings — the customize panel exposes two free-pick slots; downstream you can pass more.",
      },
      {
        name: "shape",
        type: '"circle" | "square" | "line" | "spark"',
        default: '"circle"',
        description:
          "Particle render shape. `circle` and `square` read as dots; `line` draws a radial streak that lengthens with wave intensity (best paired with `trail` > 0 for a liquid look); `spark` is a perpendicular cross.",
      },
      {
        name: "mode",
        type: '"wave" | "pulse" | "spiral" | "chaos"',
        default: '"wave"',
        description:
          "How each particle samples the global progress. `wave` rolls a single wave around the ring; `pulse` breathes the entire ring in unison (no spatial offset); `spiral` runs three overlapping waves; `chaos` gives each particle a random phase so the ring shimmers without structure.",
      },
      {
        name: "trail",
        type: "number",
        default: "0",
        description:
          "Trail fade per frame (0–0.95). `0` clears the canvas fully each frame; higher values leave the previous frame visible underneath, smearing particles into dye-like streaks. Values around 0.85 with `shape=\"line\"` produce a liquid-reveal feel.",
      },
      {
        name: "radius",
        type: "number",
        default: "0.7",
        description:
          "Ring radius as a fraction of the canvas's smaller dimension. `0.5` is a tight inner ring; `1` packs particles against the canvas edge.",
      },
      {
        name: "intensity",
        type: "number",
        default: "1",
        description:
          "Multiplier on the radial breathing amplitude. `0` freezes the ring as a perfect circle; `2` doubles the peak drift so the wave swells well beyond the base radius.",
      },
      {
        name: "duration",
        type: "number",
        default: "16",
        description:
          "Seconds per full breathe cycle (shrink + grow). The wave's apparent rotation around the ring scales with this. Mouse-hover overrides the auto-cycle until the cursor is idle for 1 second.",
      },
      {
        name: "particleSize",
        type: "[number, number]",
        default: "[2, 8]",
        description:
          "Min / max particle diameter in pixels. Each particle picks one size in this range at build time.",
      },
      {
        name: "glow",
        type: "boolean",
        default: "true",
        description:
          "Applies a CSS `drop-shadow` filter to the canvas so each particle has a soft halo. Cheap — single GPU compositor pass. Toggle off for flat, crisp dots.",
      },
      {
        name: "glowColor",
        type: "string",
        default: "brightest entry in `colors`",
        description:
          "CSS color used by the glow drop-shadow. Defaults to the last entry in `colors`, which is usually the brightest.",
      },
      {
        name: "background",
        type: "string",
        default: '"#050505"',
        description:
          "Solid fill drawn beneath the particles each frame. The screen-blend particle pass paints over it, so use a dark color for a luminous effect.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description:
          "Extra class names merged onto the outer wrapper. Width and height are governed here — the canvas fills the container.",
      },
    ],
  },
  "aurora-mesh": {
    componentName: "AuroraMesh",
    usageCode: `import { AuroraMesh } from "@/components/lazy-ui/aurora-mesh";

export function Demo() {
  return (
    <AuroraMesh
      colors={["#050505", "#161616", "#525252", "#a3a3a3", "#f8f8f8"]}
      speed={0.3}
      wireframe
      mouseFollow
      ripple
      className="min-h-[520px] rounded-2xl"
    >
      <main className="relative z-10 max-w-md px-8 pt-24 pb-12">
        <h1 className="text-5xl leading-tight text-white">
          Build <span className="italic">lazily.</span>
        </h1>
        <p className="mt-3 text-sm text-white/70">
          The brightest anchor tracks your cursor. Click to ripple.
        </p>
      </main>
    </AuroraMesh>
  );
}`,
    api: [
      {
        name: "children",
        type: "ReactNode",
        default: "—",
        description:
          "Content rendered above the gradient. Wrapped in `relative z-10` so layout sits on top of the canvas.",
      },
      {
        name: "colors",
        type: "string[]",
        default: '["#050505","#161616","#525252","#a3a3a3","#f8f8f8"]',
        description:
          "Gradient anchor colors. 2–8 entries; each anchor drifts on its own lissajous curve. Default is the Lazy-ui silver ramp — pass your own palette to recolor without code changes.",
      },
      {
        name: "speed",
        type: "number",
        default: "0.3",
        description:
          "Animation speed multiplier. Multiplied into every anchor's drift frequency — `0` freezes the field on its starting positions.",
      },
      {
        name: "mouseFollow",
        type: "boolean",
        default: "true",
        description:
          "Smoothly pull the last (typically brightest) anchor toward the cursor while it's over the background. Eases back to center when the pointer leaves.",
      },
      {
        name: "mouseInfluence",
        type: "number",
        default: "0.6",
        description:
          "How tightly the followed anchor lerps toward the cursor (0–1). Lower values drag through honey; higher values snap.",
      },
      {
        name: "ripple",
        type: "boolean",
        default: "true",
        description:
          "Pointer-down on the background emits a single radial wavefront that warps the mesh for ~1.4s. New clicks replace the previous ripple.",
      },
      {
        name: "rippleStrength",
        type: "number",
        default: "0.06",
        description:
          "Ripple amplitude in UV units. Values past ~0.12 start to look psychedelic — keep under 0.1 for a polished feel.",
      },
      {
        name: "backgroundColor",
        type: "string",
        default: "first color",
        description:
          "Solid fill drawn behind the mesh and used as the reduced-motion fallback. Defaults to the first entry of `colors`.",
      },
      {
        name: "wireframe",
        type: "boolean",
        default: "false",
        description:
          "Adds a second overlay layer: faint contour bands inside the gradient plus a subtle grid masked toward the edges. Use sparingly — it doubles the visual density.",
      },
      {
        name: "wireframeOpacity",
        type: "number",
        default: "0.45",
        description:
          "Opacity of the wireframe overlay (0–1). Only applied when `wireframe` is on.",
      },
      {
        name: "grain",
        type: "number",
        default: "0.06",
        description:
          "Film-grain intensity blended over the gradient (0–0.3). Hides banding on 8-bit displays. Set to `0` for a perfectly clean fill.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description:
          "Extra class names merged onto the outermost wrapper. Width and height are governed here — the canvas fills the container.",
      },
    ],
  },
  "chroma-flow": {
    componentName: "ChromaFlow",
    usageCode: `import { ChromaFlow } from "@/components/lazy-ui/chroma-flow";

export function Demo() {
  return (
    <ChromaFlow
      palette="sunset"
      speed={0.5}
      density={13}
      flow={1}
      glow={0.55}
      vignette={0.55}
      grain={0.04}
      mouseInfluence={0.5}
      mouseFollow
      className="min-h-[640px] rounded-2xl"
    >
      <main className="relative z-10 max-w-md px-8 pt-24 pb-12">
        <h1 className="text-5xl leading-tight tracking-tight text-white">
          Backgrounds that
          <br />
          <span className="font-semibold italic">bend with you.</span>
        </h1>
        <p className="mt-3 text-sm text-white/80">
          Move the cursor — distortion peaks at a ring around it, like a
          black hole's accretion disk. Never just a hot point at the centre.
        </p>
      </main>
    </ChromaFlow>
  );
}`,
    api: [
      {
        name: "children",
        type: "ReactNode",
        default: "—",
        description:
          "Content rendered above the canvas. Wrapped in `relative z-10 h-full w-full` so centered layouts resolve.",
      },
      {
        name: "palette",
        type: '"sunset" | "electric" | "aurora" | "ocean" | "void" | "silver"',
        default: '"sunset"',
        description:
          "Color preset for the vertical rainbow gradient. Sampled top-to-bottom: index 0 sits at the top of the canvas, last stop at the bottom.",
      },
      {
        name: "colors",
        type: "string[]",
        default: "—",
        description:
          "Custom rainbow stops (2–6 entries). Accepts hex, `rgb()`/`rgba()`, or `hsl()`. Overrides `palette`.",
      },
      {
        name: "speed",
        type: "number",
        default: "0.5",
        description:
          "Animation speed multiplier. `0` freezes the streaks on their starting phase.",
      },
      {
        name: "density",
        type: "number",
        default: "13",
        description:
          "Vertical streak count — multiplied into the sine frequency. Higher = more, thinner streaks.",
      },
      {
        name: "flow",
        type: "number",
        default: "1",
        description:
          "How much the analytic flow + 4-octave fbm warp the streaks' X position (0–1). Smoothed internally — preset switches and slider drags glide between values instead of jumping. At `0` the streaks stand perfectly vertical.",
      },
      {
        name: "glow",
        type: "number",
        default: "0.55",
        description:
          "Soft bloom around the brightest streak pixels (0–1). Implemented as a `smoothstep(0.55, 1.0, streaks) * glow` lift on intensity.",
      },
      {
        name: "vignette",
        type: "number",
        default: "0.55",
        description:
          "Radial darkening at the canvas corners (0–1). `0` keeps the edges fully lit.",
      },
      {
        name: "grain",
        type: "number",
        default: "0.04",
        description:
          "Film-grain intensity (0–0.2). Gated by streak brightness so the dark gaps stay clean.",
      },
      {
        name: "mouseFollow",
        type: "boolean",
        default: "true",
        description:
          "Streaks bend around a ring centred on the cursor — distortion peaks at a fixed radius (≈0.24 UV) and tails off both inward and outward, like a black hole's accretion disk rather than a hot point at the pointer. Enter/leave ramps via a lerped active flag so the orbit fades in and out instead of snapping.",
      },
      {
        name: "mouseInfluence",
        type: "number",
        default: "0.5",
        description:
          "Strength of the ring distortion + orbital glow (0–1). Smoothed internally so prop changes interpolate over ~0.5s.",
      },
      {
        name: "backgroundColor",
        type: "string",
        default: "palette's bg",
        description:
          "Solid fill drawn behind the streaks. Defaults to the preset's background. Used as the reduced-motion CSS fallback base.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description:
          "Extra class names merged onto the outermost wrapper. Width and height are governed here — the canvas fills the container.",
      },
    ],
  },
  "prism-drift": {
    componentName: "PrismDrift",
    usageCode: `import { PrismDrift } from "@/components/lazy-ui/prism-drift";

export function Demo() {
  return (
    <PrismDrift
      palette="ember"
      layout="diagonal"
      softness={0.76}
      intensity={1.1}
      grain={0.2}
      speed={0.6}
      className="min-h-[520px] rounded-2xl"
    >
      <main className="relative z-10 flex h-full items-center justify-center px-6">
        <h1 className="text-center text-5xl font-light tracking-tight text-white">
          Backgrounds are awesome :)
        </h1>
      </main>
    </PrismDrift>
  );
}`,
    api: [
      {
        name: "children",
        type: "ReactNode",
        default: "—",
        description:
          "Content rendered above the canvas. Wrapped in `relative z-10` so layout sits on top of the gradient.",
      },
      {
        name: "palette",
        type: '"ember" | "iris" | "ocean" | "candy" | "void" | "silver"',
        default: '"ember"',
        description:
          "Color preset. Each preset is a multi-stop radial palette: index 0 sits at the corner (brightest), the last stop blends into the background at the falloff radius.",
      },
      {
        name: "colors",
        type: "string[]",
        default: "—",
        description:
          "Custom multi-stop palette (2–6 entries). Same convention as the presets: index 0 = bright inner stop, last = outer stop. Accepts hex, `rgb()`/`rgba()`, or `hsl()`. Overrides `palette`.",
      },
      {
        name: "layout",
        type: '"diagonal" | "anti-diagonal" | "corners"',
        default: '"diagonal"',
        description:
          "Which corners are lit. `diagonal` = top-right + bottom-left (matches the reference shape); `anti-diagonal` flips to top-left + bottom-right; `corners` lights all four.",
      },
      {
        name: "softness",
        type: "number",
        default: "0.72",
        description:
          "Glow falloff radius (0–1). Higher = blobs bleed further across the canvas. Internally maps to a Gaussian alpha falloff so the edge is always smooth.",
      },
      {
        name: "intensity",
        type: "number",
        default: "1.1",
        description:
          "Color brightness multiplier (0–2). At `1` the palette renders at its native brightness; above `1` lets the corners blow out for a hot-glow look.",
      },
      {
        name: "grain",
        type: "number",
        default: "0.18",
        description:
          "Grain dither amount (0–0.5). Modulated by local luminance — dark zones stay clean, the gradient edges acquire a gritty film-stock dither.",
      },
      {
        name: "speed",
        type: "number",
        default: "0.6",
        description:
          "Animation speed multiplier. `0` freezes the anchors on their corner positions.",
      },
      {
        name: "drift",
        type: "number",
        default: "0.05",
        description:
          "How far each anchor orbits its corner (0–0.2 in UV units). Independent phase per anchor so the blobs breathe asynchronously.",
      },
      {
        name: "mouseFollow",
        type: "boolean",
        default: "true",
        description:
          "Pointer subtly tugs the nearest anchor toward the cursor — keeps the orbital drift visible, just biased toward the pointer.",
      },
      {
        name: "mouseInfluence",
        type: "number",
        default: "0.4",
        description: "Cursor pull strength (0–1).",
      },
      {
        name: "backgroundColor",
        type: "string",
        default: "palette's bg",
        description:
          "Solid fill drawn behind the glows. Defaults to the preset's background (typically black). Used as the reduced-motion CSS fallback base.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description:
          "Extra class names merged onto the outermost wrapper. Width and height are governed here — the canvas fills the container.",
      },
    ],
  },
  "shadow-mesh": {
    componentName: "ShadowMesh",
    usageCode: `import { ShadowMesh } from "@/components/lazy-ui/shadow-mesh";

export function Demo() {
  return (
    <ShadowMesh
      color="#0a0a0a"
      backgroundColor="transparent"
      scale={0.55}
      speed={0.3}
      feather={0.45}
      turbulence={0.3}
      mouseFollow
      className="min-h-[520px] rounded-2xl"
    >
      <main className="relative z-10 max-w-md px-8 pt-24 pb-12">
        <h1 className="text-5xl leading-tight text-white">
          Quiet <span className="italic">drift.</span>
        </h1>
        <p className="mt-3 text-sm text-white/70">
          One soft mass, slowly billowing. Edges warped by FBM noise; the
          plume tracks your cursor through honey.
        </p>
      </main>
    </ShadowMesh>
  );
}`,
    api: [
      {
        name: "children",
        type: "ReactNode",
        default: "—",
        description:
          "Content rendered above the plume. Wrapped in `relative z-10` so layout sits on top of the canvas.",
      },
      {
        name: "color",
        type: "string",
        default: '"#0a0a0a"',
        description:
          "Fill color of the plume mass. Any CSS color works — the canvas premultiplies the alpha so the plume composites cleanly over whatever's behind.",
      },
      {
        name: "backgroundColor",
        type: "string",
        default: '"transparent"',
        description:
          "Solid fill drawn behind the plume. Defaults to transparent so the page background shows through; set to a hex/rgba value to lock the surface.",
      },
      {
        name: "scale",
        type: "number",
        default: "0.55",
        description:
          "Plume radius in UV units (0–1). Roughly the share of the smaller axis the mass occupies before edge feathering.",
      },
      {
        name: "speed",
        type: "number",
        default: "0.3",
        description:
          "Drift + turbulence speed multiplier. `0` freezes the field on its starting pose; honored by reduced-motion users automatically.",
      },
      {
        name: "feather",
        type: "number",
        default: "0.45",
        description:
          "Edge softness (0–1). Higher values dissolve the outer edge over a longer falloff for a softer, more nebulous look.",
      },
      {
        name: "turbulence",
        type: "number",
        default: "0.3",
        description:
          "How much FBM noise warps the plume's radius (0–1). `0` is a clean circle; higher values rough up the silhouette into wispy clouds.",
      },
      {
        name: "mouseFollow",
        type: "boolean",
        default: "true",
        description:
          "Smoothly pull the plume center toward the cursor while it's over the canvas. Eases back to its drift orbit when the pointer leaves.",
      },
      {
        name: "mouseInfluence",
        type: "number",
        default: "0.6",
        description:
          "How tightly the plume lerps toward the cursor (0–1). Lower values drag through honey; higher values snap.",
      },
      {
        name: "noise",
        type: "number",
        default: "0.06",
        description:
          "Film-grain intensity blended over the canvas (0–0.3). Hides banding on 8-bit displays. Set to `0` for a perfectly clean fill.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description:
          "Extra class names merged onto the outermost wrapper. Width and height are governed here — the canvas fills the container.",
      },
    ],
  },
  neumorphism: {
    componentName: "Neumorphism",
    usageCode: `import { Neumorphism } from "@/components/lazy-ui/neumorphism";

export function Demo() {
  return (
    <Neumorphism
      palette="pearl"
      layers={5}
      spread={93}
      radius={42}
      angle={205}
      softness={67}
      depth={2.9}
      glow={1.55}
      speed={0.7}
      sharpCorners={["top-right"]}
      className="min-h-[520px] rounded-2xl"
    >
      <main className="relative z-10 flex h-full items-center justify-center px-6">
        <h1
          className="text-5xl tracking-tight"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Build <span className="italic">softly.</span>
        </h1>
      </main>
    </Neumorphism>
  );
}`,
    api: [
      {
        name: "children",
        type: "ReactNode",
        default: "—",
        description:
          "Content rendered above the cascade. Wrapped in `relative z-10 h-full w-full` so centered layouts resolve.",
      },
      {
        name: "palette",
        type: '"pearl" | "bone" | "silver" | "graphite" | "obsidian" | "moonlight"',
        default: '"pearl"',
        description:
          "Color preset. Each preset bundles surface + highlight + shadow + a default rim-glow color — `pearl` matches the reference image, `bone` warms it toward cream, the last three flip the system to dark mode. `moonlight` runs cooler than `graphite`/`obsidian`.",
      },
      {
        name: "colors",
        type: "[string, string, string]",
        default: "—",
        description:
          "Custom palette as `[surface, highlight, shadow]`. Accepts hex, `rgb()`/`rgba()`. Overrides `palette`'s first three stops; the rim glow color stays from the palette unless `glowColor` is set.",
      },
      {
        name: "glowColor",
        type: "string",
        default: "palette's default",
        description:
          "Color of the orbital rim glow on each plate. Accepts hex, `rgb()`/`rgba()`. Overrides the palette's built-in glow stop — useful when you want to keep the surface tone but switch the lighting accent.",
      },
      {
        name: "layers",
        type: "number",
        default: "6",
        description:
          "Number of stacked plates (clamped 1–16). More plates = denser ridge field; fewer = a sparse staircase. Each new plate adds one ridge of cost.",
      },
      {
        name: "spread",
        type: "number",
        default: "36",
        description:
          "Spacing between consecutive plates in pixels. Wider spread reveals more of each plate's curve; narrow spread fuses adjacent ridges into a single soft band.",
      },
      {
        name: "radius",
        type: "number",
        default: "96",
        description:
          "Corner radius of each plate in pixels. Drives how curved the visible ridge edges read — high values produce big, lazy arcs; low values produce taut chevrons.",
      },
      {
        name: "angle",
        type: "number",
        default: "135",
        description:
          "Cascade direction in degrees. `0` = plates march right, `90` = down, `135` = down-right (the default — matches the canonical neumorphism light-from-top-left convention).",
      },
      {
        name: "softness",
        type: "number",
        default: "36",
        description:
          "Box-shadow blur in pixels. Higher values dissolve the ridges into a hazy gradient; lower values sharpen them into crisp lines.",
      },
      {
        name: "depth",
        type: "number",
        default: "1",
        description:
          "Shadow offset multiplier. Scales how far the highlight and shadow are pushed from each plate — read as how pronounced each ridge looks.",
      },
      {
        name: "glow",
        type: "number",
        default: "0.8",
        description:
          "Rim glow intensity (0–2). Drives the brightness of the orbital light blob clipped to each plate. `0` removes the moving glow entirely and leaves a pure neumorphic surface.",
      },
      {
        name: "speed",
        type: "number",
        default: "0.5",
        description:
          "Orbital animation speed multiplier — drives the rim-light orbit and the per-plate idle pulse. `0` freezes everything. Reduced-motion users see the static composition regardless.",
      },
      {
        name: "sharpCorners",
        type: '("top-left" | "top-right" | "bottom-right" | "bottom-left")[]',
        default: "[]",
        description:
          "Corners whose border-radius is dropped to 0 — useful for cutting a sharp edge on one side of the cascade. Pass any subset (e.g. `[\"top-left\"]` to square a single corner, `[\"top-left\", \"top-right\"]` for a flat top).",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description:
          "Extra class names merged onto the outermost wrapper. Width and height are governed here — the plates fill the container.",
      },
    ],
  },
  "slime-background": {
    componentName: "SlimeBackground",
    usageCode: `import { SlimeBackground } from "@/components/lazy-ui/slime-background";

export function Demo() {
  return (
    <SlimeBackground
      palette="toxic"
      speed={0.35}
      viscosity={0.85}
      shine={1}
      roughness={0.35}
      detail={1}
      contrast={0.5}
      mouseFollow
      className="min-h-[520px] rounded-2xl"
    >
      <main className="relative z-10 flex h-full items-center justify-center px-6">
        <h1 className="text-center text-5xl font-light tracking-tight text-white">
          Wet, slow, <span className="italic">alive.</span>
        </h1>
      </main>
    </SlimeBackground>
  );
}`,
    api: [
      {
        name: "children",
        type: "ReactNode",
        default: "—",
        description:
          "Content rendered above the canvas. Wrapped in `relative z-10 h-full w-full` so centered layouts resolve.",
      },
      {
        name: "palette",
        type: '"toxic" | "magma" | "azure" | "amber" | "silver"',
        default: '"toxic"',
        description:
          "Color preset. Each preset is three stops (deep, mid, peak) plus a highlight tint. `toxic` is the purple/green reference look; `silver` is the monochrome variant for surfaces that need to stay on-brand.",
      },
      {
        name: "colors",
        type: "string[]",
        default: "—",
        description:
          "Custom palette — 3 stops (deep, mid, peak), with an optional 4th entry for the specular highlight tint. Accepts hex, `rgb()`/`rgba()`. Overrides `palette`.",
      },
      {
        name: "speed",
        type: "number",
        default: "0.35",
        description:
          "Animation speed multiplier. `0` freezes the surface on its starting pose. Reduced-motion users get a static CSS gradient fallback regardless.",
      },
      {
        name: "viscosity",
        type: "number",
        default: "0.85",
        description:
          "Domain-warp depth (0–2). Higher = thicker, ropier swirls that loop back on themselves; lower = open, lazy currents. Drives the recursive fbm warp factor.",
      },
      {
        name: "shine",
        type: "number",
        default: "1",
        description:
          "Specular highlight intensity (0–2). The \"wet\" look. `0` removes the highlights entirely and leaves a flat, matte marble.",
      },
      {
        name: "roughness",
        type: "number",
        default: "0.35",
        description:
          "Surface roughness (0–1). Maps to the Blinn-Phong exponent: low values give mirror-like pinpoint hotspots, high values give soft satin sheens.",
      },
      {
        name: "detail",
        type: "number",
        default: "1",
        description:
          "Height amplitude of the marbling (0–2). Drives how pronounced the embossing is — peaks read brighter and the normal map produces stronger highlights.",
      },
      {
        name: "contrast",
        type: "number",
        default: "0.5",
        description:
          "Sharpness of the color bands between the three palette stops (0–1). `0` blurs into a smooth gradient; `1` cuts the colors into hard ropes of pigment.",
      },
      {
        name: "grain",
        type: "number",
        default: "0.04",
        description:
          "Film-grain intensity (0–0.2). Hides banding on 8-bit displays and sells the \"thick liquid\" texture.",
      },
      {
        name: "mouseFollow",
        type: "boolean",
        default: "true",
        description:
          "Pointer adds a Gaussian bulge to the height field — the slime dimples under the cursor like a finger pressing into pudding. Fades in and out on enter/leave so the dimple never snaps.",
      },
      {
        name: "mouseInfluence",
        type: "number",
        default: "0.6",
        description: "Bulge strength (0–1).",
      },
      {
        name: "backgroundColor",
        type: "string",
        default: "palette's bg",
        description:
          "Solid fill drawn behind the slime and beneath its lowest band. Defaults to the preset's background.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description:
          "Extra class names merged onto the outermost wrapper. Width and height are governed here — the canvas fills the container.",
      },
    ],
  },
  "bling-transition": {
    componentName: "BlingTransition",
    usageCode: `import { BlingTransition } from "@/components/lazy-ui/bling-transition";

export function Demo() {
  return (
    <BlingTransition
      imageA="/images/before.jpg"
      imageB="/images/after.jpg"
      palette="iris"
      duration={2400}
      hold={1200}
      intensity={0.005}
      iterations={4}
      sparkleStrength={1}
      softness={0.22}
      distortion={0.08}
      drip={0.55}
      direction="noise"
      className="h-[480px] w-full rounded-2xl"
    />
  );
}`,
    api: [
      {
        name: "imageA",
        type: "string",
        default: "—",
        description:
          "URL of the first image. Loaded via `THREE.TextureLoader` with `crossOrigin = anonymous`; `LinearFilter` and no mipmaps so the texture stays sharp.",
      },
      {
        name: "imageB",
        type: "string",
        default: "—",
        description:
          "URL of the second image. Same loader settings as `imageA`. Both must finish loading before the first frame paints.",
      },
      {
        name: "progress",
        type: "number",
        default: "—",
        description:
          "Controlled progress 0–1. When provided, the internal phase machine and autoPlay are bypassed — the parent fully owns the sweep.",
      },
      {
        name: "autoPlay",
        type: "boolean",
        default: "true",
        description:
          "Animate progress automatically through forward → hold → backward → hold → loop. Ignored when `progress` is supplied.",
      },
      {
        name: "duration",
        type: "number",
        default: "2400",
        description: "Full A → B sweep, in milliseconds.",
      },
      {
        name: "hold",
        type: "number",
        default: "1200",
        description:
          "How long to pause at each end of the sweep when looping, in milliseconds.",
      },
      {
        name: "loop",
        type: "boolean",
        default: "true",
        description:
          "Ping-pong forever. When `false`, the sweep plays once and stops at B.",
      },
      {
        name: "palette",
        type: '"iris" | "ember" | "ice" | "silver"',
        default: '"iris"',
        description:
          "Color palette for the sparkle bloom at the wipe boundary. Built from IQ's `a + b * cos(2π(c*t + d))` formula.",
      },
      {
        name: "intensity",
        type: "number",
        default: "0.005",
        description:
          "Sparkle-core brightness (≈ 0.001–0.02). Driven by `pow(intensity / |d|, 1.5)` so small bumps make a big visual difference.",
      },
      {
        name: "iterations",
        type: "number",
        default: "4",
        description:
          "Kaleidoscope fold count (1–6). More folds = more sparkle structure at the boundary.",
      },
      {
        name: "sparkleStrength",
        type: "number",
        default: "1",
        description:
          "How much the sparkle layer contributes at the boundary (0–2). The sparkle is multiplied by the boundary edge weight, so it only ever appears at the moving wipe — never on settled regions.",
      },
      {
        name: "softness",
        type: "number",
        default: "0.22",
        description:
          "Soft edge of the boundary mask. `0` is a hard wipe; `0.5` is a wide fade. The progress sweep itself is eased with `cubic-in-out`, so the overall motion stays gentle even at low softness.",
      },
      {
        name: "distortion",
        type: "number",
        default: "0.08",
        description:
          "UV refraction amplitude at the wipe boundary, in UV units. Bends both images at the moving edge for a glassy look.",
      },
      {
        name: "noiseScale",
        type: "number",
        default: "2.4",
        description:
          "Scale of the fbm field that drives the wipe shape. Higher = finer streaks.",
      },
      {
        name: "drip",
        type: "number",
        default: "0.55",
        description:
          "Direction bias (0 = pure noise blob, 1 = pure directional wipe).",
      },
      {
        name: "direction",
        type: '"noise" | "horizontal" | "vertical" | "radial"',
        default: '"noise"',
        description:
          "Direction the wipe sweeps in. `noise` ignores direction and uses pure fbm.",
      },
      {
        name: "onComplete",
        type: "() => void",
        default: "—",
        description:
          "Fires when the forward sweep finishes — and again at each end when looping.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description:
          "Extra class names merged onto the mount wrapper. Width and height are governed here — the canvas fills the container.",
      },
    ],
  },
  "grid-background": {
    componentName: "GridBackground",
    usageCode: `import { GridBackground } from "@/components/lazy-ui/grid-background";

export function Demo() {
  return (
    <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-neutral-950">
      <GridBackground
        variant="dots"
        size={24}
        dotSize={3}
        color="rgba(255,255,255,0.12)"
        fade="edges"
      />
      <div className="relative grid h-full place-items-center text-sm text-white/80">
        Crisp at any zoom level.
      </div>
    </div>
  );
}`,
    api: [
      {
        name: "variant",
        type: '"dots" | "lines" | "dashed" | "crosshair"',
        default: '"dots"',
        description:
          "Pattern variant. `dots` places a small circle at every intersection; `lines` draws solid grid lines; `dashed` adds a stroke dash; `crosshair` shows a small `+` at each intersection.",
      },
      {
        name: "size",
        type: "number",
        default: "24",
        description: "Cell size in pixels — the SVG pattern tile is `size × size`.",
      },
      {
        name: "lineWidth",
        type: "number",
        default: "1",
        description:
          "Stroke thickness for `lines`, `dashed`, and `crosshair`. Ignored for `dots`.",
      },
      {
        name: "dotSize",
        type: "number",
        default: "3",
        description: "Diameter of each dot for the `dots` variant.",
      },
      {
        name: "dashLength",
        type: "number",
        default: "3",
        description: "Length of each dash for the `dashed` variant.",
      },
      {
        name: "dashGap",
        type: "number",
        default: "5",
        description: "Gap between dashes for the `dashed` variant.",
      },
      {
        name: "crossSize",
        type: "number",
        default: "5",
        description:
          "Arm length of each crosshair. The full `+` is `crossSize * 2` across.",
      },
      {
        name: "color",
        type: "string",
        default: '"rgba(255,255,255,0.08)"',
        description: "Stroke / fill color. Any CSS color string.",
      },
      {
        name: "fade",
        type: '"none" | "edges" | "center" | "top" | "bottom"',
        default: '"none"',
        description:
          "Optional soft fade overlay. `edges` softens corners, `center` punches the middle, `top`/`bottom` create a directional fade. Implemented with a CSS `mask-image`, so the grid's antialiasing stays intact.",
      },
      {
        name: "fadeStrength",
        type: "number",
        default: "1",
        description:
          "Strength of the fade. `0` disables the mask; `1` is the full fade.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description:
          "Extra class names merged onto the root. The root is `pointer-events-none absolute inset-0` by default; drop it into any `relative` parent.",
      },
    ],
    credits: [
      {
        label: "SVG <pattern> element",
        href: "https://developer.mozilla.org/en-US/docs/Web/SVG/Element/pattern",
        description:
          "Tile primitive that gives this component its resolution independence.",
      },
    ],
  },
  "stack-list": {
    componentName: "StackList",
    usageCode: `import { StackList } from "@/components/lazy-ui/stack-list";

const items = [
  { id: 1, content: "New deploy passed checks." },
  { id: 2, content: "PR #482 ready for review." },
  { id: 3, content: "Daily report sent." },
];

export function Demo() {
  return (
    <StackList
      items={items}
      animation="blur"
      enterFrom="top"
      hoverEffect="lift"
      clickEffect="ripple"
      duration={0.65}
      autoInsertDelay={2200}
      maxItems={5}
      gap={12}
      stackDepth={3}
      stack={false}
      pauseOnHover={true}
      dismissOnSwipe={true}
    />
  );
}`,
    api: [
      {
        name: "items",
        type: "StackListItem[]",
        default: "—",
        description:
          "Array of `{ id, content }`. The first entry sits on top; later entries stack below it.",
      },
      {
        name: "animation",
        type: '"blur" | "scale" | "bounce"',
        default: '"blur"',
        description:
          "Entrance/exit animation. `blur` is a defocus → focus sweep; `scale` is a visible pop; `bounce` is a directional spring translate.",
      },
      {
        name: "enterFrom",
        type: '"top" | "bottom" | "left" | "right"',
        default: '"top"',
        description:
          "Direction items animate in from. Only consumed by `bounce`.",
      },
      {
        name: "duration",
        type: "number",
        default: "0.65",
        description:
          "Animation duration in seconds. Only consumed by `blur`; `bounce` and `scale` use spring transitions.",
      },
      {
        name: "easing",
        type: "[number, number, number, number]",
        default: "[0.22, 1, 0.36, 1]",
        description:
          "Cubic-bezier control points for non-spring animations. The default lands soft.",
      },
      {
        name: "align",
        type: '"top" | "center" | "bottom"',
        default: '"center"',
        description:
          "Vertical alignment of the list inside the container when there are fewer items than fit.",
      },
      {
        name: "autoInsertDelay",
        type: "number",
        default: "2000",
        description:
          "Delay between auto-inserted items in ms. `0` disables auto-insertion; the list then only mutates from props or `onDismiss`.",
      },
      {
        name: "maxItems",
        type: "number",
        default: "6",
        description:
          "Visible cap. When auto-insertion pushes past this number, the oldest card rolls off the bottom.",
      },
      {
        name: "pauseOnHover",
        type: "boolean",
        default: "false",
        description:
          "Pause auto-insertion while the pointer is over the list.",
      },
      {
        name: "hoverEffect",
        type: '"none" | "scale" | "lift"',
        default: '"none"',
        description:
          "Per-card hover effect. `lift` adds a soft translate-up with a deeper shadow.",
      },
      {
        name: "clickEffect",
        type: '"none" | "ripple" | "press"',
        default: '"none"',
        description:
          "Per-card click effect. `ripple` paints a soft radial from the click point; `press` applies a quick scale-down.",
      },
      {
        name: "stack",
        type: "boolean",
        default: "false",
        description:
          "Stack cards on top of each other (shadcn-toast style) instead of rendering them as a scrolling list. Hovering the container fans the stack out; the pointer leaving collapses it back. The stack anchors on the side `enterFrom` points to (top → anchored at top and fans downward, bottom → anchored at bottom and fans upward).",
      },
      {
        name: "stackDepth",
        type: "number",
        default: "3",
        description:
          "How many cards are visible in the stacked cascade (front card included). Older cards beyond this depth unmount. Only used when `stack` is true.",
      },
      {
        name: "dismissOnSwipe",
        type: "boolean",
        default: "false",
        description:
          "Enable horizontal drag-to-dismiss. The card reveals `Dismiss` hints once dragged past 40% of the threshold.",
      },
      {
        name: "dismissThreshold",
        type: "number",
        default: "100",
        description: "Pixel offset required to commit a dismiss on release.",
      },
      {
        name: "onDismiss",
        type: "(item: StackListItem) => void",
        default: "—",
        description:
          "Fires when a card commits a swipe dismiss. The card is removed from internal state before the callback runs.",
      },
      {
        name: "onItemClick",
        type: "(item: StackListItem) => void",
        default: "—",
        description:
          "Fires when a card is clicked or activated by `Enter` / `Space`. Providing this also turns the card into a focusable `button`.",
      },
      {
        name: "fadeEdges",
        type: "boolean",
        default: "false",
        description:
          "Render soft top/bottom fades. Requires a non-transparent `fadeColor` to be visible. List mode only.",
      },
      {
        name: "fadeSize",
        type: "number",
        default: "64",
        description: "Fade gradient height in pixels. List mode only.",
      },
      {
        name: "fadeColor",
        type: "string",
        default: '"transparent"',
        description:
          "Solid color the fade gradient resolves to. Set this to your container background to mask the scroll edges.",
      },
      {
        name: "gap",
        type: "number",
        default: "12",
        description: "Vertical gap between cards in pixels. List mode only.",
      },
      {
        name: "height",
        type: "string | number",
        default: '"min(600px, 80vh)"',
        description:
          "Container height. Numbers are emitted as `px`, strings pass through as raw CSS.",
      },
      {
        name: "renderItem",
        type: "(item: StackListItem) => ReactNode",
        default: "—",
        description:
          "Optional custom card renderer. Defaults to a neutral text row.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the root container.",
      },
      {
        name: "itemClassName",
        type: "string",
        default: "—",
        description:
          "Extra class names merged onto the outer frame of every card.",
      },
      {
        name: "innerClassName",
        type: "string",
        default: "—",
        description:
          "Extra class names merged onto the inner content surface of every card.",
      },
    ],
  },
  "orbit-mesh": {
    componentName: "OrbitMesh",
    usageCode: `import { OrbitMesh } from "@/components/lazy-ui/orbit-mesh";

export function Demo() {
  return (
    <div className="relative h-96 w-full overflow-hidden">
      <OrbitMesh effect="spiral" />
    </div>
  );
}`,
    api: [
      {
        name: "effect",
        type: '"ripple" | "spiral" | "vortex" | "pulse" | "wave" | "bloom"',
        default: '"spiral"',
        description:
          "Wave mode controlling the pulse formula. `ripple`/`spiral`/`vortex`/`pulse` share the Orbit Cipher family vocabulary; `wave` adds a non-radial horizontal sweep; `bloom` does a slow expanding burst with arm petals.",
      },
      {
        name: "speed",
        type: "number",
        default: "0.3",
        description: "Overall animation speed multiplier.",
      },
      {
        name: "scale",
        type: "number",
        default: "1.2",
        description:
          "Zoom of the visible wave field. Higher = bigger features (less crammed at center); lower = denser pattern.",
      },
      {
        name: "colorLayers",
        type: "number",
        default: "3",
        description:
          "Chromatic channel iterations (1–6). Layers 1–3 add R/G/B ghosts, 4–6 add C/M/Y — more layers = richer fringes.",
      },
      {
        name: "spiralArms",
        type: "number",
        default: "3",
        description: "Number of arms in `spiral`, `vortex`, and `pulse`.",
      },
      {
        name: "waveIntensity",
        type: "number",
        default: "0.18",
        description: "Radial displacement intensity at full ridge.",
      },
      {
        name: "spiralIntensity",
        type: "number",
        default: "0.6",
        description:
          "Tangential offset intensity — drives the spiral twist on top of the radial push.",
      },
      {
        name: "lineThickness",
        type: "number",
        default: "0.06",
        description:
          "Streak sharpness — numerator of `lineThickness / length(gridCell)`. Higher = thicker, blurrier streaks.",
      },
      {
        name: "falloff",
        type: "number",
        default: "0.5",
        description: "Radial darkening factor. Lower values flatten brightness across the canvas.",
      },
      {
        name: "brightness",
        type: "number",
        default: "1.5",
        description: "Overall brightness multiplier applied to the accumulated intensity.",
      },
      {
        name: "colorTint",
        type: "string",
        default: '"#c084fc"',
        description:
          "Tint multiplied into the accumulated channels. Higher `colorLayers` adds RGB then CMY ghosts that fan around this tint.",
      },
      {
        name: "background",
        type: "string",
        default: '"#000000"',
        description: "Background fill drawn each frame beneath the streaks.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the root container.",
      },
    ],
  },
  "ripple-surface": {
    componentName: "RippleSurface",
    usageCode: `import { RippleSurface } from "@/components/lazy-ui/ripple-surface";

export function Demo() {
  return (
    <RippleSurface
      palette="graphite"
      effect="drift"
      rings={4}
      sharpness={0.3}
      depth={1.25}
      speed={1.15}
      lightAngle={130}
      centerGlow={0.62}
      vignette={0.3}
      className="min-h-[520px] rounded-2xl"
    >
      <main className="relative z-10 flex h-full items-center justify-center px-6">
        <h1
          className="text-5xl tracking-tight text-white"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Build <span className="italic">quietly.</span>
        </h1>
      </main>
    </RippleSurface>
  );
}`,
    api: [
      {
        name: "children",
        type: "ReactNode",
        default: "—",
        description:
          "Content rendered above the canvas. Wrapped in `relative z-10 h-full w-full` so centered layouts resolve.",
      },
      {
        name: "palette",
        type: '"pearl" | "bone" | "linen" | "silver" | "mist" | "ocean" | "graphite" | "obsidian"',
        default: '"pearl"',
        description:
          "Color preset. Each preset is three stops (surface, highlight, shadow). `pearl` matches the soft near-white reference; `bone`/`linen` warm it; `mist`/`ocean` cool it; `graphite`/`obsidian` flip the surface to dark.",
      },
      {
        name: "colors",
        type: "[string, string, string]",
        default: "—",
        description:
          "Custom palette as `[surface, highlight, shadow]`. Accepts hex or `rgb()`/`rgba()`. Overrides `palette`.",
      },
      {
        name: "effect",
        type: '"outward" | "inward" | "breathe" | "drift"',
        default: '"outward"',
        description:
          "Animation pattern. `outward` and `inward` travel rings across the surface. `breathe` freezes the rings and pulses the shading intensity. `drift` keeps the rings still and rotates the light direction slowly.",
      },
      {
        name: "speed",
        type: "number",
        default: "1",
        description:
          "Animation speed multiplier. `0` freezes the surface on its starting pose. Reduced-motion users see a static radial gradient fallback regardless.",
      },
      {
        name: "rings",
        type: "number",
        default: "9",
        description:
          "Number of visible ring crests across the radius. More rings pack the surface tighter; fewer give big, lazy arcs.",
      },
      {
        name: "sharpness",
        type: "number",
        default: "1",
        description:
          "Ridge sharpness (0.2–4). Higher values pinch each ridge into a thinner, more defined band; lower values blur the ridges into a smooth gradient.",
      },
      {
        name: "depth",
        type: "number",
        default: "1",
        description:
          "Shading contrast (0–3). Drives how strongly each ridge picks up the directional highlight and shadow. `0` leaves a flat surface with only the center sheen and vignette.",
      },
      {
        name: "lightAngle",
        type: "number",
        default: "315",
        description:
          "Light direction in degrees. `0` = light from the right, `90` = below, `315` = top-right (the default — matches the canonical light-from-above-left look).",
      },
      {
        name: "centerGlow",
        type: "number",
        default: "0.18",
        description:
          "Center brightness lift (0–1). Subtle radial highlight pulled toward the origin — simulates an overhead key light catching the inner rings.",
      },
      {
        name: "vignette",
        type: "number",
        default: "0.2",
        description:
          "Vignette intensity at the corners (0–1). Fades toward the palette's shadow color in the far edges.",
      },
      {
        name: "originX",
        type: "number",
        default: "0.5",
        description:
          "Horizontal center of the rings, normalized 0–1. `0.5` is the middle, `0` pins the origin to the left edge.",
      },
      {
        name: "originY",
        type: "number",
        default: "0.5",
        description:
          "Vertical center of the rings, normalized 0–1. `0.5` is the middle, `0` pins the origin to the top edge.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description:
          "Extra class names merged onto the outermost wrapper. Width and height are governed here — the canvas fills the container.",
      },
    ],
  },
  "liquid-chrome": {
    componentName: "LiquidChrome",
    usageCode: `import { LiquidChrome } from "@/components/lazy-ui/liquid-chrome";

export function Demo() {
  return (
    <LiquidChrome
      palette="nightfire"
      speed={0.45}
      scale={0.8}
      warp={0.45}
      relief={0.85}
      tilt={45}
      highlight={1.45}
      roughness={0.58}
      ambient={0.28}
      mouseInfluence={0.24}
      className="min-h-[520px] rounded-2xl"
    >
      <main className="relative z-10 flex h-full items-center justify-center px-6">
        <h1
          className="text-5xl tracking-tight text-white"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Build <span className="italic">fluidly.</span>
        </h1>
      </main>
    </LiquidChrome>
  );
}`,
    api: [
      {
        name: "children",
        type: "ReactNode",
        default: "—",
        description:
          "Content rendered above the canvas. Wrapped in `relative z-10 h-full w-full` so centered layouts resolve.",
      },
      {
        name: "palette",
        type: '"nightfire" | "aurora" | "nebula" | "ember" | "chrome" | "mercury"',
        default: '"nightfire"',
        description:
          "Color preset. `nightfire` is the default inky liquid with gold + electric-blue studio lights; `aurora` swaps to teal+magenta; `nebula` is violet+cyan; `ember` is warm amber+red; `chrome` and `mercury` are polished silvers for a brighter mood.",
      },
      {
        name: "colors",
        type: "string[]",
        default: "—",
        description:
          "Custom 5-stop palette `[base, ambient, lightA, lightB, sparkle]`. Hex or `rgb()`/`rgba()`. Overrides `palette`.",
      },
      {
        name: "speed",
        type: "number",
        default: "0.45",
        description:
          "Animation speed multiplier. `0` freezes the surface on its starting pose. Reduced-motion users see a static radial gradient fallback regardless.",
      },
      {
        name: "scale",
        type: "number",
        default: "2.4",
        description:
          "Wave field scale. Higher values pack more swirls into the frame; lower values produce big lazy arcs of liquid.",
      },
      {
        name: "warp",
        type: "number",
        default: "1.3",
        description:
          "Domain-warp depth (0–3). Drives how tightly the liquid curls back on itself — `0` produces gentle cloud-like waves, higher values create dense ropy reflections.",
      },
      {
        name: "relief",
        type: "number",
        default: "0.85",
        description:
          "Surface relief (0.1–4). The implicit Z component of the normal. Lower values yield more mirror-like flat reflections; higher values emboss the surface deeper.",
      },
      {
        name: "tilt",
        type: "number",
        default: "0",
        description:
          "Rotation in degrees of the two-light pair around the canvas centre. `0` keeps light A upper-left and light B right-mid; larger values orbit them together.",
      },
      {
        name: "highlight",
        type: "number",
        default: "1.4",
        description:
          "Specular highlight intensity (0–3). Brightness of both reflected lights and the rim crescents along curl edges.",
      },
      {
        name: "roughness",
        type: "number",
        default: "0.12",
        description:
          "Surface roughness (0–1). `0` produces needle-sharp pinpoint glints; `1` smears them into a soft satin sheen across the whole crest.",
      },
      {
        name: "ambient",
        type: "number",
        default: "0.3",
        description:
          "Ambient base glow strength (0–1). Lifts the dead-black shadow so the unlit areas read as a single illuminated volume rather than empty space.",
      },
      {
        name: "mouseFollow",
        type: "boolean",
        default: "true",
        description:
          "When `true`, the cursor pushes a soft Gaussian bulge into the height field — the liquid stirs around the pointer.",
      },
      {
        name: "mouseInfluence",
        type: "number",
        default: "0.55",
        description:
          "Cursor stir strength (0–1). Multiplied by the active-pointer ease so the bulge fades back to neutral when the pointer leaves.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description:
          "Extra class names merged onto the outermost wrapper. Width and height are governed here — the canvas fills the container.",
      },
    ],
  },
  "pricing-1": {
    componentName: "Pricing1",
    usageCode: `import { Pricing1 } from "@/components/lazy-ui/blocks/pricing-1";

export function Demo() {
  return <Pricing1 />;
}`,
    api: [
      {
        name: "eyebrow",
        type: "string",
        default: '"Pricing"',
        description: "Uppercase mono label rendered above the heading.",
      },
      {
        name: "heading",
        type: "ReactNode",
        default: "—",
        description:
          "Heading content. Wrap a segment in `<em>` for the muted-italic accent.",
      },
      {
        name: "subhead",
        type: "string",
        default: "—",
        description: "Sub-heading paragraph beneath the title.",
      },
      {
        name: "tiers",
        type: "PricingTier[]",
        default: "DEFAULT_TIERS (3 entries)",
        description:
          "Three-tier list. Each tier: `{ name, price, per?, description, features, cta?, featured?, badge? }`.",
      },
      {
        name: "featuredIndex",
        type: "number",
        default: "1",
        description:
          "Index of the inverted (white-on-dark) tier card. 0 = first, 2 = last.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the root `<section>`.",
      },
    ],
  },
  "pricing-2": {
    componentName: "Pricing2",
    usageCode: `import { Pricing2 } from "@/components/lazy-ui/blocks/pricing-2";

export function Demo() {
  return <Pricing2 />;
}

// Control the period externally:
export function ControlledDemo() {
  const [period, setPeriod] = React.useState<"yearly" | "monthly">("yearly");
  return <Pricing2 period={period} onPeriodChange={setPeriod} />;
}`,
    api: [
      {
        name: "eyebrow",
        type: "string",
        default: '"Pricing"',
        description: "Uppercase mono label above the heading.",
      },
      {
        name: "heading",
        type: "ReactNode",
        default: "—",
        description: "Heading content with optional `<em>` accents.",
      },
      {
        name: "subhead",
        type: "string",
        default: "—",
        description: "Sub-heading paragraph (rendered above the savings badge).",
      },
      {
        name: "period",
        type: '"yearly" | "monthly"',
        default: '"yearly"',
        description:
          "Billing period (controlled). Falls back to internal state when omitted.",
      },
      {
        name: "onPeriodChange",
        type: '(p: "yearly" | "monthly") => void',
        default: "—",
        description: "Fires whenever the toggle pill is clicked.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the root `<section>`.",
      },
    ],
  },
  "pricing-3": {
    componentName: "Pricing3",
    usageCode: `import { Pricing3 } from "@/components/lazy-ui/blocks/pricing-3";

export function Demo() {
  return <Pricing3 />;
}`,
    api: [
      {
        name: "eyebrow",
        type: "string",
        default: '"Pricing"',
        description: "Uppercase mono label above the heading.",
      },
      {
        name: "heading",
        type: "ReactNode",
        default: "—",
        description: "Heading content with optional `<em>` accents.",
      },
      {
        name: "tiers",
        type: "PricingTier[]",
        default: "DEFAULT_TIERS (3 entries)",
        description: "Three-tier list. Same shape as pricing-1.",
      },
      {
        name: "featuredIndex",
        type: "number",
        default: "1",
        description: "Index of the inverted card.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the root `<section>`.",
      },
    ],
  },
  "pricing-4": {
    componentName: "Pricing4",
    usageCode: `import { Pricing4 } from "@/components/lazy-ui/blocks/pricing-4";

export function Demo() {
  return <Pricing4 />;
}`,
    api: [
      {
        name: "eyebrow",
        type: "string",
        default: '"Pricing · compare"',
        description: "Uppercase mono label above the heading.",
      },
      {
        name: "heading",
        type: "ReactNode",
        default: "—",
        description: "Heading content with optional `<em>` accents.",
      },
      {
        name: "matrix",
        type: "PricingMatrix",
        default: "DEFAULT_MATRIX",
        description:
          "Matrix data. Shape: `{ tiers: PricingTier[4], sections: { name, rows: [label, ...4-cells][] }[] }`. Cells can be string, boolean, or null.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the root `<section>`.",
      },
    ],
  },
  "pricing-5": {
    componentName: "Pricing5",
    usageCode: `import { Pricing5 } from "@/components/lazy-ui/blocks/pricing-5";

export function Demo() {
  return <Pricing5 />;
}`,
    api: [
      {
        name: "eyebrow",
        type: "string",
        default: '"Pricing · usage based"',
        description: "Uppercase mono label above the heading.",
      },
      {
        name: "heading",
        type: "ReactNode",
        default: "—",
        description: "Heading content with optional `<em>` accents.",
      },
      {
        name: "usage",
        type: "PricingUsageStop[]",
        default: "DEFAULT_USAGE (6 stops)",
        description:
          "Slider stops. Each: `{ name, users, projects, storage, price }`. `price: null` renders as 'Custom'.",
      },
      {
        name: "defaultTier",
        type: "number",
        default: "2",
        description: "Initial slider index (0 = first stop).",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the root `<section>`.",
      },
    ],
  },
  "matrix-grid": {
    componentName: "MatrixGrid",
    usageCode: `import { MatrixGrid } from "@/components/lazy-ui/matrix-grid";

export function Demo() {
  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-2xl bg-black">
      <MatrixGrid
        className="absolute inset-0"
        colors={["#d4d4d4", "#ffffff"]}
        dotSize={3}
        gap={4}
        revealAngle={0}
        coverage={1}
        trigger="instant"
        animate={{ name: "ripple", duration: 3, intensity: 10, loop: true }}
      />
    </div>
  );
}`,
    api: [
      {
        name: "colors",
        type: "string[]",
        default: '["#d4d4d4"]',
        description:
          "Pool of CSS colors sampled randomly per dot. Pass 1 for a flat field, 2+ for a salt-and-pepper mix.",
      },
      {
        name: "dotSize",
        type: "number",
        default: "3",
        description: "Side length of each dot in CSS pixels.",
      },
      {
        name: "gap",
        type: "number",
        default: "3",
        description: "Empty space between dots, in CSS pixels.",
      },
      {
        name: "coverage",
        type: "number",
        default: "1",
        description:
          "Fraction (0..1) of the canvas covered by dots, measured along `revealAngle`. `coverage=0.5` + `revealAngle=180` fills only the lower half. Edge softens automatically.",
      },
      {
        name: "revealAngle",
        type: "number",
        default: "0",
        description:
          "Direction the reveal sweep originates from, in degrees clockwise from the top. 0 = top, 90 = right, 180 = bottom, 270 = left. Each dot fades in inside its own small window along the sweep, eased out so the front feels smooth.",
      },
      {
        name: "trigger",
        type: '"instant" | "mount" | "hover" | "click"',
        default: '"instant"',
        description:
          "When the reveal animation runs. `mount` plays once on load; `hover`/`click` toggle and play in reverse on release.",
      },
      {
        name: "speed",
        type: "number",
        default: "1",
        description:
          "Reveal speed multiplier — higher values shorten the cubic ease-in.",
      },
      {
        name: "flicker",
        type: "boolean",
        default: "false",
        description:
          "Soft per-dot opacity oscillation between 60% and 100% of base alpha.",
      },
      {
        name: "animate",
        type: "MatrixAnimateConfig | undefined",
        default: "undefined",
        description:
          "Optional animate effect. `ripple` travels concentric rings from center; `diagonal` sweeps a Gaussian band along the canvas diagonal; `sparkle` twinkles each dot on its own clock (continuous, ignores `loop` and `delay`). Wave amplitudes ease in and out per cycle so nothing pops.",
      },
      {
        name: "fps",
        type: "number",
        default: "60",
        description:
          "Render frame-rate cap. Lower this for very large grids or to save battery on idle pages.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the root container.",
      },
    ],
    credits: [
      {
        label: "once-ui MatrixFx",
        href: "https://github.com/once-ui-system/core/blob/main/packages/core/src/components/MatrixFx.tsx",
        description:
          "Original concept — reveal-from-origin dot canvas with ripple/wave displacement. This rewrite slims the render to a single path, swaps a paramsRef for prop-driven restarts, and adds the cursor + pulse shapes.",
      },
    ],
  },
  "border-glow": {
    componentName: "BorderGlow",
    usageCode: `import { BorderGlow } from "@/components/lazy-ui/border-glow";

// In "cursor" mode every card listens to the pointer, so a whole grid
// lights up wherever the cursor goes — not just the card under it.
export function Demo() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {["Own every line.", "Install via URL.", "Animated by default.", "Typed & accessible."].map(
        (title) => (
          <BorderGlow
            key={title}
            mode="cursor"
            cursorRadius={180}
            colors={["#a78bfa", "#f0abfc", "#67e8f9"]}
            radius={16}
          >
            <div className="p-6">
              <h3 className="text-base font-semibold text-white">{title}</h3>
            </div>
          </BorderGlow>
        ),
      )}
    </div>
  );
}`,
    api: [
      {
        name: "mode",
        type: '"auto" | "cursor" | "hover"',
        default: '"auto"',
        description:
          '"auto" sweeps a soft gradient arc around the border on a loop. "cursor" points the arc toward the pointer and fades it in by proximity even from outside the card — so a whole grid lights up at once. "hover" does the same but only while the pointer is over this card.',
      },
      {
        name: "colors",
        type: "string[]",
        default: '["#a78bfa","#f0abfc","#67e8f9"]',
        description:
          "Colors blended around the border ring. The travelling arc reveals whichever stretch it passes over. Two or more read best.",
      },
      {
        name: "thickness",
        type: "number",
        default: "1.5",
        description: "Border width in CSS pixels.",
      },
      {
        name: "radius",
        type: "number",
        default: "20",
        description: "Corner radius in CSS pixels, inherited by every layer.",
      },
      {
        name: "coneSpread",
        type: "number",
        default: "58",
        description:
          "Half-width of the lit arc in degrees. Smaller values give a tight comet; larger ones light most of the rim.",
      },
      {
        name: "glowSize",
        type: "number",
        default: "22",
        description:
          "Outer glow blur radius in CSS pixels — the soft halo around the lit arc. 0 keeps just the crisp arc with no halo.",
      },
      {
        name: "intensity",
        type: "number",
        default: "1",
        description:
          "Overall brightness multiplier for the arc and its glow. Lower keeps the effect subtle.",
      },
      {
        name: "speed",
        type: "number",
        default: "1",
        description: "Sweep speed multiplier — auto mode only.",
      },
      {
        name: "cursorRadius",
        type: "number",
        default: "200",
        description:
          "Cursor mode only. Activation distance in CSS pixels measured from the card's edges — the arc lights within this distance and fades out beyond it.",
      },
      {
        name: "bling",
        type: "boolean",
        default: "true",
        description:
          "Toggle the bling — twinkles that appear only while the card is hovered, clustered at the lit border point (not across the whole card). Suppressed under reduced motion.",
      },
      {
        name: "sparkleCount",
        type: "number",
        default: "8",
        description: "How many bling twinkles to render. 0 disables them.",
      },
      {
        name: "seed",
        type: "number",
        default: "1",
        description:
          "Seed for the bling offsets. The same seed renders the same scatter, so it stays hydration-stable.",
      },
      {
        name: "background",
        type: "string",
        default: '"#0b0b0f"',
        description:
          "Inner surface fill behind the content. Keep it dark so the border and glow read against it.",
      },
      {
        name: "children",
        type: "ReactNode",
        default: "—",
        description: "Content rendered on the inner surface.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Extra class names merged onto the root container.",
      },
    ],
  },
};

export function contentFor(slug: string): ComponentContent | undefined {
  return COMPONENT_CONTENT[slug];
}
